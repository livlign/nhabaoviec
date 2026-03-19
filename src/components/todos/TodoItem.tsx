import { useState } from 'react'
import type { Todo, TodoInsert, TodoUpdate, TodoStatus } from '@/types'
import { PRIORITY_LABELS } from '@/types'
import { TodoForm } from './TodoForm'

interface TodoItemProps {
  todo: Todo
  onUpdate: (update: TodoUpdate) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const PRIORITY_BADGE: Record<number, string> = {
  1: 'bg-lacquer/15 text-lacquer-light border-lacquer/20',
  2: 'bg-gold/15 text-gold-light border-gold/20',
  3: 'bg-ink-700 text-parchment-muted border-ink-600',
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const isThisYear = d.getFullYear() === now.getFullYear()
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    ...(isThisYear ? {} : { year: 'numeric' }),
    hour: '2-digit',
    minute: '2-digit',
  })
}

function isOverdue(todo: Todo): boolean {
  return todo.status === 'todo' && !!todo.due_date && new Date(todo.due_date) < new Date()
}

function isDueToday(todo: Todo): boolean {
  if (!todo.due_date || todo.status !== 'todo') return false
  const due = new Date(todo.due_date)
  const now = new Date()
  return (
    due.getFullYear() === now.getFullYear() &&
    due.getMonth() === now.getMonth() &&
    due.getDate() === now.getDate() &&
    due > now
  )
}

export function TodoItem({ todo, onUpdate, onDelete }: TodoItemProps) {
  const [editing, setEditing] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const overdue = isOverdue(todo)
  const dueToday = isDueToday(todo)

  async function handleStatusChange(status: TodoStatus) {
    setActionLoading(true)
    try {
      await onUpdate({ id: todo.id, status })
    } finally {
      setActionLoading(false)
    }
  }

  async function handleEdit(values: TodoInsert) {
    await onUpdate({ id: todo.id, ...values })
    setEditing(false)
  }

  async function handleDelete() {
    setActionLoading(true)
    try {
      await onDelete(todo.id)
    } finally {
      setActionLoading(false)
    }
  }

  if (editing) {
    return (
      <TodoForm
        initialValues={todo}
        submitLabel="Save changes"
        onSubmit={handleEdit}
        onCancel={() => setEditing(false)}
      />
    )
  }

  return (
    <div
      className={`group rounded-2xl border p-4 transition-all ${
        overdue
          ? 'border-lacquer/30 bg-lacquer/5 hover:border-lacquer/40'
          : dueToday
            ? 'border-gold/30 bg-gold/5 hover:border-gold/40'
            : 'border-ink-800 bg-ink-900 hover:border-ink-700 hover:bg-ink-900/80'
      } ${todo.status !== 'todo' ? 'opacity-50' : ''}`}
    >
      {/* Title + badges */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Custom checkbox */}
        {todo.status === 'todo' ? (
          <button
            onClick={() => handleStatusChange('done')}
            disabled={actionLoading}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-ink-600 transition-all hover:border-jade hover:bg-jade/10 disabled:opacity-50"
            aria-label="Mark done"
          >
            <svg className="h-3 w-3 text-transparent group-hover:text-jade/40 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        ) : (
          <button
            onClick={() => handleStatusChange('todo')}
            disabled={actionLoading}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-jade/40 bg-jade/10 transition-all hover:border-ink-600 hover:bg-transparent disabled:opacity-50"
            aria-label="Reopen"
          >
            <svg className="h-3 w-3 text-jade" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        )}

        <h3
          className={`text-sm font-medium leading-snug ${
            todo.status === 'done'
              ? 'text-parchment-faint line-through'
              : todo.status === 'cancel'
                ? 'text-parchment-faint'
                : 'text-parchment'
          }`}
        >
          {todo.title}
        </h3>
        <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${PRIORITY_BADGE[todo.priority]}`}>
          {PRIORITY_LABELS[todo.priority]}
        </span>
        {overdue && (
          <span className="rounded-md bg-lacquer/15 border border-lacquer/20 px-1.5 py-0.5 text-[10px] font-semibold text-lacquer-light">
            OVERDUE
          </span>
        )}
        {dueToday && (
          <span className="rounded-md bg-gold/15 border border-gold/20 px-1.5 py-0.5 text-[10px] font-semibold text-gold-light">
            TODAY
          </span>
        )}
        {todo.status === 'done' && (
          <span className="rounded-md bg-jade/15 border border-jade/20 px-1.5 py-0.5 text-[10px] font-semibold text-jade-light">
            DONE
          </span>
        )}
        {todo.status === 'cancel' && (
          <span className="rounded-md bg-ink-700 border border-ink-600 px-1.5 py-0.5 text-[10px] font-semibold text-parchment-faint">
            CANCELLED
          </span>
        )}
      </div>

      {/* Description */}
      {todo.description && (
        <p className="mt-1.5 ml-7 text-sm leading-relaxed text-parchment-faint line-clamp-2">{todo.description}</p>
      )}

      {/* Date info */}
      {(todo.due_date || todo.reminder_at) && (
        <div className="mt-2 ml-7 flex items-center gap-4 text-xs text-parchment-faint">
          {todo.due_date && (
            <span className="flex items-center gap-1">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(todo.due_date)}
            </span>
          )}
          {todo.reminder_at && (
            <span className="flex items-center gap-1">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {formatDate(todo.reminder_at)}
            </span>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-3 ml-7 flex items-center gap-2 border-t border-ink-800 pt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        {todo.status === 'todo' && (
          <button
            onClick={() => handleStatusChange('cancel')}
            disabled={actionLoading}
            className="rounded-lg bg-ink-800 px-3 py-1.5 text-xs font-medium text-parchment-faint transition-colors hover:bg-ink-700 hover:text-parchment-muted disabled:opacity-50"
          >
            Cancel task
          </button>
        )}
        {todo.status !== 'todo' && (
          <button
            onClick={() => handleStatusChange('todo')}
            disabled={actionLoading}
            className="rounded-lg bg-ink-800 px-3 py-1.5 text-xs font-medium text-parchment-faint transition-colors hover:bg-ink-700 hover:text-parchment-muted disabled:opacity-50"
          >
            Reopen
          </button>
        )}
        <button
          onClick={() => setEditing(true)}
          className="rounded-lg bg-ink-800 px-3 py-1.5 text-xs font-medium text-parchment-faint transition-colors hover:bg-ink-700 hover:text-parchment-muted"
        >
          Edit
        </button>
        {showConfirmDelete ? (
          <>
            <button
              onClick={handleDelete}
              disabled={actionLoading}
              className="rounded-lg bg-lacquer px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-lacquer-light disabled:opacity-50"
            >
              Confirm delete
            </button>
            <button
              onClick={() => setShowConfirmDelete(false)}
              className="rounded-lg bg-ink-800 px-3 py-1.5 text-xs font-medium text-parchment-faint transition-colors hover:bg-ink-700 hover:text-parchment-muted"
            >
              Keep
            </button>
          </>
        ) : (
          <button
            onClick={() => setShowConfirmDelete(true)}
            className="rounded-lg bg-ink-800 px-3 py-1.5 text-xs font-medium text-lacquer-light transition-colors hover:bg-lacquer/10 disabled:opacity-50"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
