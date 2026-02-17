require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const db = require('./database');

const now = new Date();
const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x.toISOString().split('T')[0];
};

// Find next Sunday
const nextSunday = new Date(now);
const dayOfWeek = nextSunday.getDay();
const daysUntilSunday = dayOfWeek === 0 ? 7 : (7 - dayOfWeek);
nextSunday.setDate(nextSunday.getDate() + daysUntilSunday);
const baseDate = nextSunday.toISOString().split('T')[0];

const events = [
  {
    id: uuidv4(),
    event_name: 'ישיבת צוות שבועית',
    date: addDays(nextSunday, 0),
    start_time: '09:00',
    end_time: '10:30',
    location: 'חדר ישיבות A, קומה 3',
    attendees_count: 12,
    special_requirements: 'מקרן, לוח לבן, קפה וסנדוויצ׳ים',
    notes: 'לעדכן את כל חברי הצוות לגבי הפרויקטים הפעילים ולהציג את יעדי הרבעון',
    priority: 'High',
    tasks: [
      'להכין מצגת עדכון הפרויקטים',
      'להזמין קפה ורענון',
      'לשריין את חדר הישיבות',
      'לשלוח הזמנה ל-12 משתתפים',
      'להדפיס סיכום ישיבה קודמת'
    ]
  },
  {
    id: uuidv4(),
    event_name: 'ערב גיבוש מחלקת שיווק',
    date: addDays(nextSunday, 3),
    start_time: '18:00',
    end_time: '22:00',
    location: 'מסעדת הים, נמל תל אביב',
    attendees_count: 25,
    special_requirements: 'תפריט צמחוני לחלק מהמשתתפים, מוזיקה ברקע',
    notes: 'ערב חברתי בסוף הרבעון - לחגוג את ההצלחות ולחזק את הקשרים',
    priority: 'Medium',
    tasks: [
      'להזמין שולחן ל-25 אנשים',
      'לוודא אפשרויות צמחוניות',
      'לתאם הסעה חזרה',
      'להכין ״טריוויה״ של חברת על הצוות',
      'לצלם תמונות קבוצתיות'
    ]
  },
  {
    id: uuidv4(),
    event_name: 'השקת מוצר חדש – Demo Day',
    date: addDays(nextSunday, 5),
    start_time: '14:00',
    end_time: '17:00',
    location: 'אולם הכנסים הראשי, בניין המשרדים',
    attendees_count: 80,
    special_requirements: 'מערכת סאונד מקצועית, מסך ענק, שידור חי',
    notes: 'אירוע מרכזי להשקת הגרסה החדשה מול לקוחות ושותפים עסקיים',
    priority: 'High',
    tasks: [
      'לשריין מערכת סאונד ומקרן HD',
      'להכין Demo חי של המוצר',
      'לשלוח הזמנות ל-80 משתתפים',
      'להכין חומרי שיווק ו-Brochures',
      'לתאם צוות קבלת פנים',
      'לאשר שידור חי בפלטפורמות',
      'להזמין כיבוד ומשקאות'
    ]
  }
];

// Clear existing seed data
db.prepare(`DELETE FROM tasks WHERE event_id IN (SELECT id FROM events WHERE notes LIKE '%ישיבת צוות%' OR notes LIKE '%ערב גיבוש%' OR notes LIKE '%השקת מוצר%')`).run();

let inserted = 0;

for (const event of events) {
  const existing = db.prepare(`SELECT id FROM events WHERE event_name = ? AND date = ?`).get(event.event_name, event.date);
  if (existing) {
    console.log(`⏭️  אירוע קיים: ${event.event_name}`);
    continue;
  }

  const createdAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO events (id, event_name, date, start_time, end_time, location, attendees_count,
      special_requirements, notes, priority, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    event.id, event.event_name, event.date,
    event.start_time, event.end_time, event.location,
    event.attendees_count, event.special_requirements,
    event.notes, event.priority, createdAt, createdAt
  );

  for (const taskText of event.tasks) {
    db.prepare(`INSERT INTO tasks (id, event_id, task_text, is_done, created_at) VALUES (?, ?, ?, 0, ?)`).run(
      uuidv4(), event.id, taskText, createdAt
    );
  }

  console.log(`✅ הוסף אירוע: ${event.event_name} (${event.date})`);
  inserted++;
}

console.log(`\n🌱 Seed הושלם. נוספו ${inserted} אירועים חדשים.`);
process.exit(0);
