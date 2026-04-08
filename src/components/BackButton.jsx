import { useNavigate } from 'react-router-dom'
import { ArrowRight, Home } from 'lucide-react'

export default function BackButton({ title }) {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-between mb-4 pt-2">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="btn-press p-2 rounded-xl bg-celadon-50 text-celadon-700 border border-celadon-200"
        >
          <ArrowRight size={18} />
        </button>
        <button
          onClick={() => navigate('/')}
          className="btn-press p-2 rounded-xl bg-celadon-50 text-celadon-700 border border-celadon-200"
        >
          <Home size={18} />
        </button>
      </div>
      {title && <h1 className="text-lg font-bold text-celadon-800">{title}</h1>}
    </div>
  )
}
