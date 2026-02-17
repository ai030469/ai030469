const express = require('express');
const router = express.Router();

// Smart Hebrew date parser
function parseHebrewDate(text) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const dayMap = {
    'ראשון': 0, 'שני': 1, 'שלישי': 2, 'רביעי': 3,
    'חמישי': 4, 'שישי': 5, 'שבת': 6
  };

  // "מחר"
  if (/מחר/.test(text)) {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }

  // "היום"
  if (/היום/.test(text)) {
    return today.toISOString().split('T')[0];
  }

  // "שבוע הבא יום X"
  const nextWeekDay = text.match(/שבוע הבא.*(ראשון|שני|שלישי|רביעי|חמישי|שישי|שבת)/);
  if (nextWeekDay) {
    const targetDay = dayMap[nextWeekDay[1]];
    const d = new Date(today);
    const diff = (targetDay - d.getDay() + 7) % 7 || 7;
    d.setDate(d.getDate() + diff + 7);
    return d.toISOString().split('T')[0];
  }

  // "יום X הבא" or "יום X"
  const dayMatch = text.match(/(ראשון|שני|שלישי|רביעי|חמישי|שישי|שבת)/);
  if (dayMatch) {
    const targetDay = dayMap[dayMatch[1]];
    const d = new Date(today);
    const diff = (targetDay - d.getDay() + 7) % 7 || 7;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split('T')[0];
  }

  // "עוד שבועיים"
  if (/עוד שבועיים/.test(text)) {
    const d = new Date(today);
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  }

  // "שבוע הבא"
  if (/שבוע הבא/.test(text)) {
    const d = new Date(today);
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  }

  // "עוד X ימים"
  const daysMatch = text.match(/עוד\s+(\d+)\s+ימים?/);
  if (daysMatch) {
    const d = new Date(today);
    d.setDate(d.getDate() + parseInt(daysMatch[1]));
    return d.toISOString().split('T')[0];
  }

  // Numeric date: DD/MM or DD/MM/YYYY
  const numDate = text.match(/(\d{1,2})[\/\-\.](\d{1,2})(?:[\/\-\.](\d{4}))?/);
  if (numDate) {
    const day = parseInt(numDate[1]);
    const month = parseInt(numDate[2]) - 1;
    const year = numDate[3] ? parseInt(numDate[3]) : now.getFullYear();
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  }

  return null;
}

function parseTime(text) {
  // "בשעה X" or "X:XX"
  const timeMatch = text.match(/(?:בשעה\s+)?(\d{1,2}):(\d{2})/);
  if (timeMatch) return `${timeMatch[1].padStart(2,'0')}:${timeMatch[2]}`;

  const hourMatch = text.match(/(?:בשעה\s+)(\d{1,2})/);
  if (hourMatch) return `${hourMatch[1].padStart(2,'0')}:00`;

  return null;
}

function extractFields(transcript) {
  const text = transcript || '';

  // Priority keywords
  let priority = 'Medium';
  if (/דחוף|חשוב מאוד|עדיפות גבוהה/.test(text)) priority = 'High';
  else if (/לא דחוף|עדיפות נמוכה|ברגע שיש זמן/.test(text)) priority = 'Low';

  // Extract attendees count
  const attendeesMatch = text.match(/(\d+)\s*(?:משתתפים|אנשים|מוזמנים|אורחים)/);
  const attendees_count = attendeesMatch ? parseInt(attendeesMatch[1]) : 0;

  // Extract location
  const locationMatch = text.match(/(?:ב|במקום|בכתובת|ב-)\s*([^,\.\n]+?)(?:\s*,|\s*ב|\s*ל|\.|$)/);
  let location = null;
  if (locationMatch) {
    const candidate = locationMatch[1].trim();
    if (candidate.length > 2 && candidate.length < 60) location = candidate;
  }

  // Extract tasks - look for list-like structures
  const taskPatterns = [
    /(?:צריך|נדרש|לזכור|להכין|לסדר|להזמין|לשריין|לאשר)\s+([^,\.\n]+)/g
  ];
  const tasks = [];
  for (const pattern of taskPatterns) {
    let m;
    while ((m = pattern.exec(text)) !== null) {
      const task = m[1].trim();
      if (task.length > 2) tasks.push(task);
    }
  }

  // Extract event name - try first meaningful phrase
  const namePatterns = [
    /^(.*?)(?:ב|ביום|בתאריך|ב-)/,
    /(?:אירוע|ישיבה|פגישה|מסיבה|הרצאה|כנס|סיור|טיול|אימון|ברית|בר מצווה|חתונה)\s+(?:של\s+)?([^,\.\n]+)/i,
  ];

  let event_name = null;
  for (const p of namePatterns) {
    const m = text.match(p);
    if (m) {
      const candidate = (m[1] || m[2] || '').trim();
      if (candidate.length > 2) {
        event_name = candidate;
        break;
      }
    }
  }

  if (!event_name && text.length > 0) {
    // Fallback: take first sentence up to 40 chars
    event_name = text.split(/[,.\n]/)[0].trim().substring(0, 40);
  }

  const date = parseHebrewDate(text);
  const start_time = parseTime(text);

  // End time
  const endTimeMatch = text.match(/עד\s+שעה?\s+(\d{1,2}):?(\d{2})?/);
  const end_time = endTimeMatch
    ? `${endTimeMatch[1].padStart(2,'0')}:${(endTimeMatch[2] || '00')}`
    : null;

  // Special requirements
  const specialMatch = text.match(/(?:דרישות מיוחדות|הערות|ציוד|לדעת)[:\s]+([^.\n]+)/);
  const special_requirements = specialMatch ? specialMatch[1].trim() : null;

  return {
    event_name: event_name || null,
    date: date || null,
    start_time: start_time || null,
    end_time: end_time || null,
    location: location || null,
    attendees_count,
    special_requirements,
    notes: null,
    priority,
    tasks
  };
}

// POST /api/transcribe/extract - Extract fields from transcript
router.post('/extract', (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript) {
      return res.status(400).json({ success: false, error: 'transcript is required' });
    }

    const fields = extractFields(transcript);
    res.json({ success: true, data: fields });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
module.exports.parseHebrewDate = parseHebrewDate;
module.exports.extractFields = extractFields;
