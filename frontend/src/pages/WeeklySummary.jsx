import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight, ChevronLeft, Download, Sheet, Loader2,
  CalendarDays, Users, MapPin, Clock, CheckSquare, RefreshCw
} from 'lucide-react';
import { getWeeklySummary, exportToExcel, exportToGoogleSheets } from '../utils/api';
import { formatDateHe, getDayName, getNextSunday, formatTime, getPriorityClass, getPriorityLabel } from '../utils/dates';

export default function WeeklySummary() {
  const navigate = useNavigate();
  const [weekStart, setWeekStart] = useState(getNextSunday());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [sheetsMsg, setSheetsMsg] = useState(null);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getWeeklySummary(weekStart);
      setData(res.data);
    } catch {
      setError('שגיאה בטעינת סיכום שבועי');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [weekStart]);

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d.toISOString().split('T')[0]);
  };

  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d.toISOString().split('T')[0]);
  };

  const handleExcelExport = () => {
    exportToExcel(weekStart);
  };

  const handleSheetsExport = async () => {
    setExporting(true);
    setSheetsMsg(null);
    try {
      const res = await exportToGoogleSheets({ weekStart });
      setSheetsMsg({ type: 'success', text: res.message });
    } catch (e) {
      setSheetsMsg({ type: 'error', text: e.response?.data?.error || 'שגיאה ביצוא' });
    } finally {
      setExporting(false);
    }
  };

  const events = data?.events || [];
  const grouped = data?.grouped || {};

  // Build sorted day entries
  const dayEntries = Object.keys(grouped).sort();

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-2 rounded-xl hover:bg-gray-100">
          <ChevronRight size={20} />
        </button>
        <div className="flex-1">
          <h1 className="page-title">סיכום שבועי</h1>
          <p className="page-subtitle">אירועים לפי ימים</p>
        </div>
        <button onClick={load} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Week Navigator */}
      <div className="card">
        <div className="flex items-center justify-between">
          <button onClick={prevWeek} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
            <ChevronRight size={20} />
          </button>

          <div className="text-center">
            <div className="flex items-center gap-2 justify-center">
              <CalendarDays size={16} className="text-sky-400" />
              <span className="font-bold text-gray-800 text-sm">
                {formatDateHe(weekStart)}
              </span>
            </div>
            <span className="text-xs text-gray-400">
              עד {data?.weekEnd ? formatDateHe(data.weekEnd) : ''}
            </span>
          </div>

          <button onClick={nextWeek} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="flex items-center justify-center gap-6 mt-3 pt-3 border-t border-gray-50">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{events.length}</div>
              <div className="text-xs text-gray-400">אירועים</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">
                {events.reduce((s, e) => s + (e.attendees_count || 0), 0)}
              </div>
              <div className="text-xs text-gray-400">משתתפים</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{dayEntries.length}</div>
              <div className="text-xs text-gray-400">ימים פעילים</div>
            </div>
          </div>
        )}
      </div>

      {/* Export buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleExcelExport}
          className="btn-secondary flex-1 text-sm"
        >
          <Download size={16} />
          יצא Excel
        </button>
        <button
          onClick={handleSheetsExport}
          disabled={exporting}
          className="btn-primary flex-1 text-sm"
        >
          {exporting ? <Loader2 size={16} className="animate-spin" /> : <Sheet size={16} />}
          Google Sheets
        </button>
      </div>

      {sheetsMsg && (
        <div className={`card text-sm ${sheetsMsg.type === 'success' ? 'bg-mint-50 text-mint-700 border-mint-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
          {sheetsMsg.text}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="animate-spin text-sky-400" />
        </div>
      ) : error ? (
        <div className="card text-center py-8">
          <p className="text-gray-500">{error}</p>
          <button onClick={load} className="btn-secondary mt-4">נסה שוב</button>
        </div>
      ) : events.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">📅</div>
          <p className="text-gray-500 font-medium mb-1">אין אירועים לשבוע זה</p>
          <p className="text-gray-400 text-sm">נסה שבוע אחר או הוסף אירועים חדשים</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full weekly-table" dir="rtl">
                <thead>
                  <tr className="bg-gradient-to-r from-sky-50 to-mint-50 border-b border-gray-100">
                    {['יום', 'תאריך', 'שעה', 'שם האירוע', 'מיקום', 'משתתפים', 'עדיפות', 'משימות'].map(h => (
                      <th key={h} className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {events.map((event, idx) => (
                    <tr
                      key={event.id}
                      onClick={() => navigate(`/event/${event.id}`)}
                      className="border-b border-gray-50 hover:bg-sky-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700 whitespace-nowrap">
                        {getDayName(event.date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {formatDateHe(event.date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {event.start_time ? (
                          <span>{formatTime(event.start_time)}{event.end_time ? `–${formatTime(event.end_time)}` : ''}</span>
                        ) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-gray-800 text-sm">{event.event_name}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-[160px]">
                        {event.location || <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-center">
                        {event.attendees_count || <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge text-xs ${getPriorityClass(event.priority)}`}>
                          {getPriorityLabel(event.priority)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px]">
                        {event.tasks_text
                          ? event.tasks_text.split(' | ').slice(0, 2).join(', ') + (event.tasks_text.split(' | ').length > 2 ? '...' : '')
                          : <span className="text-gray-300">—</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile: cards grouped by day */}
          <div className="md:hidden space-y-4">
            {dayEntries.map(dateStr => {
              const dayEvents = grouped[dateStr];
              return (
                <div key={dateStr} className="card p-0 overflow-hidden">
                  <div className="bg-gradient-to-r from-sky-50 to-mint-50 px-4 py-3 border-b border-gray-100">
                    <div className="font-bold text-gray-700 text-sm">{getDayName(dateStr)}</div>
                    <div className="text-xs text-gray-400">{formatDateHe(dateStr)}</div>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {dayEvents.map(row => (
                      <div
                        key={row._event.id}
                        onClick={() => navigate(`/event/${row._event.id}`)}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-800 text-sm truncate">{row['שם האירוע']}</div>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {row['שעה'] !== '—' && (
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                  <Clock size={11} />{row['שעה']}
                                </span>
                              )}
                              {row['מיקום'] !== '—' && (
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                  <MapPin size={11} />{row['מיקום']}
                                </span>
                              )}
                              {row['כמות משתתפים'] !== '—' && (
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                  <Users size={11} />{row['כמות משתתפים']}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className={`badge text-xs flex-shrink-0 ${getPriorityClass(row._event.priority)}`}>
                            {getPriorityLabel(row._event.priority)}
                          </span>
                        </div>
                        {row['משימות עיקריות'] !== '—' && (
                          <div className="flex items-start gap-1 mt-2 text-xs text-gray-400">
                            <CheckSquare size={11} className="flex-shrink-0 mt-0.5" />
                            <span className="truncate">{row['משימות עיקריות']}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
