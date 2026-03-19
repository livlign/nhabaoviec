import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/Header'
import { useTodos } from '@/hooks/useTodos'
import { NeedsAttention } from '@/components/dashboard/NeedsAttention'
import { TodoForm } from '@/components/todos/TodoForm'
import { TodoList } from '@/components/todos/TodoList'
import { TodoFilters, type Filters } from '@/components/todos/TodoFilters'
import { requestNotificationPermission } from '@/lib/notifications'
import { startReminderChecker, stopReminderChecker } from '@/lib/reminderChecker'

export function DashboardPage() {
  const { todos, loading, addTodo, updateTodo, deleteTodo } = useTodos()

  useEffect(() => {
    requestNotificationPermission()
    startReminderChecker()
    return () => stopReminderChecker()
  }, [])

  const [showForm, setShowForm] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    status: 'todo',
    priority: 'all',
    sortBy: 'priority',
  })

  const todoCount = todos.filter((t) => t.status === 'todo').length
  const doneCount = todos.filter((t) => t.status === 'done').length

  return (
    <div className="grain min-h-screen">
      <Header />

      {/* Subtle background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[300px] w-[600px] rounded-full bg-lacquer/3 blur-[120px]" />
      </div>

      <main className="relative mx-auto max-w-3xl px-5 py-8 sm:px-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 fade-in">
            <div className="relative h-10 w-10">
              <div className="absolute inset-0 rotate-45 rounded-lg border-2 border-ink-700 border-t-lacquer animate-spin" />
            </div>
            <p className="mt-4 text-sm text-parchment-faint">Loading your tasks...</p>
          </div>
        ) : (
          <>
            <div className="slide-up">
              <NeedsAttention todos={todos} onUpdate={updateTodo} onDelete={deleteTodo} />
            </div>

            {/* Add task button / form */}
            <div className="mb-8 slide-up stagger-2">
              {showForm ? (
                <TodoForm
                  onSubmit={async (todo) => {
                    await addTodo(todo)
                    setShowForm(false)
                  }}
                  onCancel={() => setShowForm(false)}
                />
              ) : (
                <button
                  onClick={() => setShowForm(true)}
                  className="group flex w-full items-center gap-3 rounded-2xl border border-dashed border-ink-700 bg-ink-900/50 px-5 py-4 text-sm text-parchment-faint transition-all hover:border-lacquer/40 hover:bg-lacquer/5 hover:text-lacquer-light"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-800 transition-colors group-hover:bg-lacquer/10">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                  Add a new task...
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="mb-5 slide-up stagger-3">
              <TodoFilters
                filters={filters}
                onChange={setFilters}
                todoCount={todoCount}
                doneCount={doneCount}
              />
            </div>

            {/* Task list */}
            <div className="slide-up stagger-4">
              <TodoList
                todos={todos}
                filters={filters}
                onUpdate={updateTodo}
                onDelete={deleteTodo}
              />
            </div>
          </>
        )}
      </main>
    </div>
  )
}
