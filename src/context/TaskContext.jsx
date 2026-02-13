import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { loadTasks, saveTasks, loadHistory, saveHistory, loadUser, saveUser, generateId } from '../utils/storage.js'

const TaskContext = createContext(null)

export function useTask() {
  const ctx = useContext(TaskContext)
  if (!ctx) throw new Error('useTask must be used within TaskProvider')
  return ctx
}

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState(() => loadTasks())
  const [history, setHistory] = useState(() => loadHistory())
  const [user, setUserState] = useState(() => loadUser())

  // Persist tasks
  useEffect(() => { saveTasks(tasks) }, [tasks])
  useEffect(() => { saveHistory(history) }, [history])

  // Midnight sync: move closed tasks to history, keep open/in_progress
  useEffect(() => {
    function runMidnightSync() {
      const now = new Date()
      const today = now.toISOString().split('T')[0]

      setTasks(prev => {
        const stillOpen = []
        const toHistory = []

        for (const task of prev) {
          if (task.status === 'closed') {
            toHistory.push({
              ...task,
              endDate: task.endDate || today,
            })
          } else {
            stillOpen.push(task)
          }
        }

        if (toHistory.length > 0) {
          setHistory(h => [...toHistory, ...h])
        }

        return stillOpen
      })
    }

    // Calculate ms until next midnight
    function msUntilMidnight() {
      const now = new Date()
      const midnight = new Date(now)
      midnight.setHours(24, 0, 0, 0)
      return midnight - now
    }

    // Run sync on load if last sync was before today
    const lastSync = localStorage.getItem('taskapp_last_sync')
    const today = new Date().toISOString().split('T')[0]
    if (lastSync !== today) {
      runMidnightSync()
      localStorage.setItem('taskapp_last_sync', today)
    }

    // Schedule next midnight sync
    const timeout = setTimeout(() => {
      runMidnightSync()
      localStorage.setItem('taskapp_last_sync', new Date().toISOString().split('T')[0])
      // Then set interval for subsequent days
      const interval = setInterval(() => {
        runMidnightSync()
        localStorage.setItem('taskapp_last_sync', new Date().toISOString().split('T')[0])
      }, 24 * 60 * 60 * 1000)
      return () => clearInterval(interval)
    }, msUntilMidnight())

    return () => clearTimeout(timeout)
  }, [])

  const addTask = useCallback((taskData) => {
    const task = {
      id: generateId(),
      text: taskData.text,
      date: taskData.date,
      priority: taskData.priority,
      assignee: taskData.assignee,
      status: 'open',
      remarks: '',
      createdAt: new Date().toISOString(),
    }
    setTasks(prev => [task, ...prev])
    return task
  }, [])

  const updateTask = useCallback((id, updates) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }, [])

  const closeTask = useCallback((id, remarks = '') => {
    const today = new Date().toISOString().split('T')[0]
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, status: 'closed', endDate: today, remarks } : t
    ))
  }, [])

  const deleteTask = useCallback((id) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }, [])

  const setUser = useCallback((userData) => {
    saveUser(userData)
    setUserState(userData)
  }, [])

  const openTasks = tasks.filter(t => t.status !== 'closed')
  const urgentOpenTasks = openTasks.filter(t => t.priority === 'urgent')

  // Check for overdue urgent tasks
  const today = new Date().toISOString().split('T')[0]
  const overdueUrgent = urgentOpenTasks.filter(t => t.date < today)

  const value = {
    tasks,
    history,
    openTasks,
    urgentOpenTasks,
    overdueUrgent,
    user,
    addTask,
    updateTask,
    closeTask,
    deleteTask,
    setUser,
  }

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}
