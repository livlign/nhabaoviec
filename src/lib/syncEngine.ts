import { supabase } from './supabase'
import {
  getAllSyncQueueItems,
  deleteSyncQueueItem,
  putTodo,
  deleteTodoLocal,
  putAllTodos,
  clearTodos,
} from './offlineStore'
import type { Todo } from '@/types'

let syncing = false

export async function pullFromServer(userId: string): Promise<Todo[]> {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error
  const todos = (data ?? []) as Todo[]

  await clearTodos()
  await putAllTodos(todos)

  return todos
}

export async function drainSyncQueue(): Promise<void> {
  if (syncing) return
  syncing = true

  try {
    const items = await getAllSyncQueueItems()

    for (const item of items) {
      try {
        if (item.table === 'todos') {
          if (item.operation === 'insert') {
            const { data, error } = await supabase
              .from('todos')
              .upsert(item.payload)
              .select()
              .single()

            if (!error && data) {
              await putTodo(data as Todo)
            } else if (error) {
              console.error('Sync insert error:', error)
              continue // Keep in queue for retry
            }
          } else if (item.operation === 'update') {
            const { id, ...updates } = item.payload as { id: string; [key: string]: unknown }

            // Check server version for conflict
            const { data: serverTodo } = await supabase
              .from('todos')
              .select('updated_at')
              .eq('id', id)
              .single()

            if (serverTodo) {
              const serverTime = new Date(serverTodo.updated_at as string).getTime()
              const localTime = item.timestamp

              if (serverTime > localTime) {
                // Server wins — pull latest
                const { data: latest } = await supabase
                  .from('todos')
                  .select('*')
                  .eq('id', id)
                  .single()
                if (latest) await putTodo(latest as Todo)
              } else {
                // Local wins — push update
                const { data, error } = await supabase
                  .from('todos')
                  .update(updates)
                  .eq('id', id)
                  .select()
                  .single()

                if (!error && data) {
                  await putTodo(data as Todo)
                } else if (error) {
                  console.error('Sync update error:', error)
                  continue
                }
              }
            } else {
              // Record doesn't exist on server — skip (deleted)
              await deleteTodoLocal(id)
            }
          } else if (item.operation === 'delete') {
            const { id } = item.payload as { id: string }
            await supabase.from('todos').delete().eq('id', id)
            await deleteTodoLocal(id)
          }
        }

        // Successfully processed — remove from queue
        if (item.id !== undefined) {
          await deleteSyncQueueItem(item.id)
        }
      } catch (err) {
        console.error('Sync error for item:', item, err)
        // Leave in queue for next drain attempt
      }
    }
  } finally {
    syncing = false
  }
}
