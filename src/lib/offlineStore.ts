import { openDB, type IDBPDatabase } from 'idb'
import type { Todo, SyncQueueItem } from '@/types'

const DB_NAME = 'nhabaoviec-local'
const DB_VERSION = 1

interface NhabaoviecDB {
  todos: { key: string; value: Todo }
  sync_queue: { key: number; value: SyncQueueItem; autoIncrement: true }
}

let dbInstance: IDBPDatabase<NhabaoviecDB> | null = null

async function getDB(): Promise<IDBPDatabase<NhabaoviecDB>> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<NhabaoviecDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('todos')) {
        db.createObjectStore('todos', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true })
      }
    },
  })

  return dbInstance
}

// --- Todos ---

export async function getAllTodos(): Promise<Todo[]> {
  const db = await getDB()
  return db.getAll('todos')
}

export async function getTodo(id: string): Promise<Todo | undefined> {
  const db = await getDB()
  return db.get('todos', id)
}

export async function putTodo(todo: Todo): Promise<void> {
  const db = await getDB()
  await db.put('todos', todo)
}

export async function putAllTodos(todos: Todo[]): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('todos', 'readwrite')
  await Promise.all([
    ...todos.map((t) => tx.store.put(t)),
    tx.done,
  ])
}

export async function deleteTodoLocal(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('todos', id)
}

export async function clearTodos(): Promise<void> {
  const db = await getDB()
  await db.clear('todos')
}

// --- Sync Queue ---

export async function addToSyncQueue(item: Omit<SyncQueueItem, 'id'>): Promise<void> {
  const db = await getDB()
  await db.add('sync_queue', item as SyncQueueItem)
}

export async function getAllSyncQueueItems(): Promise<SyncQueueItem[]> {
  const db = await getDB()
  return db.getAll('sync_queue')
}

export async function deleteSyncQueueItem(id: number): Promise<void> {
  const db = await getDB()
  await db.delete('sync_queue', id)
}

export async function clearSyncQueue(): Promise<void> {
  const db = await getDB()
  await db.clear('sync_queue')
}
