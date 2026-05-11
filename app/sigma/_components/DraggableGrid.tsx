'use client'

import { useState } from 'react'
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
import { reorderFavorites } from '@/features/favorite'
import type { ReactNode, HTMLAttributes } from 'react'

const GripHandle = (props: HTMLAttributes<HTMLDivElement>) => (
  <div
    {...props}
    className="absolute top-2.5 right-2.5 z-10 p-1 rounded cursor-grab active:cursor-grabbing text-ink-4 opacity-30 hover:opacity-80 transition-opacity touch-none"
    aria-label="순서 변경"
  >
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <circle cx="4"  cy="2"  r="1.3" />
      <circle cx="4"  cy="7"  r="1.3" />
      <circle cx="4"  cy="12" r="1.3" />
      <circle cx="10" cy="2"  r="1.3" />
      <circle cx="10" cy="7"  r="1.3" />
      <circle cx="10" cy="12" r="1.3" />
    </svg>
  </div>
)

interface SortableItemProps {
  id: string
  children: ReactNode
}

const SortableItem = ({ id, children }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="relative"
      {...attributes}
    >
      <GripHandle {...listeners} />
      {children}
    </div>
  )
}

interface Props {
  initialSymbols: string[]
  cards: ReactNode[]
}

const DraggableGrid = ({ initialSymbols, cards }: Props) => {
  const [symbols, setSymbols] = useState(initialSymbols)

  const cardMap = Object.fromEntries(
    initialSymbols.map((sym, i) => [sym, cards[i]])
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = symbols.indexOf(active.id as string)
    const newIndex = symbols.indexOf(over.id as string)
    const newOrder = arrayMove(symbols, oldIndex, newIndex)
    setSymbols(newOrder)
    reorderFavorites(newOrder)
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={symbols} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {symbols.map(sym => (
            <SortableItem key={sym} id={sym}>
              {cardMap[sym]}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

export default DraggableGrid
