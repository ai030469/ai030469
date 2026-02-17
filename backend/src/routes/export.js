const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const { google } = require('googleapis');
const db = require('../database');

const DAYS_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
const MONTH_NAMES_HE = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

function getWeekEvents(weekStart) {
  const start = weekStart || getNextMonday();
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const startStr = start.toISOString().split('T')[0];
  const endStr = end.toISOString().split('T')[0];

  const events = db.prepare(`
    SELECT e.*, GROUP_CONCAT(t.task_text, ' | ') as tasks_text
    FROM events e
    LEFT JOIN tasks t ON t.event_id = e.id AND t.is_done = 0
    WHERE e.date >= ? AND e.date <= ?
    GROUP BY e.id
    ORDER BY e.date ASC, e.start_time ASC
  `).all(startStr, endStr);

  return { events, startStr, endStr, start, end };
}

function getNextSunday() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 7 : (7 - day);
  const next = new Date(now);
  next.setDate(now.getDate() + diff);
  next.setHours(0, 0, 0, 0);
  return next;
}

function formatDateHe(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getDate()} ${MONTH_NAMES_HE[d.getMonth()]} ${d.getFullYear()}`;
}

function getDayName(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `יום ${DAYS_HE[d.getDay()]}`;
}

function buildTableRows(events) {
  return events.map(e => ({
    'יום': getDayName(e.date),
    'תאריך': formatDateHe(e.date),
    'שעה': e.start_time ? (e.end_time ? `${e.start_time}–${e.end_time}` : e.start_time) : '—',
    'שם האירוע': e.event_name,
    'מיקום': e.location || '—',
    'כמות משתתפים': e.attendees_count || '—',
    'משימות עיקריות': e.tasks_text || '—',
    'עדיפות': e.priority || '—'
  }));
}

// GET: Export to Excel
router.get('/excel', (req, res) => {
  try {
    const { weekStart } = req.query;
    const startDate = weekStart ? new Date(weekStart) : getNextSunday();
    const { events, startStr } = getWeekEvents(startDate);

    const rows = buildTableRows(events);
    const ws = XLSX.utils.json_to_sheet(rows, { skipHeader: false });

    // RTL + column widths
    ws['!cols'] = [
      { wch: 12 }, { wch: 18 }, { wch: 14 }, { wch: 28 },
      { wch: 22 }, { wch: 16 }, { wch: 40 }, { wch: 12 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Week of ${startStr}`);

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="weekly-events-${startStr}.xlsx"`);
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET: Weekly summary data (for frontend table)
router.get('/weekly-summary', (req, res) => {
  try {
    const { weekStart } = req.query;
    const startDate = weekStart ? new Date(weekStart) : getNextSunday();
    const { events, startStr, endStr } = getWeekEvents(startDate);

    const rows = buildTableRows(events);

    // Group by day
    const grouped = {};
    events.forEach((e, i) => {
      const day = getDayName(e.date);
      if (!grouped[e.date]) grouped[e.date] = [];
      grouped[e.date].push({ ...rows[i], _event: e });
    });

    res.json({
      success: true,
      data: {
        weekStart: startStr,
        weekEnd: endStr,
        events: events,
        rows: rows,
        grouped: grouped
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST: Export to Google Sheets
router.post('/google-sheets', async (req, res) => {
  try {
    const { weekStart, spreadsheetId } = req.body;

    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      return res.status(400).json({
        success: false,
        error: 'Google Sheets API לא מוגדר. הגדר GOOGLE_SERVICE_ACCOUNT_KEY ב-.env'
      });
    }

    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const startDate = weekStart ? new Date(weekStart) : getNextSunday();
    const { events, startStr } = getWeekEvents(startDate);

    const sheetTitle = `Week of ${startStr}`;
    const targetId = spreadsheetId || process.env.GOOGLE_SPREADSHEET_ID;

    if (!targetId) {
      return res.status(400).json({ success: false, error: 'spreadsheetId נדרש' });
    }

    // Add sheet
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: targetId,
        requestBody: {
          requests: [{ addSheet: { properties: { title: sheetTitle, rightToLeft: true } } }]
        }
      });
    } catch (e) {
      // Sheet may already exist – that's OK
    }

    const headers = ['יום', 'תאריך', 'שעה', 'שם האירוע', 'מיקום', 'כמות משתתפים', 'משימות עיקריות', 'עדיפות'];
    const rows = buildTableRows(events);
    const values = [
      headers,
      ...rows.map(r => headers.map(h => r[h] || ''))
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: targetId,
      range: `'${sheetTitle}'!A1`,
      valueInputOption: 'RAW',
      requestBody: { values }
    });

    res.json({
      success: true,
      message: `יוצא ל-Google Sheets בהצלחה: ${sheetTitle}`,
      sheetTitle,
      url: `https://docs.google.com/spreadsheets/d/${targetId}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
