'use client'

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
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { FavoriteTab } from '@/features/favorite'
import type { ReactNode } from 'react'
import CardMenu from './CardMenu'

// 카드 상단 핸들 영역(h-9=36px)에 맞는 가로형 3×2 그립 아이콘
const GripIcon = () => (
  <svg width="20" height="8" viewBox="0 0 20 8" fill="currentColor">
    <circle cx="4"  cy="2" r="1.3" />
    <circle cx="10" cy="2" r="1.3" />
    <circle cx="16" cy="2" r="1.3" />
    <circle cx="4"  cy="6" r="1.3" />
    <circle cx="10" cy="6" r="1.3" />
    <circle cx="16" cy="6" r="1.3" />
  </svg>
)

interface SortableItemProps {
  id: string
  children: ReactNode
  tabId: string
  tabs: FavoriteTab[]
  onMoveCard: (symbol: string, toTabId: string) => void
  onRemoveCard: (symbol: string) => void
}

const SortableItem = ({ id, children, tabId, tabs, onMoveCard, onRemoveCard }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="relative"
      {...attributes}
    >
      {/* DnD 핸들: 카드 상단 전체 너비, 중앙 정렬 */}
      <div
        {...listeners}
        className="absolute top-0 left-0 right-0 h-9 z-10 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none text-ink-4 opacity-60 hover:opacity-100 transition-opacity rounded-t-2xl"
        aria-label="순서 변경"
      >
        <GripIcon />
      </div>
      {/* ... 메뉴: 타이틀 행 우측 (top-9 = h-9 바로 아래, right-3.5 = 카드 px 패딩과 동일) */}
      <div className="absolute top-9 right-3.5 z-10">
        <CardMenu
          symbol={id}
          currentTabId={tabId}
          tabs={tabs}
          onMove={toTabId => onMoveCard(id, toTabId)}
          onRemove={() => onRemoveCard(id)}
        />
      </div>
      {children}
    </div>
  )
}

interface Props {
  symbols: string[]
  allCardsBySymbol: Record<string, ReactNode>
  tabId: string
  tabs: FavoriteTab[]
  onReorder: (tabId: string, newOrder: string[]) => void
  onMoveCard: (symbol: string, toTabId: string) => void
  onRemoveCard: (symbol: string) => void
}

const DraggableGrid = ({ symbols, allCardsBySymbol, tabId, tabs, onReorder, onMoveCard, onRemoveCard }: Props) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = symbols.indexOf(active.id as string)
    const newIndex = symbols.indexOf(over.id as string)
    onReorder(tabId, arrayMove(symbols, oldIndex, newIndex))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={symbols} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {symbols.map(sym => (
            <SortableItem
              key={sym}
              id={sym}
              tabId={tabId}
              tabs={tabs}
              onMoveCard={onMoveCard}
              onRemoveCard={onRemoveCard}
            >
              {allCardsBySymbol[sym]}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

export default DraggableGrid
