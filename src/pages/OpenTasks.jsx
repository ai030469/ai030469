import { useState, useMemo } from 'react'
import { useTask } from '../context/TaskContext.jsx'
import BackButton from '../components/BackButton.jsx'
import TaskItem from '../components/TaskItem.jsx'
import ExportMenu from '../components/ExportMenu.jsx'
import { Search, Filter } from 'lucide-react'

export default function OpenTasks() {
  const { openTasks } = useTask()
  const [search, setSearch] = useState('')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const filtered = useMemo(() => {
    let result = openTasks

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(t =>
        t.text.toLowerCase().includes(q) ||
        t.assignee.toLowerCase().includes(q)
      )
    }

    if (filterPriority !== 'all') {
      result = result.filter(t => t.priority === filterPriority)
    }

    if (filterStatus !== 'all') {
      result = result.filter(t => t.status === filterStatus)
    }

    // Sort: overdue urgent first, then urgent, then by date
    const today = new Date().toISOString().split('T')[0]
    result.sort((a, b) => {
      const aOverdue = a.priority === 'urgent' && a.date < today ? 1 : 0
      const bOverdue = b.priority === 'urgent' && b.date < today ? 1 : 0
      if (bOverdue !== aOverdue) return bOverdue - aOverdue

      const aUrgent = a.priority === 'urgent' ? 1 : 0
      const bUrgent = b.priority === 'urgent' ? 1 : 0
      if (bUrgent !== aUrgent) return bUrgent - aUrgent

      return a.date.localeCompare(b.date)
    })

    return result
  }, [openTasks, search, filterPriority, filterStatus])

  return (
    <div>
      <BackButton title="משימות פתוחות" />

      {/* Search */}
      <div className="relative mb-3">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="חיפוש לפי מילת מפתח או גורם מטפל..."
          className="w-full border border-celadon-200 rounded-xl pr-9 pl-3 py-2.5 text-sm bg-white focus:outline-none focus:border-celadon-400"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Filter size={14} className="text-gray-400" />
        <select
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value)}
          className="text-xs border border-celadon-200 rounded-lg px-2 py-1.5 bg-white"
        >
          <option value="all">כל העדיפויות</option>
          <option value="urgent">דחוף</option>
          <option value="medium">בינוני</option>
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="text-xs border border-celadon-200 rounded-lg px-2 py-1.5 bg-white"
        >
          <option value="all">כל הסטטוסים</option>
          <option value="open">פתוח</option>
          <option value="in_progress">בטיפול</option>
        </select>
        <div className="mr-auto">
          <ExportMenu tasks={filtered} title="משימות פתוחות" />
        </div>
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">אין משימות פתוחות</p>
          </div>
        ) : (
          filtered.map(task => (
            <TaskItem key={task.id} task={task} />
          ))
        )}
      </div>

      <div className="text-center mt-4">
        <span className="text-xs text-gray-400">
          {filtered.length} משימות
        </span>
      </div>
    </div>
  )
}
