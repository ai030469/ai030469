export const DAYS_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
export const MONTHS_HE = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
];

export function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDateHe(dateStr) {
  if (!dateStr) return '';
  const d = parseLocalDate(dateStr);
  return `${d.getDate()} ${MONTHS_HE[d.getMonth()]} ${d.getFullYear()}`;
}

export function getDayName(dateStr) {
  if (!dateStr) return '';
  const d = parseLocalDate(dateStr);
  return `יום ${DAYS_HE[d.getDay()]}`;
}

export function getNextSunday() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 7 : (7 - day);
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
  return next.toISOString().split('T')[0];
}

export function getWeekRange(startDateStr) {
  const start = parseLocalDate(startDateStr);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return {
    start: startDateStr,
    end: end.toISOString().split('T')[0]
  };
}

export function getUpcomingRange() {
  const today = new Date();
  const start = today.toISOString().split('T')[0];
  const end = new Date(today);
  end.setDate(end.getDate() + 14);
  return { start, end: end.toISOString().split('T')[0] };
}

export function formatTime(time) {
  if (!time) return null;
  return time.substring(0, 5);
}

export function getPriorityLabel(priority) {
  const map = { High: 'גבוהה', Medium: 'בינונית', Low: 'נמוכה' };
  return map[priority] || priority;
}

export function getPriorityClass(priority) {
  const map = {
    High: 'priority-high',
    Medium: 'priority-medium',
    Low: 'priority-low'
  };
  return map[priority] || 'priority-medium';
}

export function todayStr() {
  return new Date().toISOString().split('T')[0];
}
