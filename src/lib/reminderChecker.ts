import { getAllTodos, putTodo, addToSyncQueue } from './offlineStore'
import { showNotification } from './notifications'

let intervalId: ReturnType<typeof setInterval> | null = null

async function checkReminders(): Promise<void> {
  try {
    const todos = await getAllTodos()
    const now = Date.now()

    for (const todo of todos) {
      if (
        todo.status === 'todo' &&
        todo.reminder_at &&
        !todo.reminder_sent &&
        new Date(todo.reminder_at).getTime() <= now
      ) {
        showNotification('Task Reminder', todo.title)

        const updated = { ...todo, reminder_sent: true, updated_at: new Date().toISOString() }
        await putTodo(updated)

        await addToSyncQueue({
          table: 'todos',
          operation: 'update',
          payload: { id: todo.id, reminder_sent: true },
          timestamp: Date.now(),
        })
      }
    }
  } catch (err) {
    console.error('Reminder check error:', err)
  }
}

export function startReminderChecker(): void {
  if (intervalId) return
  checkReminders()
  intervalId = setInterval(checkReminders, 60_000)
}

export function stopReminderChecker(): void {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}
