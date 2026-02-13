import { useState } from 'react'
import { useTask } from '../context/TaskContext.jsx'
import BackButton from '../components/BackButton.jsx'
import { Save, User } from 'lucide-react'

const DEPARTMENTS = [
  { value: 'ramot', label: 'רמות' },
  { value: 'culinary', label: 'קולינריה' },
  { value: 'tech', label: 'טכנולוגיה' },
  { value: 'shipka', label: 'שיפקה' },
  { value: 'other', label: 'אחר' },
]

export default function Profile() {
  const { user, setUser } = useTask()
  const [name, setName] = useState(user?.name || '')
  const [role, setRole] = useState(user?.role || '')
  const [department, setDepartment] = useState(user?.department || '')
  const [saved, setSaved] = useState(false)

  const handleSave = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setUser({ name: name.trim(), role: role.trim(), department })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <BackButton title="פרופיל" />

      <form onSubmit={handleSave} className="space-y-4">
        <div className="watercolor-card rounded-2xl p-6 flex flex-col items-center gap-3 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-celadon-200 flex items-center justify-center">
            <User size={32} className="text-celadon-700" />
          </div>
          <span className="text-lg font-bold text-celadon-800 relative z-10">
            {user?.name || 'משתמש'}
          </span>
        </div>

        <div>
          <label className="text-sm text-gray-600 mb-1 block">שם</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="השם שלך..."
            className="w-full border border-celadon-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-celadon-400"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600 mb-1 block">תפקיד</label>
          <input
            type="text"
            value={role}
            onChange={e => setRole(e.target.value)}
            placeholder="התפקיד שלך..."
            className="w-full border border-celadon-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-celadon-400"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600 mb-1 block">מחלקה</label>
          <select
            value={department}
            onChange={e => setDepartment(e.target.value)}
            className="w-full border border-celadon-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-celadon-400 appearance-none"
          >
            <option value="">בחר מחלקה</option>
            {DEPARTMENTS.map(d => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className={`btn-press w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-celadon-500 text-white shadow-md'
          }`}
        >
          <Save size={18} />
          {saved ? 'נשמר!' : 'שמור'}
        </button>
      </form>
    </div>
  )
}
