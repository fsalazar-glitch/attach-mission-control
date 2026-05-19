/* attach-os override — Apple-style Kanban with native HTML5 drag&drop + group-by */
'use client'

import { useState, useRef } from 'react'
import { KanbanCard } from './kanban-card'
import { KanbanFilters, type GroupBy, type KanbanFiltersState } from './kanban-filters'
import { applyFilters, groupTasks } from '@/lib/hooks/use-kanban-filters'

interface Task {
  id: number
  title: string
  status: string
  priority: 'low' | 'medium' | 'high' | 'critical' | 'urgent'
  assigned_to?: string
  project_prefix?: string
  project_ticket_no?: number
  description?: string
}

interface BoardColumn {
  id: string
  name: string
  position: number
  isDone?: boolean
}

interface Props {
  tasks: Task[]
  columns: BoardColumn[]
  agents: { id: string; name: string }[]
  projects: { prefix: string; name: string }[]
  onTaskMove: (taskId: number, toColumnId: string) => Promise<void>
}

function KanbanColumn({
  column,
  tasks,
  onDrop,
}: {
  column: BoardColumn
  tasks: Task[]
  onDrop: (taskId: number, colId: string) => void
}) {
  const [isOver, setIsOver] = useState(false)
  const dragCounter = useRef(0)

  return (
    <div
      className={`flex flex-col min-w-[280px] snap-start transition-colors rounded-xl ${isOver ? 'bg-muted/40 ring-2 ring-primary/30' : ''}`}
      onDragOver={e => { e.preventDefault() }}
      onDragEnter={e => { e.preventDefault(); dragCounter.current++; setIsOver(true) }}
      onDragLeave={() => { dragCounter.current--; if (dragCounter.current === 0) setIsOver(false) }}
      onDrop={e => {
        e.preventDefault()
        dragCounter.current = 0
        setIsOver(false)
        const id = Number(e.dataTransfer.getData('taskId'))
        if (id) onDrop(id, column.id)
      }}
    >
      <div className="flex items-center justify-between px-2 mb-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {column.name} · {tasks.length}
        </p>
      </div>
      <div className="space-y-2">
        {tasks.map(t => (
          <div
            key={t.id}
            draggable
            onDragStart={e => { e.dataTransfer.setData('taskId', String(t.id)); e.dataTransfer.effectAllowed = 'move' }}
          >
            <KanbanCard task={t} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function KanbanBoard({ tasks, columns, agents, projects, onTaskMove }: Props) {
  const [filters, setFilters] = useState<KanbanFiltersState>({ search: '' })
  const [groupBy, setGroupBy] = useState<GroupBy>('status')

  const visibleTasks = applyFilters(tasks, filters)
  const grouped = groupTasks(visibleTasks, groupBy)

  const displayColumns: BoardColumn[] = groupBy === 'status'
    ? [...columns].sort((a, b) => a.position - b.position)
    : Object.keys(grouped).map((key, i) => ({ id: key, name: key, position: i }))

  const handleDrop = async (taskId: number, toColId: string) => {
    if (groupBy !== 'status') return
    await onTaskMove(taskId, toColId)
  }

  return (
    <div className="flex flex-col h-full">
      <KanbanFilters
        filters={filters}
        groupBy={groupBy}
        onFiltersChange={setFilters}
        onGroupByChange={setGroupBy}
        agents={agents}
        projects={projects}
      />
      <div className="flex-1 px-4 md:px-6 pb-6 pt-4 overflow-x-auto">
        <div className="flex gap-4 md:gap-6 min-w-max snap-x md:snap-none">
          {displayColumns.map(col => (
            <KanbanColumn
              key={col.id}
              column={col}
              tasks={grouped[col.id] ?? []}
              onDrop={handleDrop}
            />
          ))}
        </div>
      </div>
    </div>
  )
}