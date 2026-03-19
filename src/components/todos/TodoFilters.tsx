import type { TodoStatus, Priority } from '@/types'

export interface Filters {
  status: TodoStatus | 'all'
  priority: Priority | 'all'
  sortBy: 'priority' | 'due_date' | 'created_at'
}

interface TodoFiltersProps {
  filters: Filters
  onChange: (filters: Filters) => void
  todoCount: number
  doneCount: number
}

const statusOptions: { value: Filters['status']; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'todo', label: 'Active' },
  { value: 'done', label: 'Done' },
  { value: 'cancel', label: 'Cancelled' },
]

export function TodoFilters({ filters, onChange, todoCount, doneCount }: TodoFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Status tabs */}
      <div className="flex gap-1 rounded-xl bg-ink-900 border border-ink-800 p-1">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange({ ...filters, status: opt.value })}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              filters.status === opt.value
                ? 'bg-ink-700 text-parchment shadow-sm'
                : 'text-parchment-faint hover:text-parchment-muted'
            }`}
          >
            {opt.label}
            {opt.value === 'todo' && todoCount > 0 && (
              <span className="ml-1.5 rounded-full bg-lacquer/15 px-1.5 py-0.5 text-[10px] font-semibold text-lacquer-light">
                {todoCount}
              </span>
            )}
            {opt.value === 'done' && doneCount > 0 && (
              <span className="ml-1.5 rounded-full bg-jade/15 px-1.5 py-0.5 text-[10px] font-semibold text-jade-light">
                {doneCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Sort & priority filters */}
      <div className="flex items-center gap-2">
        <select
          value={filters.priority}
          onChange={(e) => {
            const val = e.target.value
            onChange({ ...filters, priority: val === 'all' ? 'all' : (Number(val) as Priority) })
          }}
          className="rounded-lg border border-ink-700 bg-ink-900 px-3 py-1.5 text-xs font-medium text-parchment-muted transition-colors hover:border-ink-600 focus:border-lacquer/50 focus:outline-none focus:ring-2 focus:ring-lacquer/20"
        >
          <option value="all">All priorities</option>
          <option value="1">High</option>
          <option value="2">Medium</option>
          <option value="3">Low</option>
        </select>
        <select
          value={filters.sortBy}
          onChange={(e) => onChange({ ...filters, sortBy: e.target.value as Filters['sortBy'] })}
          className="rounded-lg border border-ink-700 bg-ink-900 px-3 py-1.5 text-xs font-medium text-parchment-muted transition-colors hover:border-ink-600 focus:border-lacquer/50 focus:outline-none focus:ring-2 focus:ring-lacquer/20"
        >
          <option value="priority">Sort: Priority</option>
          <option value="due_date">Sort: Due date</option>
          <option value="created_at">Sort: Newest</option>
        </select>
      </div>
    </div>
  )
}
