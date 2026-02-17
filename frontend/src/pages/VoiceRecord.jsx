import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Square, Loader2, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { extractFields } from '../utils/api';
import EventForm from '../components/EventForm';

const PHASES = { idle: 'idle', recording: 'recording', processing: 'processing', confirm: 'confirm' };

export default function VoiceRecord() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(PHASES.idle);
  const [transcript, setTranscript] = useState('');
  const [extracted, setExtracted] = useState(null);
  const [error, setError] = useState(null);
  const [timer, setTimer] = useState(0);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  const startRecording = useCallback(async () => {
    setError(null);
    setTranscript('');

    // Try Web Speech API first (Chrome/Edge)
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'he-IL';
      recognition.continuous = true;
      recognition.interimResults = true;

      let finalTranscript = '';

      recognition.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) finalTranscript += t + ' ';
          else interim += t;
        }
        setTranscript(finalTranscript + interim);
      };

      recognition.onerror = (event) => {
        setError(`שגיאת זיהוי קול: ${event.error}`);
        stopRecording();
      };

      recognition.start();
      recognitionRef.current = { recognition, getFinal: () => finalTranscript };
    } else {
      // Fallback: just record audio (no transcription without API)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
      } catch (e) {
        setError('לא ניתן לגשת למיקרופון. אנא אשר גישה.');
        return;
      }
    }

    setPhase(PHASES.recording);
    setTimer(0);
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
  }, []);

  const stopRecording = useCallback(async () => {
    clearInterval(timerRef.current);

    if (recognitionRef.current) {
      recognitionRef.current.recognition.stop();
      const finalText = recognitionRef.current.getFinal() || transcript;
      recognitionRef.current = null;
      await processTranscript(finalText.trim());
    } else if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream?.getTracks().forEach(t => t.stop());
      mediaRecorderRef.current = null;
      setPhase(PHASES.confirm);
      setExtracted({});
    }
  }, [transcript]);

  const processTranscript = async (text) => {
    if (!text) {
      setError('לא זוהה דיבור. נסה שוב.');
      setPhase(PHASES.idle);
      return;
    }

    setPhase(PHASES.processing);
    try {
      const res = await extractFields(text);
      setExtracted(res.data || {});
      setTranscript(text);
      setPhase(PHASES.confirm);
    } catch (e) {
      setError('שגיאה בחילוץ פרטים. נסה שוב.');
      setPhase(PHASES.idle);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (phase === PHASES.confirm && extracted !== null) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => { setPhase(PHASES.idle); setExtracted(null); }} className="p-2 rounded-xl hover:bg-gray-100">
            <ChevronRight size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">אשר ועדכן פרטים</h1>
            <p className="text-sm text-gray-500">פרטים חולצו מהתמלול – ניתן לערוך</p>
          </div>
        </div>

        {transcript && (
          <div className="card bg-sky-50 border-sky-200">
            <div className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-sky-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-sky-600 mb-1">תמלול</p>
                <p className="text-sm text-gray-700 leading-relaxed">{transcript}</p>
              </div>
            </div>
          </div>
        )}

        <EventForm
          initialData={{ ...extracted, transcript_raw: transcript }}
          onSuccess={() => navigate('/')}
          onCancel={() => setPhase(PHASES.idle)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-xl hover:bg-gray-100">
            <ChevronRight size={20} />
          </button>
          <div>
            <h1 className="page-title">הוסף אירוע בהקלטה</h1>
            <p className="page-subtitle">לחץ הקלט ודבר בעברית – האפליקציה תמלא אוטומטית</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="card bg-red-50 border-red-200 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Recording UI */}
      <div className="flex flex-col items-center py-8 space-y-8">
        {/* Big Record Button */}
        <div className="relative">
          {phase === PHASES.recording && (
            <div className="absolute inset-0 rounded-full bg-red-400 opacity-30 recording-pulse" />
          )}
          <button
            onClick={phase === PHASES.recording ? stopRecording : startRecording}
            disabled={phase === PHASES.processing}
            className={`relative w-32 h-32 rounded-full flex flex-col items-center justify-center gap-2
              shadow-card hover:shadow-card-hover active:scale-95 transition-all duration-200
              ${phase === PHASES.recording
                ? 'bg-red-500 text-white'
                : phase === PHASES.processing
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-red-500 border-4 border-red-200 hover:border-red-400'
              }`}
          >
            {phase === PHASES.processing ? (
              <Loader2 size={36} className="animate-spin" />
            ) : phase === PHASES.recording ? (
              <>
                <Square size={32} fill="white" />
                <span className="text-xs font-bold">עצור</span>
              </>
            ) : (
              <>
                <Mic size={36} />
                <span className="text-xs font-bold">הקלט</span>
              </>
            )}
          </button>
        </div>

        {/* Timer */}
        {phase === PHASES.recording && (
          <div className="text-2xl font-mono font-bold text-red-500">
            {formatTime(timer)}
          </div>
        )}

        {/* Status text */}
        <div className="text-center max-w-xs">
          {phase === PHASES.idle && (
            <p className="text-gray-400 text-sm">לחץ על כפתור ההקלטה ותאר את האירוע<br />לדוגמה: "ישיבת צוות יום שלישי בשעה 10 בחדר ישיבות A"</p>
          )}
          {phase === PHASES.recording && (
            <p className="text-red-400 text-sm font-medium animate-pulse">מקליט... דבר בבירור</p>
          )}
          {phase === PHASES.processing && (
            <p className="text-gray-500 text-sm">מעבד ומחלץ פרטים...</p>
          )}
        </div>

        {/* Live transcript */}
        {phase === PHASES.recording && transcript && (
          <div className="card w-full max-w-sm bg-gray-50">
            <p className="text-xs font-semibold text-gray-400 mb-2">תמלול חי</p>
            <p className="text-sm text-gray-700 leading-relaxed">{transcript}</p>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="card bg-sky-50 border-sky-200">
        <h3 className="text-sm font-bold text-sky-700 mb-3">💡 טיפים להקלטה מוצלחת</h3>
        <ul className="space-y-1.5 text-sm text-sky-600">
          <li>• ציין שם האירוע, תאריך, ושעה</li>
          <li>• ניתן לומר "יום שלישי הבא" או "עוד שבועיים"</li>
          <li>• ציין מיקום ומספר משתתפים</li>
          <li>• הוסף משימות: "צריך להכין מצגת, לשריין חדר ישיבות"</li>
        </ul>
      </div>

      {/* Manual fallback */}
      <div className="text-center">
        <button onClick={() => navigate('/add')} className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2">
          הוסף ידנית במקום
        </button>
      </div>
    </div>
  );
}
