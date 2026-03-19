import { useEffect, useSyncExternalStore } from 'react'

function subscribe(callback: () => void) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

function getSnapshot() {
  return navigator.onLine
}

export function useOnlineStatus() {
  return useSyncExternalStore(subscribe, getSnapshot)
}

export function useOnReconnect(callback: () => void) {
  useEffect(() => {
    function handleOnline() {
      callback()
    }
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [callback])
}
