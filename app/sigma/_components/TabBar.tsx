'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { renameFavoriteTab, deleteFavoriteTab, reorderFavoriteTabs } from '@/features/favorite'
import type { FavoriteTab } from '@/features/favorite'
import { cn } from '@/shared/lib/cn'
import CreateTabModal from './CreateTabModal'

// ─── DeleteConfirmModal ───────────────────────────────────────

interface DeleteConfirmProps {
  tabName: string
  onConfirm: () => void
  onCancel: () => void
}

const DeleteConfirmModal = ({ tabName, onConfirm, onCancel }: DeleteConfirmProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
    <div className="relative z-10 bg-card border border-edge rounded-2xl shadow-2xl w-full mx-4 sm:w-[360px] p-6 space-y-4">
      <p className="text-sm font-semibold text-ink-1">탭 삭제</p>
      <p className="text-xs text-ink-3 leading-relaxed">
        <span className="font-medium text-ink-2">&ldquo;{tabName}&rdquo;</span> 탭을 삭제하면
        이 탭에 있는 즐겨찾기 종목도 모두 삭제됩니다. 계속하시겠습니까?
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-edge px-4 py-2.5 text-sm text-ink-3 hover:text-ink-1 hover:border-ink-3 transition-colors"
        >
          취소
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 rounded-xl bg-red-500/80 px-4 py-2.5 text-sm text-white font-medium hover:bg-red-500 transition-colors"
        >
          삭제
        </button>
      </div>
    </div>
  </div>
)

// ─── SortableTab ─────────────────────────────────────────────

interface SortableTabProps {
  tab: FavoriteTab
  isActive: boolean
  existingNames: string[]
  onActivate: () => void
  onRename: (name: string) => void
  onDelete: () => void
}

const SortableTab = ({ tab, isActive, existingNames, onActivate, onRename, onDelete }: SortableTabProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tab.id,
  })
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(tab.name)
  const inputRef = useRef<HTMLInputElement>(null)

  const isDuplicate = editValue.trim() !== tab.name && existingNames.some(n => n === editValue.trim())

  const enterEdit = () => {
    setEditValue(tab.name)
    setIsEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  const commitEdit = () => {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== tab.name && !isDuplicate) onRename(trimmed)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { if (!isDuplicate) commitEdit() }
    if (e.key === 'Escape') setIsEditing(false)
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="shrink-0"
    >
      {isEditing ? (
        // 편집 모드: 동일한 h-9 높이 유지 → 레이아웃 시프팅 방지
        <div className={cn(
          'flex items-center gap-1.5 h-9 px-2 border-b-2 -mb-px',
          isDuplicate ? 'border-red-500/70' : 'border-ink-3',
        )}>
          <input
            ref={inputRef}
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            maxLength={10}
            autoFocus
            className="w-[90px] h-full bg-transparent text-xs text-ink-1 focus:outline-none placeholder:text-ink-4"
          />
          {/* onMouseDown + preventDefault: blur race condition 방지 */}
          <button
            type="button"
            onMouseDown={e => { e.preventDefault(); onDelete() }}
            className="flex items-center justify-center p-1 text-ink-4 hover:text-red-400 transition-colors shrink-0"
            aria-label="탭 삭제"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onActivate}
          onDoubleClick={enterEdit}
          {...attributes}
          {...listeners}
          className={cn(
            'h-9 px-4 -mb-px text-xs font-medium border-b-2 whitespace-nowrap transition-colors',
            'touch-none select-none cursor-grab active:cursor-grabbing',
            isActive
              ? 'border-ink-1 text-ink-1'
              : 'border-transparent text-ink-4 hover:text-ink-2 hover:border-edge',
          )}
        >
          {tab.name}
        </button>
      )}
    </div>
  )
}

// ─── TabBar ──────────────────────────────────────────────────

interface Props {
  tabs: FavoriteTab[]
  activeTabId: string
  onTabChange: (tabId: string) => void
  onTabCreated: (tabId: string) => void
}

const TabBar = ({ tabs, activeTabId, onTabChange, onTabCreated }: Props) => {
  const [orderedTabs, setOrderedTabs] = useState(tabs)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [pendingDeleteTab, setPendingDeleteTab] = useState<FavoriteTab | null>(null)
  const [, startTransition] = useTransition()
  const router = useRouter()

  // tabs prop 변경 시 동기화 (서버 리렌더 후)
  const prevTabsRef = useRef(tabs)
  useEffect(() => {
    if (prevTabsRef.current !== tabs) {
      prevTabsRef.current = tabs
      setOrderedTabs(tabs)
    }
  }, [tabs])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = orderedTabs.findIndex(t => t.id === active.id)
    const newIndex = orderedTabs.findIndex(t => t.id === over.id)
    const newOrder = arrayMove(orderedTabs, oldIndex, newIndex)
    setOrderedTabs(newOrder)
    startTransition(() => {
      reorderFavoriteTabs(newOrder.map(t => t.id))
    })
  }

  const handleRename = (tabId: string, name: string) => {
    startTransition(() => {
      renameFavoriteTab(tabId, name)
    })
  }

  const handleDeleteConfirm = () => {
    if (!pendingDeleteTab) return
    const tabId = pendingDeleteTab.id
    setPendingDeleteTab(null)

    // Optimistic: 탭 바에서 즉시 제거 + 필요 시 탭 전환
    const remaining = orderedTabs.filter(t => t.id !== tabId)
    setOrderedTabs(remaining)
    if (activeTabId === tabId && remaining.length > 0) {
      onTabChange(remaining[0].id)
    }

    // Background: 서버 삭제 + 캐시 무효화
    startTransition(async () => {
      await deleteFavoriteTab(tabId)
      router.refresh()
    })
  }

  return (
    <>
      {/* border-b가 탭 언더라인의 베이스라인 역할 */}
      <div className="flex items-end border-b border-edge overflow-x-auto scrollbar-hide">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={orderedTabs.map(t => t.id)} strategy={horizontalListSortingStrategy}>
            {orderedTabs.map(tab => (
              <SortableTab
                key={tab.id}
                tab={tab}
                isActive={tab.id === activeTabId}
                existingNames={orderedTabs.filter(t => t.id !== tab.id).map(t => t.name)}
                onActivate={() => onTabChange(tab.id)}
                onRename={name => handleRename(tab.id, name)}
                onDelete={() => setPendingDeleteTab(tab)}
              />
            ))}
          </SortableContext>
        </DndContext>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="shrink-0 h-9 px-3 -mb-px text-base leading-none text-ink-4 hover:text-ink-2 border-b-2 border-transparent transition-colors"
          aria-label="탭 추가"
        >
          +
        </button>
      </div>

      {showCreateModal && (
        <CreateTabModal
          existingNames={orderedTabs.map(t => t.name)}
          onClose={() => setShowCreateModal(false)}
          onCreated={tabId => {
            setShowCreateModal(false)
            onTabCreated(tabId)
          }}
        />
      )}

      {pendingDeleteTab && (
        <DeleteConfirmModal
          tabName={pendingDeleteTab.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setPendingDeleteTab(null)}
        />
      )}
    </>
  )
}

export default TabBar
