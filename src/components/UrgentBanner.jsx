import { AlertTriangle } from 'lucide-react'

export default function UrgentBanner({ count }) {
  return (
    <div className="bg-red-50 border-b border-red-200 px-4 py-2 flex items-center gap-2 justify-center sticky top-0 z-50">
      <AlertTriangle size={16} className="text-red-500" />
      <span className="text-sm text-red-700">
        מספר משימות דחופות פתוחות:{' '}
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold">
          {count}
        </span>
      </span>
    </div>
  )
}
