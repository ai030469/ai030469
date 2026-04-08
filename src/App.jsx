import { Routes, Route, Navigate } from 'react-router-dom'
import { useTask } from './context/TaskContext.jsx'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import NewTask from './pages/NewTask.jsx'
import OpenTasks from './pages/OpenTasks.jsx'
import History from './pages/History.jsx'
import Profile from './pages/Profile.jsx'
import Onboarding from './pages/Onboarding.jsx'

function App() {
  const { user } = useTask()

  if (!user) {
    return (
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/new" element={<NewTask />} />
        <Route path="/tasks" element={<OpenTasks />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
