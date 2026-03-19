export type TodoStatus = 'todo' | 'done' | 'cancel'

export type Priority = 1 | 2 | 3 // 1=high, 2=medium, 3=low

export const PRIORITY_LABELS: Record<Priority, string> = {
  1: 'High',
  2: 'Medium',
  3: 'Low',
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  1: 'text-lacquer-light bg-lacquer/10',
  2: 'text-gold bg-gold/10',
  3: 'text-parchment-muted bg-ink-700',
}

export const STATUS_LABELS: Record<TodoStatus, string> = {
  todo: 'Todo',
  done: 'Done',
  cancel: 'Cancelled',
}

export interface Todo {
  id: string
  user_id: string
  title: string
  description: string | null
  status: TodoStatus
  priority: Priority
  due_date: string | null
  reminder_at: string | null
  reminder_sent: boolean
  created_at: string
  updated_at: string
}

export type TodoInsert = Omit<Todo, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'reminder_sent'>
export type TodoUpdate = Partial<TodoInsert> & { id: string }

export interface SyncQueueItem {
  id?: number
  table: string
  operation: 'insert' | 'update' | 'delete'
  payload: Record<string, unknown> | Todo
  timestamp: number
}
