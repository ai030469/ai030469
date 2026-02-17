import { useState } from 'react';
import { Plus, X, Loader2, AlertCircle } from 'lucide-react';
import { createEvent, updateEvent } from '../utils/api';

const PRIORITY_OPTIONS = [
  { value: 'Low', label: 'נמוכה', color: 'bg-mint-50 text-mint-600 border-mint-200' },
  { value: 'Medium', label: 'בינונית', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { value: 'High', label: 'גבוהה', color: 'bg-red-50 text-red-600 border-red-200' },
];

export default function EventForm({ initialData = {}, eventId = null, onSuccess, onCancel }) {
  const isEdit = !!eventId;

  const [form, setForm] = useState({
    event_name: initialData.event_name || '',
    date: initialData.date || '',
    start_time: initialData.start_time || '',
    end_time: initialData.end_time || '',
    location: initialData.location || '',
    attendees_count: initialData.attendees_count || '',
    special_requirements: initialData.special_requirements || '',
    notes: initialData.notes || '',
    priority: initialData.priority || 'Medium',
    transcript_raw: initialData.transcript_raw || ''
  });

  const [tasks, setTasks] = useState(
    (initialData.tasks || []).map(t =>
      typeof t === 'string' ? { task_text: t, is_done: false, id: Math.random() }
      : { ...t, id: t.id || Math.random() }
    )
  );
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: null }));
  };

  const addTask = () => {
    const trimmed = newTask.trim();
    if (!trimmed) return;
    setTasks(t => [...t, { task_text: trimmed, is_done: false, id: Math.random() }]);
    setNewTask('');
  };

  const removeTask = (id) => setTasks(t => t.filter(task => task.id !== id));
  const toggleTask = (id) => setTasks(t => t.map(task => task.id === id ? { ...task, is_done: !task.is_done } : task));

  const validate = () => {
    const errs = {};
    if (!form.event_name.trim()) errs.event_name = 'שם האירוע הוא שדה חובה';
    if (!form.date) errs.date = 'תאריך הוא שדה חובה';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError(null);

    try {
      const payload = {
        ...form,
        attendees_count: form.attendees_count ? parseInt(form.attendees_count) : 0,
        tasks: tasks.map(t => ({ task_text: t.task_text, is_done: t.is_done }))
      };

      if (isEdit) {
        await updateEvent(eventId, payload);
      } else {
        await createEvent(payload);
      }

      onSuccess?.();
    } catch (err) {
      setApiError(err.response?.data?.error || 'שגיאה בשמירת האירוע');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      {apiError && (
        <div className="card bg-red-50 border-red-200 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-red-700 text-sm">{apiError}</p>
        </div>
      )}

      {/* Section: Basic Info */}
      <div className="card space-y-4">
        <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide text-gray-400 border-b pb-2">פרטים בסיסיים</h3>

        <div>
          <label className="label">שם האירוע <span className="text-red-400">*</span></label>
          <input
            type="text"
            value={form.event_name}
            onChange={e => set('event_name', e.target.value)}
            placeholder="לדוגמה: ישיבת צוות שבועית"
            className={`input-field ${errors.event_name ? 'border-red-400 ring-2 ring-red-100' : ''}`}
          />
          {errors.event_name && <p className="text-xs text-red-500 mt-1">{errors.event_name}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="label">תאריך <span className="text-red-400">*</span></label>
            <input
              type="date"
              value={form.date}
              onChange={e => set('date', e.target.value)}
              className={`input-field ${errors.date ? 'border-red-400 ring-2 ring-red-100' : ''}`}
            />
            {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
          </div>
          <div>
            <label className="label">שעת התחלה</label>
            <input
              type="time"
              value={form.start_time}
              onChange={e => set('start_time', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">שעת סיום</label>
            <input
              type="time"
              value={form.end_time}
              onChange={e => set('end_time', e.target.value)}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Section: Location & People */}
      <div className="card space-y-4">
        <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide text-gray-400 border-b pb-2">מיקום ומשתתפים</h3>

        <div>
          <label className="label">מיקום</label>
          <input
            type="text"
            value={form.location}
            onChange={e => set('location', e.target.value)}
            placeholder="לדוגמה: חדר ישיבות A, קומה 3"
            className="input-field"
          />
        </div>

        <div>
          <label className="label">כמות משתתפים</label>
          <input
            type="number"
            value={form.attendees_count}
            onChange={e => set('attendees_count', e.target.value)}
            placeholder="0"
            min="0"
            className="input-field w-32"
          />
        </div>
      </div>

      {/* Section: Tasks */}
      <div className="card space-y-3">
        <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide text-gray-400 border-b pb-2">משימות לוגיסטיות</h3>

        <div className="space-y-2">
          {tasks.map(task => (
            <div key={task.id} className="flex items-center gap-2 group">
              <input
                type="checkbox"
                checked={task.is_done}
                onChange={() => toggleTask(task.id)}
                className="rounded border-gray-300 text-sky-500 focus:ring-sky-300"
              />
              <span className={`flex-1 text-sm ${task.is_done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {task.task_text}
              </span>
              <button
                type="button"
                onClick={() => removeTask(task.id)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-red-400 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-1">
          <input
            type="text"
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTask())}
            placeholder="הוסף משימה... (Enter לשמירה)"
            className="input-field flex-1 text-sm"
          />
          <button
            type="button"
            onClick={addTask}
            className="p-3 rounded-xl bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Section: Priority & Notes */}
      <div className="card space-y-4">
        <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide text-gray-400 border-b pb-2">עדיפות והערות</h3>

        <div>
          <label className="label">עדיפות</label>
          <div className="flex gap-2">
            {PRIORITY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => set('priority', opt.value)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                  form.priority === opt.value
                    ? `${opt.color} shadow-soft`
                    : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">דרישות מיוחדות</label>
          <input
            type="text"
            value={form.special_requirements}
            onChange={e => set('special_requirements', e.target.value)}
            placeholder="לדוגמה: מקרן, קפה, תפריט צמחוני"
            className="input-field"
          />
        </div>

        <div>
          <label className="label">הערות</label>
          <textarea
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            rows={3}
            placeholder="הערות נוספות..."
            className="input-field resize-none"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pb-4">
        <button type="submit" disabled={loading} className="btn-success flex-1">
          {loading ? <Loader2 size={18} className="animate-spin" /> : null}
          {isEdit ? 'עדכן אירוע' : 'שמור אירוע'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            ביטול
          </button>
        )}
      </div>
    </form>
  );
}
