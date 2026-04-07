# מתכנן אירועים שבועי

## הרצה מהירה – 3 פקודות בלבד

```bash
git clone https://github.com/ai030469/ai030469.git
cd ai030469
git checkout claude/weekly-events-planner-omV9N
cp .env.example backend/.env
npm run setup
npm start
```

פתח בדפדפן: **http://localhost:3000**

---

## הרצה דרך GitHub Codespaces (ללא התקנה מקומית)

1. לך ל: `https://github.com/ai030469/ai030469`
2. לחץ על **Code** (כפתור ירוק)
3. בחר **Codespaces** → **New codespace**
4. המתן ~2 דקות – האפליקציה תפתח אוטומטית בדפדפן

הכל קורה אוטומטי: התקנה, Seed, הרצה.

---

## מה האפליקציה עושה

- הקלטה קולית בעברית → חילוץ פרטי אירוע אוטומטי
- ניהול אירועים שבועיים עם Checklist משימות לוגיסטיות
- סיכום שבועי בטבלה לפי ימים
- יצוא ל-Excel ו-Google Sheets

---

## דרישות (הרצה מקומית בלבד)

- Node.js 18+
- Chrome / Edge (להקלטה קולית)

---

## מבנה הפרויקט

```
backend/   → Express + SQLite (port 5000)
frontend/  → React + Vite + Tailwind (port 3000)
```
