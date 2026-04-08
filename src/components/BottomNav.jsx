import { useNavigate, useLocation } from 'react-router-dom'
import { Home, PlusCircle, ListTodo, Clock, User } from 'lucide-react'

const navItems = [
  { path: '/profile', label: 'פרופיל', icon: User },
  { path: '/history', label: 'היסטוריה', icon: Clock },
  { path: '/new', label: 'חדש', icon: PlusCircle, highlight: true },
  { path: '/tasks', label: 'משימות', icon: ListTodo },
  { path: '/', label: 'בית', icon: Home },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-md border-t border-celadon-200 z-50 safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto h-16">
        {navItems.map(item => {
          const active = location.pathname === item.path
          const Icon = item.icon
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`btn-press flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-[56px] ${
                item.highlight && !active
                  ? 'text-white bg-celadon-500 rounded-full px-4 py-2 shadow-md -mt-4'
                  : active
                    ? 'text-celadon-700 bg-celadon-50'
                    : 'text-gray-400'
              }`}
            >
              <Icon size={item.highlight ? 22 : 20} />
              <span className={`text-[10px] ${item.highlight && !active ? 'text-white' : ''}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
