import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, CheckSquare, ChevronLeft } from 'lucide-react';
import { formatDateHe, getDayName, getPriorityClass, getPriorityLabel, formatTime } from '../utils/dates';

export default function EventCard({ event }) {
  const navigate = useNavigate();
  const doneTasks = event.tasks?.filter(t => t.is_done).length || 0;
  const totalTasks = event.tasks?.length || 0;

  return (
    <div
      onClick={() => navigate(`/event/${event.id}`)}
      className={`card cursor-pointer hover:shadow-card-hover transition-all duration-200 active:scale-[0.99] group
        ${event.is_done ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Name + priority */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`badge ${getPriorityClass(event.priority)}`}>
              {getPriorityLabel(event.priority)}
            </span>
            {event.is_done && (
              <span className="badge bg-mint-100 text-mint-500 border border-mint-200">הושלם</span>
            )}
          </div>

          <h3 className="font-bold text-gray-800 text-base truncate group-hover:text-sky-600 transition-colors">
            {event.event_name}
          </h3>

          {/* Date + time */}
          <div className="flex items-center gap-1 mt-1.5 text-sm text-gray-500">
            <Clock size={13} />
            <span>{getDayName(event.date)}, {formatDateHe(event.date)}</span>
            {event.start_time && (
              <>
                <span className="text-gray-300 mx-0.5">•</span>
                <span>{formatTime(event.start_time)}{event.end_time ? `–${formatTime(event.end_time)}` : ''}</span>
              </>
            )}
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-1 mt-1 text-sm text-gray-400">
              <MapPin size={13} />
              <span className="truncate">{event.location}</span>
            </div>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50">
            {event.attendees_count > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Users size={12} />
                <span>{event.attendees_count} משתתפים</span>
              </div>
            )}
            {totalTasks > 0 && (
              <div className={`flex items-center gap-1 text-xs ${doneTasks === totalTasks ? 'text-mint-500' : 'text-gray-400'}`}>
                <CheckSquare size={12} />
                <span>{doneTasks}/{totalTasks} משימות</span>
              </div>
            )}
          </div>
        </div>

        <ChevronLeft size={18} className="text-gray-300 group-hover:text-sky-400 transition-colors flex-shrink-0 mt-1" />
      </div>
    </div>
  );
}
