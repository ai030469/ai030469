import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTask } from '../context/TaskContext.jsx'
import { CheckCircle2, ChevronLeft } from 'lucide-react'

const DEPARTMENTS = [
  { value: 'ramot', label: 'רמות' },
  { value: 'culinary', label: 'קולינריה' },
  { value: 'tech', label: 'טכנולוגיה' },
  { value: 'shipka', label: 'שיפקה' },
  { value: 'other', label: 'אחר' },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const { setUser } = useTask()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [department, setDepartment] = useState('')

  const handleFinish = () => {
    if (!name.trim()) return
    setUser({ name: name.trim(), role: role.trim(), department })
    navigate('/')
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 bg-[#fafffe]">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo / Header */}
        <div className="text-center space-y-2">
          <div className="w-20 h-20 rounded-full bg-celadon-200 flex items-center justify-center mx-auto">
            <CheckCircle2 size={40} className="text-celadon-600" />
          </div>
          <h1 className="text-2xl font-bold text-celadon-800">מנהל משימות</h1>
          <p className="text-sm text-gray-500">בואו נתחיל! ספרו לנו קצת על עצמכם</p>
        </div>

        {/* Steps */}
        <div className="flex justify-center gap-2 mb-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i <= step ? 'w-8 bg-celadon-500' : 'w-4 bg-celadon-200'
              }`}
            />
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <label className="text-sm text-gray-600 block">מה השם שלך?</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="הקלד את שמך..."
              autoFocus
              className="w-full border border-celadon-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:border-celadon-400"
            />
            <button
              onClick={() => name.trim() && setStep(1)}
              disabled={!name.trim()}
              className={`btn-press w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium ${
                name.trim()
                  ? 'bg-celadon-500 text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              המשך
              <ChevronLeft size={16} />
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <label className="text-sm text-gray-600 block">מה התפקיד שלך?</label>
            <input
              type="text"
              value={role}
              onChange={e => setRole(e.target.value)}
              placeholder="התפקיד שלך..."
              autoFocus
              className="w-full border border-celadon-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:border-celadon-400"
            />
            <button
              onClick={() => setStep(2)}
              className="btn-press w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium bg-celadon-500 text-white"
            >
              המשך
              <ChevronLeft size={16} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <label className="text-sm text-gray-600 block">באיזו מחלקה?</label>
            <div className="grid grid-cols-2 gap-2">
              {DEPARTMENTS.map(d => (
                <button
                  key={d.value}
                  onClick={() => setDepartment(d.value)}
                  className={`btn-press py-3 rounded-xl text-sm border transition-colors ${
                    department === d.value
                      ? 'bg-celadon-500 text-white border-celadon-500'
                      : 'bg-white text-gray-600 border-celadon-200'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <button
              onClick={handleFinish}
              className="btn-press w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium bg-celadon-500 text-white shadow-md"
            >
              <CheckCircle2 size={18} />
              בואו נתחיל!
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
