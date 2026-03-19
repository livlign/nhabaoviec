import type { Todo, TodoUpdate } from '@/types'
import type { Filters } from './TodoFilters'
import { TodoItem } from './TodoItem'

interface TodoListProps {
  todos: Todo[]
  filters: Filters
  onUpdate: (update: TodoUpdate) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

function filterAndSort(todos: Todo[], filters: Filters): Todo[] {
  let filtered = todos

  if (filters.status !== 'all') {
    filtered = filtered.filter((t) => t.status === filters.status)
  }

  if (filters.priority !== 'all') {
    filtered = filtered.filter((t) => t.priority === filters.priority)
  }

  return filtered.sort((a, b) => {
    if (filters.sortBy === 'priority') {
      if (a.priority !== b.priority) return a.priority - b.priority
      if (a.due_date && b.due_date) return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      if (a.due_date) return -1
      if (b.due_date) return 1
      return 0
    }

    if (filters.sortBy === 'due_date') {
      if (a.due_date && b.due_date) return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      if (a.due_date) return -1
      if (b.due_date) return 1
      return 0
    }

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

export function TodoList({ todos, filters, onUpdate, onDelete }: TodoListProps) {
  const sorted = filterAndSort(todos, filters)

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mb-4 relative flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 rotate-45 rounded-xl border-2 border-dashed border-ink-700" />
          <svg className="relative h-7 w-7 text-parchment-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="font-display text-sm font-semibold text-parchment-faint">No tasks found</p>
        <p className="mt-1 text-xs text-parchment-faint/60">Try adjusting your filters or add a new task</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {sorted.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </div>
  )
}
