import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Plus, TableProperties, CalendarDays, RefreshCw } from 'lucide-react';
import { getEvents } from '../utils/api';
import { getUpcomingRange } from '../utils/dates';
import EventCard from '../components/EventCard';

export default function Home() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const { start, end } = getUpcomingRange();
      const res = await getEvents({ from: start, to: end });
      setEvents(res.data || []);
    } catch (e) {
      setError('שגיאה בטעינת אירועים. ודא שהשרת פועל.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const upcoming = events.filter(e => !e.is_done);
  const done = events.filter(e => e.is_done);

  return (
    <div className="space-y-8">
      {/* Hero section */}
      <div className="text-center pt-2 pb-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-sky-200 to-mint-200 mb-4 shadow-soft">
          <CalendarDays size={32} className="text-sky-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">מתכנן אירועים שבועי</h1>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">נהל אירועים, הקלט בקול, וקבל סיכום שבועי אוטומטי</p>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button
          onClick={() => navigate('/voice')}
          className="flex items-center justify-center gap-3 p-5 bg-gradient-to-br from-red-400 to-red-500 text-white rounded-2xl shadow-card hover:shadow-card-hover active:scale-[0.98] transition-all duration-200"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Mic size={22} />
          </div>
          <div className="text-right">
            <div className="font-bold text-base">הוסף בהקלטה</div>
            <div className="text-xs opacity-80">דבר ואנחנו נמלא</div>
          </div>
        </button>

        <button
          onClick={() => navigate('/add')}
          className="flex items-center justify-center gap-3 p-5 bg-gradient-to-br from-sky-400 to-sky-500 text-white rounded-2xl shadow-card hover:shadow-card-hover active:scale-[0.98] transition-all duration-200"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Plus size={22} />
          </div>
          <div className="text-right">
            <div className="font-bold text-base">הוסף ידנית</div>
            <div className="text-xs opacity-80">טופס מלא</div>
          </div>
        </button>

        <button
          onClick={() => navigate('/weekly')}
          className="flex items-center justify-center gap-3 p-5 bg-gradient-to-br from-mint-400 to-mint-500 text-white rounded-2xl shadow-card hover:shadow-card-hover active:scale-[0.98] transition-all duration-200"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <TableProperties size={22} />
          </div>
          <div className="text-right">
            <div className="font-bold text-base">סיכום שבוע הבא</div>
            <div className="text-xs opacity-80">טבלה מסודרת</div>
          </div>
        </button>
      </div>

      {/* Upcoming events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">אירועים קרובים</h2>
            <p className="text-xs text-gray-400">14 ימים הבאים</p>
          </div>
          <button onClick={load} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
                <div className="h-5 bg-gray-100 rounded w-2/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="card text-center py-8">
            <div className="text-red-400 mb-2 text-2xl">⚠️</div>
            <p className="text-gray-500 text-sm">{error}</p>
            <button onClick={load} className="btn-secondary mt-4 text-sm">נסה שוב</button>
          </div>
        ) : upcoming.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-5xl mb-4">📅</div>
            <p className="text-gray-500 font-medium mb-1">אין אירועים קרובים</p>
            <p className="text-gray-400 text-sm mb-4">הוסף את האירוע הראשון שלך</p>
            <button onClick={() => navigate('/add')} className="btn-primary mx-auto inline-flex">
              <Plus size={16} />
              הוסף אירוע
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {done.length > 0 && !loading && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">הושלמו</h3>
            <div className="space-y-2">
              {done.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
