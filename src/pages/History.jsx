import { useState, useMemo } from 'react'
import { useTask } from '../context/TaskContext.jsx'
import BackButton from '../components/BackButton.jsx'
import ExportMenu from '../components/ExportMenu.jsx'
import { Search, Calendar, User as UserIcon } from 'lucide-react'

export default function History() {
  const { history } = useTask()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search) return history
    const q = search.toLowerCase()
    return history.filter(t =>
      t.text.toLowerCase().includes(q) ||
      t.assignee.toLowerCase().includes(q)
    )
  }, [history, search])

  return (
    <div>
      <BackButton title="היסטוריה" />

      {/* Search */}
      <div className="relative mb-3">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="חיפוש..."
          className="w-full border border-celadon-200 rounded-xl pr-9 pl-3 py-2.5 text-sm bg-white focus:outline-none focus:border-celadon-400"
        />
      </div>

      <div className="flex justify-end mb-3">
        <ExportMenu tasks={filtered} title="היסטוריה" />
      </div>

      {/* History list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">אין היסטוריה עדיין</p>
          </div>
        ) : (
          filtered.map(task => (
            <div
              key={task.id}
              className="bg-white rounded-xl border border-celadon-100 p-3 space-y-1"
            >
              <p className="text-sm font-medium text-gray-800">{task.text}</p>
              <div className="flex items-center gap-3 text-[11px] text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {task.date} → {task.endDate || '—'}
                </span>
                <span className="flex items-center gap-1">
                  <UserIcon size={12} />
                  {task.assignee}
                </span>
              </div>
              {task.remarks && (
                <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2 mt-1">
                  {task.remarks}
                </p>
              )}
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-600 inline-block">
                סגור
              </span>
            </div>
          ))
        )}
      </div>

      <div className="text-center mt-4">
        <span className="text-xs text-gray-400">
          {filtered.length} רשומות
        </span>
      </div>
    </div>
  )
}
