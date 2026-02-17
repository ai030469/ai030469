import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Loader2 } from 'lucide-react';
import { getEvent } from '../utils/api';
import EventForm from '../components/EventForm';

export default function ManualForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [eventData, setEventData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEdit) {
      getEvent(id)
        .then(res => { setEventData(res.data); setLoading(false); })
        .catch(() => { setError('לא נמצא האירוע'); setLoading(false); });
    }
  }, [id, isEdit]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-sky-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">{error}</p>
        <button onClick={() => navigate('/')} className="btn-secondary mt-4">חזור</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(isEdit ? `/event/${id}` : '/')} className="p-2 rounded-xl hover:bg-gray-100">
            <ChevronRight size={20} />
          </button>
          <div>
            <h1 className="page-title">{isEdit ? 'עריכת אירוע' : 'אירוע חדש'}</h1>
            <p className="page-subtitle">{isEdit ? 'עדכן את פרטי האירוע' : 'הזן את פרטי האירוע'}</p>
          </div>
        </div>
      </div>

      <EventForm
        initialData={eventData || {}}
        eventId={isEdit ? id : null}
        onSuccess={() => navigate(isEdit ? `/event/${id}` : '/')}
        onCancel={() => navigate(isEdit ? `/event/${id}` : '/')}
      />
    </div>
  );
}
