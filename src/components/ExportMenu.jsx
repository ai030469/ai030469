import { useState } from 'react'
import { Share2, FileDown, MessageCircle, Mail, X } from 'lucide-react'
import { downloadCSV, shareViaWhatsApp, shareViaEmail, tasksToText } from '../utils/export.js'

export default function ExportMenu({ tasks, title = 'משימות' }) {
  const [open, setOpen] = useState(false)

  if (!tasks || tasks.length === 0) return null

  const handleCSV = () => {
    downloadCSV(tasks, `${title}.csv`)
    setOpen(false)
  }

  const handleWhatsApp = () => {
    const text = `${title}\n\n${tasksToText(tasks)}`
    shareViaWhatsApp(text)
    setOpen(false)
  }

  const handleEmail = () => {
    const body = tasksToText(tasks)
    shareViaEmail(title, body)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="btn-press flex items-center gap-1.5 px-3 py-2 rounded-xl bg-celadon-50 text-celadon-700 border border-celadon-200 text-sm"
      >
        <Share2 size={16} />
        <span>ייצוא</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-2 left-0 bg-white rounded-xl shadow-lg border border-celadon-100 z-50 min-w-[180px] overflow-hidden">
            <button onClick={handleCSV} className="btn-press flex items-center gap-2 px-4 py-3 w-full text-sm text-gray-700 hover:bg-celadon-50 transition-colors">
              <FileDown size={16} className="text-celadon-600" />
              <span>הורד CSV</span>
            </button>
            <button onClick={handleWhatsApp} className="btn-press flex items-center gap-2 px-4 py-3 w-full text-sm text-gray-700 hover:bg-celadon-50 transition-colors border-t border-celadon-50">
              <MessageCircle size={16} className="text-green-600" />
              <span>שתף בוואטסאפ</span>
            </button>
            <button onClick={handleEmail} className="btn-press flex items-center gap-2 px-4 py-3 w-full text-sm text-gray-700 hover:bg-celadon-50 transition-colors border-t border-celadon-50">
              <Mail size={16} className="text-blue-600" />
              <span>שלח במייל</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
