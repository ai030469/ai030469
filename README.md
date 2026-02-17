# מתכנן אירועים שבועי – Weekly Events Voice Planner

אפליקציה לניהול אירועים שבועיים עם קליטה בקול, סיכום שבועי אוטומטי ויצוא ל-Excel / Google Sheets.

## תכונות עיקריות

- 🎙️ **הקלטה קולית** – דבר בעברית והמערכת מחלצת פרטים אוטומטית
- ✏️ **הזנה ידנית** – טופס מלא עם כל השדות
- 📅 **סיכום שבועי** – טבלה מסודרת לפי ימים
- 📤 **Export** – Excel (.xlsx) ו-Google Sheets
- ✅ **ניהול משימות** – Checklist לוגיסטי לכל אירוע
- 🌍 **RTL מלא** – עברית עם עיצוב מינימליסטי נקי

## מבנה התיקיות

```
weekly-events-planner/
├── backend/                 # Express + SQLite
│   ├── src/
│   │   ├── index.js         # Server entry point
│   │   ├── database.js      # SQLite setup
│   │   ├── seed.js          # Seed data (3 events)
│   │   └── routes/
│   │       ├── events.js    # CRUD API
│   │       ├── export.js    # Excel + Google Sheets
│   │       └── transcribe.js # Field extraction
│   └── package.json
├── frontend/                # React + Vite + Tailwind
│   ├── src/
│   │   ├── App.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Dashboard
│   │   │   ├── VoiceRecord.jsx    # Voice input
│   │   │   ├── ManualForm.jsx     # Manual form
│   │   │   ├── EventDetails.jsx   # Event view
│   │   │   └── WeeklySummary.jsx  # Weekly table
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── EventCard.jsx
│   │   │   └── EventForm.jsx      # Shared form
│   │   └── utils/
│   │       ├── api.js
│   │       └── dates.js
│   └── package.json
├── .env.example
└── README.md
```

## התקנה והרצה

### 1. דרישות מקדימות
- Node.js 18+
- npm 9+

### 2. התקנת חבילות

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. הגדרת משתני סביבה

```bash
cp .env.example backend/.env
# ערוך את backend/.env לפי הצורך
```

### 4. הוספת נתוני Seed (3 אירועים לדוגמה)

```bash
cd backend && npm run seed
```

### 5. הרצה

```bash
# Terminal 1 – Backend (port 5000)
cd backend && npm run dev

# Terminal 2 – Frontend (port 3000)
cd frontend && npm run dev
```

פתח בדפדפן: **http://localhost:3000**

## API Endpoints

| Method | Path | תיאור |
|--------|------|--------|
| GET | `/api/events` | כל האירועים |
| GET | `/api/events/:id` | אירוע בודד |
| POST | `/api/events` | יצירת אירוע |
| PUT | `/api/events/:id` | עדכון אירוע |
| DELETE | `/api/events/:id` | מחיקת אירוע |
| PATCH | `/api/events/tasks/:taskId` | toggle משימה |
| GET | `/api/export/weekly-summary` | נתוני סיכום שבועי |
| GET | `/api/export/excel` | הורדת Excel |
| POST | `/api/export/google-sheets` | יצוא ל-Google Sheets |
| POST | `/api/transcribe/extract` | חילוץ שדות מתמלול |

## Google Sheets (אופציונלי)

1. צור Service Account ב-Google Cloud Console
2. הפעל את Google Sheets API
3. הורד קובץ JSON credentials
4. הוסף ל-`backend/.env`:
```
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
GOOGLE_SPREADSHEET_ID=your-sheet-id
```
5. שתף את ה-Spreadsheet עם כתובת ה-email של ה-Service Account

## Stack

| שכבה | טכנולוגיה |
|------|------------|
| Frontend | React 18, Vite, Tailwind CSS, Lucide Icons |
| Backend | Node.js, Express, better-sqlite3 |
| DB | SQLite |
| Fonts | Assistant, Rubik (Google Fonts) |
| Export | xlsx, Google Sheets API v4 |
| Voice | Web Speech API (Chrome/Edge native) |
