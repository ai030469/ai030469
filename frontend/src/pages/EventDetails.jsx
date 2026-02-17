import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronRight, Edit2, Trash2, MapPin, Clock, Users, AlertTriangle,
  FileText, CheckSquare, Loader2, CheckCircle2, Circle
} from 'lucide-react';
import { getEvent, deleteEvent, updateEvent, toggleTask } from '../utils/api';
import { formatDateHe, getDayName, getPriorityClass, getPriorityLabel, formatTime } from '../utils/dates';

export default function EventDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      const res = await getEvent(id);
      setEvent(res.data);
    } catch {
      setError('אירוע לא נמצא');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      await deleteEvent(id);
      navigate('/');
    } catch {
      setError('שגיאה במחיקה');
      setDeleting(false);
    }
  };

  const handleToggleTask = async (taskId, currentDone) => {
    try {
      await toggleTask(taskId, !currentDone);
      setEvent(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? { ...t, is_done: !currentDone } : t)
      }));
    } catch { /* silent */ }
  };

  const handleMarkDone = async () => {
    try {
      const res = await updateEvent(id, { is_done: !event.is_done });
      setEvent(res.data);
    } catch { /* silent */ }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-sky-400" /></div>;
  }

  if (error || !event) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">{error || 'אירוע לא נמצא'}</p>
        <button onClick={() => navigate('/')} className="btn-secondary mt-4">חזור</button>
      </div>
    );
  }

  const doneTasks = event.tasks?.filter(t => t.is_done).length || 0;
  const totalTasks = event.tasks?.length || 0;

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <button onClick={() => navigate('/')} className="p-2 rounded-xl hover:bg-gray-100 mt-0.5">
          <ChevronRight size={20} />
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/event/${id}/edit`)}
            className="flex items-center gap-1.5 px-3 py-2 bg-sky-50 text-sky-600 rounded-xl text-sm font-medium hover:bg-sky-100 transition-colors"
          >
            <Edit2 size={14} />
            ערוך
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              confirmDelete
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-red-50 text-red-500 hover:bg-red-100'
            }`}
          >
            {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            {confirmDelete ? 'אשר מחיקה' : 'מחק'}
          </button>
        </div>
      </div>

      {/* Event title card */}
      <div className="card">
        <div className="flex items-start gap-3 mb-3">
          <span className={`badge ${getPriorityClass(event.priority)} text-xs`}>
            {getPriorityLabel(event.priority)}
          </span>
          {event.is_done && (
            <span className="badge bg-mint-100 text-mint-600 border-mint-200 text-xs">הושלם</span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{event.event_name}</h1>

        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5 text-gray-600">
            <Clock size={16} className="text-sky-400 flex-shrink-0" />
            <div>
              <span className="font-medium">{getDayName(event.date)}, {formatDateHe(event.date)}</span>
              {event.start_time && (
                <span className="text-gray-400 mr-2 text-sm">
                  {formatTime(event.start_time)}{event.end_time ? ` – ${formatTime(event.end_time)}` : ''}
                </span>
              )}
            </div>
          </div>

          {event.location && (
            <div className="flex items-center gap-2.5 text-gray-600">
              <MapPin size={16} className="text-peach-400 flex-shrink-0" />
              <span>{event.location}</span>
            </div>
          )}

          {event.attendees_count > 0 && (
            <div className="flex items-center gap-2.5 text-gray-600">
              <Users size={16} className="text-lavender-400 flex-shrink-0" />
              <span>{event.attendees_count} משתתפים</span>
            </div>
          )}

          {event.special_requirements && (
            <div className="flex items-start gap-2.5 text-gray-600">
              <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <span>{event.special_requirements}</span>
            </div>
          )}

          {event.notes && (
            <div className="flex items-start gap-2.5 text-gray-600">
              <FileText size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm leading-relaxed">{event.notes}</span>
            </div>
          )}
        </div>

        {/* Mark done button */}
        <div className="mt-5 pt-4 border-t border-gray-50">
          <button
            onClick={handleMarkDone}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              event.is_done
                ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                : 'bg-mint-50 text-mint-600 hover:bg-mint-100 border border-mint-200'
            }`}
          >
            <CheckCircle2 size={16} />
            {event.is_done ? 'בטל סימון כבוצע' : 'סמן כבוצע'}
          </button>
        </div>
      </div>

      {/* Tasks */}
      {totalTasks > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-700 flex items-center gap-2">
              <CheckSquare size={18} className="text-sky-400" />
              משימות לוגיסטיות
            </h2>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              doneTasks === totalTasks ? 'bg-mint-100 text-mint-600' : 'bg-gray-100 text-gray-500'
            }`}>
              {doneTasks}/{totalTasks}
            </span>
          </div>

          {/* Progress bar */}
          {totalTasks > 0 && (
            <div className="h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-mint-300 to-mint-400 rounded-full transition-all duration-500"
                style={{ width: `${(doneTasks / totalTasks) * 100}%` }}
              />
            </div>
          )}

          <div className="space-y-2.5">
            {event.tasks.map(task => (
              <button
                key={task.id}
                onClick={() => handleToggleTask(task.id, task.is_done)}
                className="flex items-center gap-3 w-full text-right group hover:bg-gray-50 rounded-xl p-2 -mx-2 transition-colors"
              >
                {task.is_done ? (
                  <CheckCircle2 size={18} className="text-mint-500 flex-shrink-0" />
                ) : (
                  <Circle size={18} className="text-gray-300 group-hover:text-sky-400 flex-shrink-0 transition-colors" />
                )}
                <span className={`text-sm ${task.is_done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                  {task.task_text}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Transcript (if from voice) */}
      {event.transcript_raw && (
        <div className="card bg-gray-50">
          <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">תמלול מקורי</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{event.transcript_raw}</p>
        </div>
      )}
    </div>
  );
}
