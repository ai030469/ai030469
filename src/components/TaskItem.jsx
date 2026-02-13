import { useState } from 'react'
import { useTask } from '../context/TaskContext.jsx'
import { CheckCircle2, Clock, AlertTriangle, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'

const STATUS_CONFIG = {
  open: { label: 'פתוח', color: 'text-gray-600', bg: 'bg-gray-100' },
  in_progress: { label: 'בטיפול', color: 'text-blue-600', bg: 'bg-blue-50' },
  closed: { label: 'סגור', color: 'text-green-600', bg: 'bg-green-50' },
}

const STATUSES = ['open', 'in_progress', 'closed']

export default function TaskItem({ task, showActions = true }) {
  const { updateTask, closeTask, deleteTask } = useTask()
  const [expanded, setExpanded] = useState(false)
  const [remarks, setRemarks] = useState(task.remarks || '')

  const today = new Date().toISOString().split('T')[0]
  const isOverdueUrgent = task.priority === 'urgent' && task.date < today && task.status !== 'closed'
  const statusConf = STATUS_CONFIG[task.status]

  const handleStatusChange = (newStatus) => {
    if (newStatus === 'closed') {
      closeTask(task.id, remarks)
    } else {
      updateTask(task.id, { status: newStatus })
    }
  }

  return (
    <div
      className={`rounded-xl border transition-all ${
        isOverdueUrgent
          ? 'bg-red-50 border-red-200'
          : 'bg-white border-celadon-100'
      }`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="btn-press w-full flex items-start gap-3 p-3 text-right"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {task.priority === 'urgent' && (
              <AlertTriangle size={14} className="text-red-500 shrink-0" />
            )}
            <span className={`text-sm font-medium ${isOverdueUrgent ? 'text-red-700' : 'text-gray-800'}`}>
              {task.text}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-gray-400">{task.date}</span>
            <span className="text-[11px] text-gray-400">|</span>
            <span className="text-[11px] text-celadon-600">{task.assignee}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusConf.bg} ${statusConf.color}`}>
              {statusConf.label}
            </span>
          </div>
        </div>
        {expanded ? <ChevronUp size={16} className="text-gray-400 mt-1" /> : <ChevronDown size={16} className="text-gray-400 mt-1" />}
      </button>

      {expanded && showActions && (
        <div className="px-3 pb-3 space-y-3 border-t border-celadon-50 pt-3">
          <div className="flex gap-2">
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={`btn-press flex-1 text-xs py-2 rounded-lg border transition-colors ${
                  task.status === s
                    ? `${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].color} border-current font-medium`
                    : 'bg-gray-50 text-gray-400 border-gray-100'
                }`}
              >
                {STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>
          <textarea
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            onBlur={() => updateTask(task.id, { remarks })}
            placeholder="הערות..."
            rows={2}
            className="w-full text-sm border border-celadon-200 rounded-lg p-2 bg-celadon-50/30 focus:outline-none focus:border-celadon-400 resize-none"
          />
          <button
            onClick={() => deleteTask(task.id)}
            className="btn-press flex items-center gap-1 text-xs text-red-400 hover:text-red-600"
          >
            <Trash2 size={14} />
            <span>מחק</span>
          </button>
        </div>
      )}
    </div>
  )
}
