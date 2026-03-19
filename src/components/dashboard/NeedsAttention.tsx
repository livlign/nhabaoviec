import type { Todo, TodoUpdate } from '@/types'
import { TodoItem } from '@/components/todos/TodoItem'

interface NeedsAttentionProps {
  todos: Todo[]
  onUpdate: (update: TodoUpdate) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

function getUrgentTodos(todos: Todo[]): Todo[] {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(23, 59, 59, 999)

  return todos
    .filter((t) => {
      if (t.status !== 'todo') return false
      if (t.due_date && new Date(t.due_date) < now) return true
      if (t.due_date && new Date(t.due_date) <= tomorrow) return true
      if (t.priority === 1) return true
      return false
    })
    .sort((a, b) => {
      const aOverdue = a.due_date && new Date(a.due_date) < now
      const bOverdue = b.due_date && new Date(b.due_date) < now
      if (aOverdue && !bOverdue) return -1
      if (!aOverdue && bOverdue) return 1
      if (a.priority !== b.priority) return a.priority - b.priority
      if (a.due_date && b.due_date) return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      if (a.due_date) return -1
      if (b.due_date) return 1
      return 0
    })
}

export function NeedsAttention({ todos, onUpdate, onDelete }: NeedsAttentionProps) {
  const urgent = getUrgentTodos(todos)

  if (urgent.length === 0) return null

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-lacquer/15 border border-lacquer/20" style={{ animation: 'pulse-glow 3s ease-in-out infinite' }}>
          <svg className="h-3.5 w-3.5 text-lacquer-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="font-display text-sm font-bold tracking-wide uppercase text-parchment">
          Needs Attention
        </h2>
        <span className="rounded-full bg-lacquer/15 border border-lacquer/20 px-2 py-0.5 text-xs font-semibold text-lacquer-light">
          {urgent.length}
        </span>
      </div>
      <div className="space-y-2">
        {urgent.map((todo) => (
          <TodoItem key={todo.id} todo={todo} onUpdate={onUpdate} onDelete={onDelete} />
        ))}
      </div>
    </div>
  )
}
