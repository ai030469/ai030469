import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import VoiceRecord from './pages/VoiceRecord';
import ManualForm from './pages/ManualForm';
import EventDetails from './pages/EventDetails';
import WeeklySummary from './pages/WeeklySummary';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="voice" element={<VoiceRecord />} />
        <Route path="add" element={<ManualForm />} />
        <Route path="event/:id" element={<EventDetails />} />
        <Route path="event/:id/edit" element={<ManualForm />} />
        <Route path="weekly" element={<WeeklySummary />} />
      </Route>
    </Routes>
  );
}
