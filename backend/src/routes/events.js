const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');

// GET all events (with tasks)
router.get('/', (req, res) => {
  try {
    const { from, to } = req.query;
    let query = `SELECT * FROM events`;
    const params = [];

    if (from && to) {
      query += ` WHERE date >= ? AND date <= ?`;
      params.push(from, to);
    } else if (from) {
      query += ` WHERE date >= ?`;
      params.push(from);
    }

    query += ` ORDER BY date ASC, start_time ASC`;

    const events = db.prepare(query).all(...params);

    // Attach tasks to each event
    const eventsWithTasks = events.map(event => {
      const tasks = db.prepare(`SELECT * FROM tasks WHERE event_id = ? ORDER BY created_at ASC`).all(event.id);
      return { ...event, tasks, is_done: !!event.is_done };
    });

    res.json({ success: true, data: eventsWithTasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single event
router.get('/:id', (req, res) => {
  try {
    const event = db.prepare(`SELECT * FROM events WHERE id = ?`).get(req.params.id);
    if (!event) return res.status(404).json({ success: false, error: 'אירוע לא נמצא' });

    const tasks = db.prepare(`SELECT * FROM tasks WHERE event_id = ? ORDER BY created_at ASC`).all(event.id);
    res.json({ success: true, data: { ...event, tasks, is_done: !!event.is_done } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create event
router.post('/', (req, res) => {
  try {
    const {
      event_name,
      date,
      start_time,
      end_time,
      location,
      attendees_count,
      special_requirements,
      notes,
      priority,
      transcript_raw,
      tasks = []
    } = req.body;

    if (!event_name || !date) {
      return res.status(400).json({ success: false, error: 'שם אירוע ותאריך הם שדות חובה' });
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO events (id, event_name, date, start_time, end_time, location, attendees_count,
        special_requirements, notes, priority, transcript_raw, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, event_name, date,
      start_time || null, end_time || null,
      location || null, attendees_count || 0,
      special_requirements || null, notes || null,
      priority || 'Medium', transcript_raw || null,
      now, now
    );

    // Insert tasks
    const insertTask = db.prepare(`
      INSERT INTO tasks (id, event_id, task_text, is_done, created_at)
      VALUES (?, ?, ?, 0, ?)
    `);

    for (const task of tasks) {
      if (task && task.trim()) {
        insertTask.run(uuidv4(), id, task.trim(), now);
      }
    }

    const created = db.prepare(`SELECT * FROM events WHERE id = ?`).get(id);
    const createdTasks = db.prepare(`SELECT * FROM tasks WHERE event_id = ?`).all(id);

    res.status(201).json({ success: true, data: { ...created, tasks: createdTasks } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update event
router.put('/:id', (req, res) => {
  try {
    const existing = db.prepare(`SELECT * FROM events WHERE id = ?`).get(req.params.id);
    if (!existing) return res.status(404).json({ success: false, error: 'אירוע לא נמצא' });

    const {
      event_name,
      date,
      start_time,
      end_time,
      location,
      attendees_count,
      special_requirements,
      notes,
      priority,
      is_done,
      tasks = []
    } = req.body;

    const now = new Date().toISOString();

    db.prepare(`
      UPDATE events SET
        event_name = ?, date = ?, start_time = ?, end_time = ?,
        location = ?, attendees_count = ?, special_requirements = ?,
        notes = ?, priority = ?, is_done = ?, updated_at = ?
      WHERE id = ?
    `).run(
      event_name || existing.event_name,
      date || existing.date,
      start_time !== undefined ? start_time : existing.start_time,
      end_time !== undefined ? end_time : existing.end_time,
      location !== undefined ? location : existing.location,
      attendees_count !== undefined ? attendees_count : existing.attendees_count,
      special_requirements !== undefined ? special_requirements : existing.special_requirements,
      notes !== undefined ? notes : existing.notes,
      priority || existing.priority,
      is_done !== undefined ? (is_done ? 1 : 0) : existing.is_done,
      now,
      req.params.id
    );

    // Replace tasks if provided
    if (req.body.hasOwnProperty('tasks')) {
      db.prepare(`DELETE FROM tasks WHERE event_id = ?`).run(req.params.id);
      const insertTask = db.prepare(`INSERT INTO tasks (id, event_id, task_text, is_done, created_at) VALUES (?, ?, ?, ?, ?)`);

      for (const task of tasks) {
        if (typeof task === 'string' && task.trim()) {
          insertTask.run(uuidv4(), req.params.id, task.trim(), 0, now);
        } else if (task && task.task_text) {
          insertTask.run(uuidv4(), req.params.id, task.task_text, task.is_done ? 1 : 0, now);
        }
      }
    }

    const updated = db.prepare(`SELECT * FROM events WHERE id = ?`).get(req.params.id);
    const updatedTasks = db.prepare(`SELECT * FROM tasks WHERE event_id = ? ORDER BY created_at ASC`).all(req.params.id);

    res.json({ success: true, data: { ...updated, tasks: updatedTasks, is_done: !!updated.is_done } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH toggle task done
router.patch('/tasks/:taskId', (req, res) => {
  try {
    const task = db.prepare(`SELECT * FROM tasks WHERE id = ?`).get(req.params.taskId);
    if (!task) return res.status(404).json({ success: false, error: 'משימה לא נמצאה' });

    const { is_done } = req.body;
    db.prepare(`UPDATE tasks SET is_done = ? WHERE id = ?`).run(is_done ? 1 : 0, req.params.taskId);

    const updated = db.prepare(`SELECT * FROM tasks WHERE id = ?`).get(req.params.taskId);
    res.json({ success: true, data: { ...updated, is_done: !!updated.is_done } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE event
router.delete('/:id', (req, res) => {
  try {
    const existing = db.prepare(`SELECT * FROM events WHERE id = ?`).get(req.params.id);
    if (!existing) return res.status(404).json({ success: false, error: 'אירוע לא נמצא' });

    db.prepare(`DELETE FROM tasks WHERE event_id = ?`).run(req.params.id);
    db.prepare(`DELETE FROM events WHERE id = ?`).run(req.params.id);

    res.json({ success: true, message: 'אירוע נמחק בהצלחה' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
