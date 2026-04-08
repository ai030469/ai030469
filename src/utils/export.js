export function tasksToCSV(tasks) {
  const headers = ['שם משימה', 'תאריך', 'עדיפות', 'גורם מטפל', 'סטטוס', 'הערות']
  const rows = tasks.map(t => [
    t.text,
    t.date,
    t.priority === 'urgent' ? 'דחוף' : 'בינוני',
    t.assignee,
    t.status === 'open' ? 'פתוח' : t.status === 'in_progress' ? 'בטיפול' : 'סגור',
    t.remarks || ''
  ])

  const BOM = '\uFEFF'
  const csv = BOM + [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  return csv
}

export function downloadCSV(tasks, filename = 'tasks.csv') {
  const csv = tasksToCSV(tasks)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function shareViaWhatsApp(text) {
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`
  window.open(url, '_blank')
}

export function shareViaEmail(subject, body) {
  const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  window.location.href = url
}

export function tasksToText(tasks) {
  return tasks.map((t, i) =>
    `${i + 1}. ${t.text} | ${t.date} | ${t.priority === 'urgent' ? 'דחוף' : 'בינוני'} | ${t.assignee} | ${t.status === 'open' ? 'פתוח' : t.status === 'in_progress' ? 'בטיפול' : 'סגור'}`
  ).join('\n')
}
