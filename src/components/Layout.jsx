import { Outlet, useLocation } from 'react-router-dom'
import { useTask } from '../context/TaskContext.jsx'
import UrgentBanner from './UrgentBanner.jsx'
import BottomNav from './BottomNav.jsx'

export default function Layout() {
  const location = useLocation()
  const { urgentOpenTasks } = useTask()
  const isHome = location.pathname === '/'

  return (
    <div className="flex flex-col min-h-dvh bg-[#fafffe]">
      {!isHome && urgentOpenTasks.length > 0 && (
        <UrgentBanner count={urgentOpenTasks.length} />
      )}
      <main className="flex-1 pb-20 px-4 pt-2 max-w-lg mx-auto w-full">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
