import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTask } from '../context/TaskContext.jsx'
import BackButton from '../components/BackButton.jsx'
import VoiceRecorder from '../components/VoiceRecorder.jsx'
import { Check, Calendar, Mic, Type } from 'lucide-react'

const ASSIGNEES = ['עמית', 'נריה', 'חגית', 'לירון', 'רכש', 'רמות', 'שיפקה']

export default function NewTask() {
  const navigate = useNavigate()
  const { addTask } = useTask()

  const todayStr = new Date().toISOString().split('T')[0]
  const [text, setText] = useState('')
  const [date, setDate] = useState(todayStr)
  const [priority, setPriority] = useState('medium')
  const [assignee, setAssignee] = useState('')
  const [customAssignee, setCustomAssignee] = useState('')
  const [inputMode, setInputMode] = useState('text') // 'text' | 'voice'
  const [voiceText, setVoiceText] = useState('')
  const [showVoiceConfirm, setShowVoiceConfirm] = useState(false)

  const handleVoiceTranscript = useCallback((transcript) => {
    setVoiceText(transcript)
    setShowVoiceConfirm(true)
  }, [])

  const confirmVoice = () => {
    setText(voiceText)
    setShowVoiceConfirm(false)
    setInputMode('text')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim()) return

    const finalAssignee = assignee === 'other' ? customAssignee : assignee

    addTask({
      text: text.trim(),
      date,
      priority,
      assignee: finalAssignee || 'לא שויך',
    })

    navigate('/tasks')
  }

  return (
    <div>
      <BackButton title="הערה חדשה" />

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date */}
        <div>
          <label className="text-sm text-gray-600 mb-1 block">
            <Calendar size={14} className="inline ml-1" />
            תאריך
          </label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full border border-celadon-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-celadon-400"
          />
        </div>

        {/* Input mode toggle */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setInputMode('text')}
            className={`btn-press flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm border transition-colors ${
              inputMode === 'text'
                ? 'bg-celadon-500 text-white border-celadon-500'
                : 'bg-white text-gray-500 border-celadon-200'
            }`}
          >
            <Type size={16} />
            טקסט
          </button>
          <button
            type="button"
            onClick={() => setInputMode('voice')}
            className={`btn-press flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm border transition-colors ${
              inputMode === 'voice'
                ? 'bg-celadon-500 text-white border-celadon-500'
                : 'bg-white text-gray-500 border-celadon-200'
            }`}
          >
            <Mic size={16} />
            הקלטה
          </button>
        </div>

        {/* Text input or Voice */}
        {inputMode === 'text' ? (
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="תוכן המשימה..."
            rows={4}
            className="w-full border border-celadon-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-celadon-400 resize-none"
          />
        ) : (
          <div className="space-y-3">
            <VoiceRecorder onTranscript={handleVoiceTranscript} />
            {showVoiceConfirm && (
              <div className="border border-celadon-200 rounded-xl p-3 bg-celadon-50/50 space-y-2">
                <p className="text-xs text-gray-500">תוצאת ההקלטה (ניתן לערוך):</p>
                <textarea
                  value={voiceText}
                  onChange={e => setVoiceText(e.target.value)}
                  rows={3}
                  className="w-full border border-celadon-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-celadon-400 resize-none"
                />
                <button
                  type="button"
                  onClick={confirmVoice}
                  className="btn-press w-full py-2 rounded-lg bg-celadon-500 text-white text-sm font-medium"
                >
                  אישור
                </button>
              </div>
            )}
          </div>
        )}

        {/* Show current text if set via voice */}
        {inputMode === 'voice' && text && !showVoiceConfirm && (
          <div className="bg-celadon-50 rounded-xl p-3 text-sm text-celadon-800 border border-celadon-200">
            <span className="text-xs text-gray-400 block mb-1">תוכן המשימה:</span>
            {text}
          </div>
        )}

        {/* Priority */}
        <div>
          <label className="text-sm text-gray-600 mb-2 block">עדיפות</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPriority('medium')}
              className={`btn-press flex-1 py-2.5 rounded-xl text-sm border transition-colors ${
                priority === 'medium'
                  ? 'bg-celadon-500 text-white border-celadon-500'
                  : 'bg-white text-gray-500 border-celadon-200'
              }`}
            >
              בינוני
            </button>
            <button
              type="button"
              onClick={() => setPriority('urgent')}
              className={`btn-press flex-1 py-2.5 rounded-xl text-sm border transition-colors ${
                priority === 'urgent'
                  ? 'bg-red-500 text-white border-red-500'
                  : 'bg-white text-gray-500 border-celadon-200'
              }`}
            >
              דחוף
            </button>
          </div>
        </div>

        {/* Assignee */}
        <div>
          <label className="text-sm text-gray-600 mb-1 block">גורם מטפל</label>
          <select
            value={assignee}
            onChange={e => setAssignee(e.target.value)}
            className="w-full border border-celadon-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-celadon-400 appearance-none"
          >
            <option value="">בחר גורם מטפל</option>
            {ASSIGNEES.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
            <option value="other">אחר</option>
          </select>
          {assignee === 'other' && (
            <input
              type="text"
              value={customAssignee}
              onChange={e => setCustomAssignee(e.target.value)}
              placeholder="הקלד שם..."
              className="w-full border border-celadon-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-celadon-400 mt-2"
            />
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!text.trim()}
          className={`btn-press w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
            text.trim()
              ? 'bg-celadon-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Check size={18} />
          שמור משימה
        </button>
      </form>
    </div>
  )
}
