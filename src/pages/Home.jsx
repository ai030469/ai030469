import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTask } from '../context/TaskContext.jsx'
import Gauge from '../components/Gauge.jsx'
import UrgentBanner from '../components/UrgentBanner.jsx'
import { PlusCircle, ListTodo, Clock, User, ListChecks, AlertTriangle } from 'lucide-react'

function getGreeting(name, openCount) {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 12) {
    return `בוקר טוב ${name}, אני כאן איתך לתקתק הכל יחד. מזכירה לך שיש לנו ${openCount} משימות פתוחות.`
  }
  if (hour >= 12 && hour < 17) {
    return `צהריים טובים ${name}! יש לנו ${openCount} משימות פתוחות.`
  }
  if (hour >= 17 && hour < 21) {
    return `ערב טוב ${name}! נשארו ${openCount} משימות פתוחות.`
  }
  return `לילה טוב ${name}. ${openCount} משימות עדיין פתוחות.`
}

const menuItems = [
  { path: '/new', label: 'הערה חדשה', icon: PlusCircle, color: 'bg-celadon-500 text-white' },
  { path: '/tasks', label: 'משימות פתוחות', icon: ListTodo, color: 'bg-celadon-100 text-celadon-800' },
  { path: '/history', label: 'היסטוריה', icon: Clock, color: 'bg-celadon-100 text-celadon-800' },
  { path: '/profile', label: 'פרופיל', icon: User, color: 'bg-celadon-100 text-celadon-800' },
]

export default function Home() {
  const navigate = useNavigate()
  const { openTasks, urgentOpenTasks, user } = useTask()

  const greeting = useMemo(
    () => getGreeting(user?.name || '', openTasks.length),
    [user?.name, openTasks.length]
  )

  const maxGauge = Math.max(openTasks.length, 10)

  return (
    <div className="space-y-5 pt-2">
      {urgentOpenTasks.length > 0 && (
        <UrgentBanner count={urgentOpenTasks.length} />
      )}

      {/* Greeting */}
      <div className="watercolor-card rounded-2xl p-4 shadow-sm">
        <p className="text-sm text-celadon-800 leading-relaxed relative z-10">
          {greeting}
        </p>
      </div>

      {/* Gauges */}
      <div className="flex gap-3">
        <Gauge
          value={openTasks.length}
          max={maxGauge}
          label="משימות פתוחות"
          color="#26a69a"
          icon={<ListChecks size={16} className="text-celadon-400 mb-0.5" />}
        />
        <Gauge
          value={urgentOpenTasks.length}
          max={Math.max(urgentOpenTasks.length, 5)}
          label="דחופות"
          color="#ef4444"
          icon={<AlertTriangle size={16} className="text-red-400 mb-0.5" />}
        />
      </div>

      {/* Menu */}
      <div className="grid grid-cols-2 gap-3">
        {menuItems.map(item => {
          const Icon = item.icon
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`btn-press flex flex-col items-center gap-2 p-4 rounded-2xl shadow-sm ${item.color} transition-all`}
            >
              <Icon size={24} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
