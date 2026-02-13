import { useState, useRef, useCallback } from 'react'
import { Mic, MicOff, Square } from 'lucide-react'

export default function VoiceRecorder({ onTranscript }) {
  const [isRecording, setIsRecording] = useState(false)
  const [isSupported] = useState(() =>
    typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  )
  const recognitionRef = useRef(null)
  const fullTranscriptRef = useRef('')

  const startRecording = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.lang = 'he-IL'
    recognition.continuous = true
    recognition.interimResults = false

    fullTranscriptRef.current = ''

    recognition.onresult = (event) => {
      let transcript = ''
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript + ' '
        }
      }
      fullTranscriptRef.current = transcript.trim()
    }

    recognition.onerror = () => {
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
      if (fullTranscriptRef.current) {
        onTranscript(fullTranscriptRef.current)
      }
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsRecording(true)
  }, [onTranscript])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }, [])

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm p-3 bg-gray-50 rounded-xl">
        <MicOff size={18} />
        <span>הקלטה קולית אינה נתמכת בדפדפן זה</span>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={isRecording ? stopRecording : startRecording}
      className={`btn-press flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all w-full justify-center ${
        isRecording
          ? 'bg-red-50 text-red-600 border border-red-200'
          : 'bg-celadon-50 text-celadon-700 border border-celadon-200'
      }`}
    >
      <span className={`relative ${isRecording ? 'recording-pulse' : ''}`}>
        {isRecording ? <Square size={18} /> : <Mic size={18} />}
      </span>
      {isRecording ? 'עצור הקלטה' : 'הקלט הודעה קולית'}
    </button>
  )
}
