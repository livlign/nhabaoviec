import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import {
  getAllTodos,
  putTodo,
  deleteTodoLocal,
  addToSyncQueue,
} from '@/lib/offlineStore'
import { pullFromServer, drainSyncQueue } from '@/lib/syncEngine'
import { useOnReconnect } from './useOnlineStatus'
import type { Todo, TodoInsert, TodoUpdate } from '@/types'

export function useTodos() {
  const { user } = useAuth()
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)

  // Load from IndexedDB first, then pull from server if online
  const loadTodos = useCallback(async () => {
    if (!user) return

    // Always load from IndexedDB first (instant)
    const localTodos = await getAllTodos()
    setTodos(localTodos)
    setLoading(false)

    // If online, pull from server and drain any pending sync
    if (navigator.onLine) {
      try {
        await drainSyncQueue()
        const serverTodos = await pullFromServer(user.id)
        setTodos(serverTodos)
      } catch (err) {
        console.error('Failed to sync with server:', err)
        // Keep using local data
      }
    }
  }, [user])

  useEffect(() => {
    loadTodos()
  }, [loadTodos])

  // On reconnect: sync
  useOnReconnect(
    useCallback(async () => {
      if (!user) return
      try {
        await drainSyncQueue()
        const serverTodos = await pullFromServer(user.id)
        setTodos(serverTodos)
      } catch (err) {
        console.error('Reconnect sync failed:', err)
      }
    }, [user]),
  )

  // Realtime subscription
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('todos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const todo = payload.new as Todo
            await putTodo(todo)
            setTodos((prev) => {
              const exists = prev.find((t) => t.id === todo.id)
              if (exists) return prev.map((t) => (t.id === todo.id ? todo : t))
              return [todo, ...prev]
            })
          } else if (payload.eventType === 'DELETE') {
            const id = (payload.old as Todo).id
            await deleteTodoLocal(id)
            setTodos((prev) => prev.filter((t) => t.id !== id))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const addTodo = useCallback(
    async (todo: TodoInsert) => {
      if (!user) return

      const now = new Date().toISOString()
      const newTodo: Todo = {
        id: crypto.randomUUID(),
        user_id: user.id,
        ...todo,
        reminder_sent: false,
        created_at: now,
        updated_at: now,
      }

      // Write to IndexedDB immediately
      await putTodo(newTodo)
      setTodos((prev) => [newTodo, ...prev])

      // Queue sync
      await addToSyncQueue({
        table: 'todos',
        operation: 'insert',
        payload: newTodo,
        timestamp: Date.now(),
      })

      // Try to sync immediately if online
      if (navigator.onLine) {
        try {
          await drainSyncQueue()
        } catch {
          // Will sync later
        }
      }
    },
    [user],
  )

  const updateTodo = useCallback(
    async ({ id, ...updates }: TodoUpdate) => {
      const existing = todos.find((t) => t.id === id)
      if (!existing) return

      const updated: Todo = {
        ...existing,
        ...updates,
        updated_at: new Date().toISOString(),
      }

      // Write to IndexedDB immediately
      await putTodo(updated)
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)))

      // Queue sync
      await addToSyncQueue({
        table: 'todos',
        operation: 'update',
        payload: { id, ...updates },
        timestamp: Date.now(),
      })

      if (navigator.onLine) {
        try {
          await drainSyncQueue()
        } catch {
          // Will sync later
        }
      }
    },
    [todos],
  )

  const deleteTodo = useCallback(async (id: string) => {
    // Delete from IndexedDB immediately
    await deleteTodoLocal(id)
    setTodos((prev) => prev.filter((t) => t.id !== id))

    // Queue sync
    await addToSyncQueue({
      table: 'todos',
      operation: 'delete',
      payload: { id },
      timestamp: Date.now(),
    })

    if (navigator.onLine) {
      try {
        await drainSyncQueue()
      } catch {
        // Will sync later
      }
    }
  }, [])

  return { todos, loading, addTodo, updateTodo, deleteTodo, refetch: loadTodos }
}
