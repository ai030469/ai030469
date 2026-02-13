const TASKS_KEY = 'taskapp_tasks'
const USER_KEY = 'taskapp_user'
const HISTORY_KEY = 'taskapp_history'

export function loadTasks() {
  try {
    const data = localStorage.getItem(TASKS_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveTasks(tasks) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
}

export function loadHistory() {
  try {
    const data = localStorage.getItem(HISTORY_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

export function loadUser() {
  try {
    const data = localStorage.getItem(USER_KEY)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

export function saveUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}
