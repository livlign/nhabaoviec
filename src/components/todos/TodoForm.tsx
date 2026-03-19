import { useState, type FormEvent } from 'react'
import type { Priority, TodoInsert } from '@/types'

interface TodoFormProps {
  onSubmit: (todo: TodoInsert) => Promise<void>
  initialValues?: Partial<TodoInsert>
  submitLabel?: string
  onCancel?: () => void
}

const priorityOptions: { value: Priority; label: string; activeColor: string }[] = [
  { value: 1, label: 'High', activeColor: 'border-lacquer/40 bg-lacquer/10 text-lacquer-light' },
  { value: 2, label: 'Medium', activeColor: 'border-gold/40 bg-gold/10 text-gold-light' },
  { value: 3, label: 'Low', activeColor: 'border-ink-600 bg-ink-700 text-parchment-muted' },
]

export function TodoForm({ onSubmit, initialValues, submitLabel = 'Add task', onCancel }: TodoFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [priority, setPriority] = useState<Priority>(initialValues?.priority ?? 2)
  const [dueDate, setDueDate] = useState(initialValues?.due_date?.slice(0, 16) ?? '')
  const [reminderAt, setReminderAt] = useState(initialValues?.reminder_at?.slice(0, 16) ?? '')
  const [showDetails, setShowDetails] = useState(!!(initialValues?.description || initialValues?.due_date || initialValues?.reminder_at))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    setError(null)

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        status: initialValues?.status ?? 'todo',
        priority,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        reminder_at: reminderAt ? new Date(reminderAt).toISOString() : null,
      })
      if (!initialValues) {
        setTitle('')
        setDescription('')
        setPriority(2)
        setDueDate('')
        setReminderAt('')
        setShowDetails(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-2xl border border-ink-800 bg-ink-900 p-5 shadow-xl shadow-black/20">
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-lacquer/10 border border-lacquer/20 px-4 py-3 text-sm text-lacquer-light">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          {error}
        </div>
      )}

      <input
        type="text"
        placeholder="What needs to be done?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
        className="block w-full border-0 bg-transparent px-0 text-base font-medium text-parchment placeholder:text-parchment-faint focus:outline-none focus:ring-0"
      />

      {showDetails && (
        <div className="mt-4 space-y-4">
          <textarea
            placeholder="Add a description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="block w-full rounded-xl border border-ink-700 bg-ink-800 px-4 py-2.5 text-sm text-parchment transition-colors placeholder:text-parchment-faint focus:border-lacquer/40 focus:outline-none focus:ring-2 focus:ring-lacquer/15"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-parchment-faint">Due date</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="block w-full rounded-xl border border-ink-700 bg-ink-800 px-4 py-2 text-sm text-parchment transition-colors focus:border-lacquer/40 focus:outline-none focus:ring-2 focus:ring-lacquer/15 [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-parchment-faint">Reminder</label>
              <input
                type="datetime-local"
                value={reminderAt}
                onChange={(e) => setReminderAt(e.target.value)}
                className="block w-full rounded-xl border border-ink-700 bg-ink-800 px-4 py-2 text-sm text-parchment transition-colors focus:border-lacquer/40 focus:outline-none focus:ring-2 focus:ring-lacquer/15 [color-scheme:dark]"
              />
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-ink-800 pt-4">
        <div className="flex items-center gap-2">
          {/* Priority selector */}
          <div className="flex gap-1">
            {priorityOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPriority(opt.value)}
                className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                  priority === opt.value
                    ? opt.activeColor
                    : 'border-transparent bg-ink-800 text-parchment-faint hover:bg-ink-700 hover:text-parchment-muted'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Toggle details */}
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="rounded-lg p-1.5 text-parchment-faint transition-colors hover:bg-ink-800 hover:text-parchment-muted"
            title={showDetails ? 'Hide details' : 'Add details'}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {showDetails ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              )}
            </svg>
          </button>
        </div>

        <div className="flex gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl px-4 py-2 text-sm font-medium text-parchment-faint transition-colors hover:bg-ink-800 hover:text-parchment-muted"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="rounded-xl bg-lacquer px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-lacquer/20 transition-all hover:bg-lacquer-light hover:shadow-xl hover:shadow-lacquer/25 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-lacquer disabled:hover:shadow-lg"
          >
            {loading ? 'Saving...' : submitLabel}
          </button>
        </div>
      </div>
    </form>
  )
}
