// ============================================================
// LAZARUS – Unified Single-Page App
// Dashboard + Calendar + Timer + Relax — All in one.
// ============================================================

// ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
// ① SIDEBAR NAVIGATION + CLOCK
// ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒

function updateClock() {
  const now = new Date();
  const dateEl = document.getElementById('sidebarDate');
  const timeEl = document.getElementById('sidebarTime');
  if (dateEl) dateEl.textContent = now.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
  if (timeEl) timeEl.textContent = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
}
setInterval(updateClock, 1000);
updateClock();

/* Page switching */
function switchPage(pageName) {
  // Sections
  document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
  const target = document.getElementById('page-' + pageName);
  if (target) target.classList.add('active');

  // Nav
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navItem = document.querySelector(`.nav-item[data-page="${pageName}"]`);
  if (navItem) navItem.classList.add('active');

  // Relax page different orb colors
  const body = document.body;
  body.className = pageName === 'relax' ? 'relax-mode' : '';

  // Initialize page-specific stuff on switch
  if (pageName === 'calendar') renderCalendar();
  if (pageName === 'timer')    initTimerDisplay();
  if (pageName === 'dashboard') renderTasks();
}

document.querySelectorAll('.nav-item').forEach(nav => {
  nav.addEventListener('click', e => {
    e.preventDefault();
    switchPage(nav.dataset.page);
  });
});

// Calendar shortcut button on dashboard
document.getElementById('goCalendarBtn')?.addEventListener('click', () => switchPage('calendar'));


// ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
// ② DASHBOARD – TASK MANAGER
// ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒

const STORAGE_KEY = 'lazarus_tasks';
function loadTasks() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; } }
function saveTasks(t) { localStorage.setItem(STORAGE_KEY, JSON.stringify(t)); }

let tasks = loadTasks();
if (tasks.length === 0) {
  tasks = [
    { id:1, name:'Submit Assignment #3', desc:'Digital Signal Processing – Chapter 6 problems', date:'2026-04-02', priority:'high', status:'pending', category:'Study' },
    { id:2, name:'CIAT-I Preparation', desc:'2.5 Units covering Syllabus Part A', date:'2026-03-30', priority:'high', status:'in-progress', category:'Exam' },
    { id:3, name:'Lab Record Completion', desc:'All pending observations for lab test', date:'2026-04-09', priority:'medium', status:'pending', category:'Lab' },
    { id:4, name:'Mini Project Report', desc:'Final formatting and submission', date:'2026-03-25', priority:'high', status:'done', category:'Project' },
    { id:5, name:'Attend Guest Lecture', desc:'AI & ML in Healthcare – Seminar Hall', date:'2026-04-15', priority:'low', status:'pending', category:'Event' },
  ];
  saveTasks(tasks);
}

let currentFilter = 'all';
let searchQuery = '';
let editingId = null;

function isOverdue(task) {
  if (task.status === 'done') return false;
  return new Date(task.date) < new Date(new Date().toDateString());
}

function getFilteredTasks() {
  let filtered = tasks.map(t => ({ ...t, overdue: isOverdue(t) }));
  if (currentFilter === 'overdue') filtered = filtered.filter(t => t.overdue);
  else if (currentFilter !== 'all') filtered = filtered.filter(t => t.status === currentFilter);
  if (searchQuery) filtered = filtered.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.category && t.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  return filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function statusLabel(s) { return s === 'in-progress' ? 'In Progress' : capitalize(s); }
function formatDate(d) {
  if (!d) return '–';
  return new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
}

function renderTasks() {
  const list = document.getElementById('taskList');
  const empty = document.getElementById('emptyState');
  if (!list) return;
  const filtered = getFilteredTasks();
  list.innerHTML = '';
  if (filtered.length === 0) {
    empty.style.display = 'flex';
    empty.style.flexDirection = 'column';
    empty.style.alignItems = 'center';
    return;
  }
  empty.style.display = 'none';
  filtered.forEach((task, idx) => {
    const div = document.createElement('div');
    div.className = `task-item ${task.status==='done'?'done':''} ${task.overdue?'overdue':''}`;
    div.style.animationDelay = `${idx * 0.06}s`;
    const statusTag = task.overdue
      ? '<span class="task-tag tag-overdue">Overdue</span>'
      : `<span class="task-tag tag-${task.status}">${statusLabel(task.status)}</span>`;
    div.innerHTML = `
      <div class="task-checkbox ${task.status==='done'?'checked':''}" data-id="${task.id}" title="Toggle done">${task.status==='done'?'✓':''}</div>
      <div class="task-body">
        <div class="task-name">${task.name}</div>
        ${task.desc?`<div class="task-desc">${task.desc}</div>`:''}
        <div class="task-meta">
          <span class="task-tag tag-${task.priority}">${capitalize(task.priority)}</span>
          ${statusTag}
          ${task.category?`<span class="task-date">📁 ${task.category}</span>`:''}
          <span class="task-date">📅 ${formatDate(task.date)}</span>
        </div>
      </div>
      <div class="task-actions">
        <button class="task-action-btn edit-btn" data-id="${task.id}" title="Edit">✏️</button>
        <button class="task-action-btn del-btn" data-id="${task.id}" title="Delete">🗑️</button>
      </div>`;
    list.appendChild(div);
  });
  attachTaskListeners();
  renderTimeline();
  updateStats();
}

function attachTaskListeners() {
  document.querySelectorAll('.task-checkbox').forEach(cb => {
    cb.addEventListener('click', e => {
      const id = +e.currentTarget.dataset.id;
      const task = tasks.find(t => t.id === id);
      if (task) { task.status = task.status === 'done' ? 'pending' : 'done'; saveTasks(tasks); renderTasks(); }
    });
  });
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', e => openEditModal(+e.currentTarget.dataset.id));
  });
  document.querySelectorAll('.del-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      if (confirm('Delete this task?')) {
        tasks = tasks.filter(t => t.id !== +e.currentTarget.dataset.id);
        saveTasks(tasks); renderTasks();
      }
    });
  });
}

function renderTimeline() {
  const tl = document.getElementById('timeline');
  if (!tl) return;
  const sorted = [...tasks].sort((a, b) => new Date(a.date) - new Date(b.date));
  tl.innerHTML = '';
  sorted.forEach((task, idx) => {
    const ovd = isOverdue(task);
    const div = document.createElement('div');
    div.className = `tl-item ${task.status==='done'?'done':''} ${ovd?'overdue':''}`;
    div.style.animationDelay = `${idx * 0.07}s`;
    div.innerHTML = `
      <div class="tl-dot"></div>
      <div class="tl-date">${formatDate(task.date)}</div>
      <div class="tl-name">${task.name}</div>
      ${task.category?`<div class="tl-cat">${task.category}</div>`:''}`;
    tl.appendChild(div);
  });
}

function updateStats() {
  animCount('statTotal',   tasks.length);
  animCount('statDone',    tasks.filter(t => t.status==='done').length);
  animCount('statPending', tasks.filter(t => t.status!=='done').length);
  animCount('statOverdue', tasks.filter(isOverdue).length);
}
function animCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let cur = 0;
  const ms = Math.max(40, 500 / Math.max(target,1));
  const iv = setInterval(() => { cur++; el.textContent = cur; if (cur >= target) { el.textContent = target; clearInterval(iv); } }, ms);
  if (target === 0) el.textContent = '0';
}

/* Filters */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});
document.getElementById('searchInput')?.addEventListener('input', e => { searchQuery = e.target.value; renderTasks(); });

/* Modal */
const overlay  = document.getElementById('modalOverlay');
const form     = document.getElementById('taskForm');
function openAddModal() {
  editingId = null; form?.reset();
  document.getElementById('modalTitle').textContent = 'Add New Task';
  overlay?.classList.add('open');
  document.getElementById('taskDate').valueAsDate = new Date();
}
function openEditModal(id) {
  const task = tasks.find(t => t.id === id); if (!task) return;
  editingId = id;
  document.getElementById('modalTitle').textContent = 'Edit Task';
  document.getElementById('taskName').value     = task.name;
  document.getElementById('taskDesc').value     = task.desc||'';
  document.getElementById('taskDate').value     = task.date;
  document.getElementById('taskPriority').value = task.priority;
  document.getElementById('taskStatus').value   = task.status;
  document.getElementById('taskCategory').value = task.category||'';
  overlay?.classList.add('open');
}
function closeModal() { overlay?.classList.remove('open'); }

document.getElementById('addTaskBtn')?.addEventListener('click', openAddModal);
document.getElementById('modalClose')?.addEventListener('click', closeModal);
document.getElementById('cancelBtn')?.addEventListener('click', closeModal);
overlay?.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

form?.addEventListener('submit', e => {
  e.preventDefault();
  const data = {
    name:     document.getElementById('taskName').value.trim(),
    desc:     document.getElementById('taskDesc').value.trim(),
    date:     document.getElementById('taskDate').value,
    priority: document.getElementById('taskPriority').value,
    status:   document.getElementById('taskStatus').value,
    category: document.getElementById('taskCategory').value.trim(),
  };
  if (!data.name || !data.date) return;
  if (editingId) { const idx = tasks.findIndex(t => t.id === editingId); if (idx !== -1) tasks[idx] = { ...tasks[idx], ...data }; }
  else { data.id = Date.now(); tasks.push(data); }
  saveTasks(tasks); closeModal(); renderTasks();
});


// ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
// ③ CALENDAR – KPR Academic Schedule
// ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒

const HOLIDAYS = {
  '2025-12-20': 'Holiday',
  '2025-12-25': 'Christmas',
  '2026-01-01': 'New Year Day',
  '2026-01-15': 'Pongal',
  '2026-01-16': 'Thiruvalluvar Day',
  '2026-01-17': 'Uzhavar Thirunal',
  '2026-01-26': 'Republic Day',
  '2026-02-01': 'Thaipusam',
  '2026-02-07': 'Holiday',
  '2026-02-21': 'Holiday',
  '2026-03-19': 'Telugu New Year',
  '2026-03-21': 'Ramzan',
  '2026-03-30': 'Holiday',
  '2026-03-31': 'Mahavir Jayanti',
  '2026-04-03': 'Good Friday',
  '2026-04-04': 'Holiday',
  '2026-04-13': 'Holiday',
  '2026-04-14': 'Tamil New Year & Dr. Ambedkar Jayanti',
  '2026-05-01': 'May Day',
  '2026-05-02': 'Holiday',
  '2026-05-16': 'Holiday',
  '2026-05-28': 'Bakrid',
  '2026-06-06': 'Holiday',
  '2026-06-26': 'Muharram',
  '2026-06-27': 'Holiday',
};

const EVENTS = [
  { date:'2025-12-01', label:'Course Registration (Sem 4,6)' },
  { date:'2025-12-10', label:'Classes Commence' },
  { date:'2025-12-25', label:'Internship/In-plant Training Start' },
  { date:'2026-01-21', label:'Classes Resume' },
  { date:'2026-01-23', label:'First Class Committee' },
  { date:'2026-02-02', label:'CIAT-I Start (2.5 Units)' },
  { date:'2026-02-07', label:'CIAT-I Ends' },
  { date:'2026-02-13', label:'CIAT-I Marks Display' },
  { date:'2026-03-13', label:'Second Class Committee' },
  { date:'2026-04-06', label:'Lab Test Start' },
  { date:'2026-04-11', label:'Lab Test End' },
  { date:'2026-04-15', label:'Lab Test Marks Display' },
  { date:'2026-04-17', label:'Third Class Committee' },
  { date:'2026-04-24', label:'CIAT-II Start (2.5 Units)' },
  { date:'2026-04-30', label:'CIAT-II Ends' },
  { date:'2026-05-04', label:'Optional Test / Attendance Makeup (6 Days)' },
  { date:'2026-05-06', label:'Last Working Day & Attendance' },
  { date:'2026-05-08', label:'No Dues' },
  { date:'2026-05-09', label:'Issue of Hall Ticket (Online)' },
  { date:'2026-05-11', label:'CIAT-II Marks Display' },
  { date:'2026-05-11', label:'End Sem Practical Exam (5 Days)' },
  { date:'2026-05-16', label:'End Sem Theory – VI Semester' },
  { date:'2026-05-18', label:'End Sem Theory – IV Semester' },
  { date:'2026-07-01', label:'Reopening (Sem 5,7)' },
];

const WORKING_DAYS_MAP = { '2025-12':12, '2026-01':9, '2026-02':22, '2026-03':22, '2026-04':22, '2026-05':36 };

const calToday = new Date();
let calYear  = calToday.getFullYear();
let calMonth = calToday.getMonth();
const pad = n => String(n).padStart(2, '0');
const toKey = (y, m, d) => `${y}-${pad(m+1)}-${pad(d)}`;

function renderCalendar() {
  const grid = document.getElementById('calGrid');
  if (!grid) return;
  const firstDay   = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  grid.innerHTML = '';

  for (let i = 0; i < firstDay; i++) {
    const e = document.createElement('div');
    e.className = 'cal-cell empty';
    grid.appendChild(e);
  }

  let workCount = 0, holCount = 0, sunCount = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const key  = toKey(calYear, calMonth, d);
    const date = new Date(calYear, calMonth, d);
    const cell = document.createElement('div');
    let cls = ['cal-cell'], dot = false;

    const sunday  = date.getDay() === 0;
    const holiday = !!HOLIDAYS[key];
    const event   = EVENTS.find(e => e.date === key);
    const today   = calYear === calToday.getFullYear() && calMonth === calToday.getMonth() && d === calToday.getDate();

    if (sunday)  { cls.push('sunday'); sunCount++; }
    else if (holiday) { cls.push('holiday'); holCount++; dot = true; }
    else { workCount++; }
    if (event)  { cls.push('exam-event'); dot = true; }
    if (today)  cls.push('today');

    cell.className = cls.join(' ');
    cell.innerHTML  = `${d}${dot ? '<div class="cell-dot"></div>' : ''}`;
    cell.title = holiday ? HOLIDAYS[key] : (event ? event.label : '');
    grid.appendChild(cell);
  }

  // Summary strip
  const mk = `${calYear}-${pad(calMonth+1)}`;
  const officialWork = WORKING_DAYS_MAP[mk] || workCount;
  document.getElementById('sumWorkingDays').textContent = officialWork;
  document.getElementById('sumHolidays').textContent = holCount;
  document.getElementById('sumSundays').textContent = sunCount;

  const dayOfMonth = (calMonth === calToday.getMonth() && calYear === calToday.getFullYear()) ? calToday.getDate() : 0;
  const pct = officialWork > 0 ? Math.min(100, Math.round((dayOfMonth / daysInMonth) * 100)) : 0;
  document.getElementById('sumProgress').textContent = pct + '%';

  document.getElementById('monthLabel').textContent =
    new Date(calYear, calMonth, 1).toLocaleDateString('en-IN', { month:'long', year:'numeric' });

  renderHolidayList();
  renderEventList();
}

function renderHolidayList() {
  const ul = document.getElementById('holidayList'); if (!ul) return;
  ul.innerHTML = '';
  const mk = `${calYear}-${pad(calMonth+1)}`;
  const hols = Object.entries(HOLIDAYS).filter(([k]) => k.startsWith(mk));
  if (hols.length === 0) { ul.innerHTML = '<li style="color:var(--text-muted);font-size:0.8rem">No holidays this month 🎉</li>'; return; }
  hols.forEach(([ds, name]) => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="hol-date">${new Date(ds).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span><span class="hol-name">${name}</span>`;
    ul.appendChild(li);
  });
}
function renderEventList() {
  const ul = document.getElementById('eventList'); if (!ul) return;
  ul.innerHTML = '';
  const mk = `${calYear}-${pad(calMonth+1)}`;
  const evts = EVENTS.filter(e => e.date.startsWith(mk));
  if (evts.length === 0) { ul.innerHTML = '<li style="color:var(--text-muted);font-size:0.8rem">No major events this month</li>'; return; }
  evts.forEach(ev => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="evt-date">${new Date(ev.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span><span class="evt-name">${ev.label}</span>`;
    ul.appendChild(li);
  });
}

document.getElementById('prevMonth')?.addEventListener('click', () => { calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; } renderCalendar(); });
document.getElementById('nextMonth')?.addEventListener('click', () => { calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; } renderCalendar(); });


// ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
// ④ TIMER – Pomodoro / Countdown / Stopwatch
// ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒

const CIRC = 2 * Math.PI * 130;
let timerMode = 'pomodoro';
let timerRunning = false, timerInterval = null;

// Pomodoro
let pomFocus = 25*60, pomShortBrk = 5*60, pomLongBrk = 15*60;
let pomSessionsBefore = 4, pomCurSession = 1, pomPhase = 'focus';
let pomRemaining = 25*60, pomTotal = 25*60;

// Countdown
let cdTotal = 5*60, cdRemaining = 5*60;

// Stopwatch
let swElapsed = 0, swLaps = [];

function fmtTime(s) {
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

function setRing(frac) {
  const ring = document.getElementById('ringProgress');
  if (!ring) return;
  ring.style.strokeDasharray  = CIRC;
  ring.style.strokeDashoffset = CIRC * frac;
}

function initTimerDisplay() { updateTimerDisplay(); }

function updateTimerDisplay() {
  const digits = document.getElementById('timerDigits');
  const label  = document.getElementById('timerModeLabel');
  const session = document.getElementById('timerSession');
  if (!digits) return;

  if (timerMode === 'pomodoro') {
    digits.textContent = fmtTime(pomRemaining);
    label.textContent = pomPhase === 'focus' ? '🍅 FOCUS' : pomPhase === 'short' ? '☕ SHORT BREAK' : '🌙 LONG BREAK';
    session.textContent = `Session ${pomCurSession}`;
    setRing(1 - pomRemaining / pomTotal);
  } else if (timerMode === 'countdown') {
    digits.textContent = fmtTime(cdRemaining);
    label.textContent = '⏬ COUNTDOWN';
    session.textContent = '';
    setRing(1 - cdRemaining / Math.max(cdTotal, 1));
  } else {
    digits.textContent = fmtTime(swElapsed);
    label.textContent = '⏱ STOPWATCH';
    session.textContent = `Laps: ${swLaps.length}`;
    setRing(0);
  }
}

function timerTick() {
  if (timerMode === 'pomodoro') {
    if (pomRemaining > 0) { pomRemaining--; }
    else {
      if (pomPhase === 'focus') {
        if (pomCurSession % pomSessionsBefore === 0) { pomPhase = 'long'; pomTotal = pomLongBrk; pomRemaining = pomLongBrk; }
        else { pomPhase = 'short'; pomTotal = pomShortBrk; pomRemaining = pomShortBrk; }
      } else { pomPhase = 'focus'; pomCurSession++; pomTotal = pomFocus; pomRemaining = pomFocus; }
      timerNotify(pomPhase === 'focus' ? '🍅 Focus time!' : '☕ Break time!');
    }
  } else if (timerMode === 'countdown') {
    if (cdRemaining > 0) { cdRemaining--; }
    else { stopTimer(); timerNotify('⏰ Time is up!'); }
  } else { swElapsed++; }
  updateTimerDisplay();
}

function startTimer() {
  if (timerRunning) return;
  timerRunning = true;
  document.getElementById('timerStart').textContent = '⏸';
  timerInterval = setInterval(timerTick, 1000);
}
function pauseTimer() {
  timerRunning = false;
  document.getElementById('timerStart').textContent = '▶';
  clearInterval(timerInterval);
}
function stopTimer() { pauseTimer(); }
function resetTimerState() {
  stopTimer();
  document.getElementById('timerStart').textContent = '▶';
  if (timerMode === 'pomodoro') { pomPhase='focus'; pomCurSession=1; pomTotal=pomFocus; pomRemaining=pomFocus; }
  else if (timerMode === 'countdown') { cdRemaining = cdTotal; }
  else { swElapsed = 0; swLaps = []; renderLaps(); }
  updateTimerDisplay();
}

document.getElementById('timerStart')?.addEventListener('click', () => { timerRunning ? pauseTimer() : startTimer(); });
document.getElementById('timerReset')?.addEventListener('click', resetTimerState);
document.getElementById('timerSkip')?.addEventListener('click', () => { if (timerMode==='pomodoro') { pomRemaining=0; timerTick(); } });

// Mode tabs
document.querySelectorAll('.mode-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    stopTimer();
    timerMode = tab.dataset.mode;
    document.getElementById('pomodoroSettings').style.display = timerMode==='pomodoro'  ? 'block' : 'none';
    document.getElementById('countdownInput').style.display   = timerMode==='countdown' ? 'block' : 'none';
    document.getElementById('lapsSection').style.display      = timerMode==='stopwatch' ? 'block' : 'none';
    document.getElementById('timerSkip').style.display        = timerMode==='pomodoro'  ? 'flex'  : 'none';
    resetTimerState();
  });
});

// Countdown setter
document.getElementById('setCountdownBtn')?.addEventListener('click', () => {
  const h = parseInt(document.getElementById('cdHours').value)||0;
  const m = parseInt(document.getElementById('cdMinutes').value)||0;
  const s = parseInt(document.getElementById('cdSeconds').value)||0;
  cdTotal = h*3600 + m*60 + s;
  if (cdTotal <= 0) { alert('Please set a valid time!'); return; }
  cdRemaining = cdTotal; stopTimer(); updateTimerDisplay();
});

// Pomodoro sliders
[
  { id:'focusDur',    valId:'focusDurVal',    fn: v => { pomFocus   = v*60; if(pomPhase==='focus'){pomTotal=pomFocus;pomRemaining=pomFocus;} } },
  { id:'shortBreak',  valId:'shortBreakVal',  fn: v => { pomShortBrk = v*60; } },
  { id:'longBreak',   valId:'longBreakVal',   fn: v => { pomLongBrk  = v*60; } },
  { id:'sessionsCount',valId:'sessionsCountVal',fn: v => { pomSessionsBefore = v; } },
].forEach(cfg => {
  const sl = document.getElementById(cfg.id);
  const vl = document.getElementById(cfg.valId);
  sl?.addEventListener('input', () => { const v = parseInt(sl.value); vl.textContent = v; cfg.fn(v); resetTimerState(); });
});

// Laps
document.getElementById('lapBtn')?.addEventListener('click', () => { swLaps.push(swElapsed); renderLaps(); });
function renderLaps() {
  const ul = document.getElementById('lapsList'); if (!ul) return; ul.innerHTML = '';
  [...swLaps].reverse().forEach((t,i) => {
    const d = document.createElement('div'); d.className='lap-entry';
    d.innerHTML = `<span class="lap-num">Lap ${swLaps.length-i}</span><span class="lap-time">${fmtTime(t)}</span>`;
    ul.appendChild(d);
  });
}

function timerNotify(msg) {
  if ('Notification' in window && Notification.permission==='granted') new Notification('LAZARUS Timer',{body:msg,icon:'assets/logo.png'});
  else if ('Notification' in window && Notification.permission!=='denied') Notification.requestPermission().then(p=>{if(p==='granted')new Notification('LAZARUS Timer',{body:msg});});
}


// ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
// ⑤ RELAX – Guided Wellness Activities
// ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒

const ACTIVITIES = {
  breathe: {
    icon:'🫁', title:'Deep Breathing', subtitle:'4-7-8 Breathing Technique – Reduces anxiety within minutes', anim:'breathe',
    steps: [
      { instruction:'Sit comfortably with your back straight. Place the tip of your tongue against the ridge behind your upper front teeth.', duration:'Take a moment', phase:null },
      { instruction:'Exhale completely through your mouth, making a whoosh sound.', duration:'~4 seconds', phase:'exhale' },
      { instruction:'Close your mouth and inhale quietly through your nose for a count of 4. Feel your chest expand fully.', duration:'4 seconds', phase:'inhale' },
      { instruction:'Hold your breath for a count of 7. Let the oxygen circulate through your bloodstream.', duration:'7 seconds', phase:'hold' },
      { instruction:'Exhale completely through your mouth, making a whoosh sound, for a count of 8.', duration:'8 seconds', phase:'exhale' },
      { instruction:'That is one breath cycle. Repeat inhale-hold-exhale 3 more times for maximum relaxation.', duration:'Repeat 3x', phase:'inhale' },
      { instruction:'Slowly open your eyes. Notice how calm and clear your mind feels. You can return to work now!', duration:'Complete! ✨', phase:null },
    ]
  },
  eye: {
    icon:'👁️', title:'Eye Relaxation', subtitle:'20-20-20 Rule & Palming – Reduce digital eye strain', anim:'eye',
    steps: [
      { instruction:'Sit back from your screen. Blink 10 times slowly to re-moisturize your eyes.', duration:'20 seconds' },
      { instruction:'Look away from your screen and fix your gaze on an object 20 feet (~6 meters) away. Hold your gaze there.', duration:'20 seconds' },
      { instruction:'Slowly move your eyes from LEFT to RIGHT, then back. Do this 5 times without moving your head.', duration:'30 seconds' },
      { instruction:'Move your eyes UP and DOWN slowly. Repeat 5 times. Feel the stretch around your eye socket.', duration:'30 seconds' },
      { instruction:'Imagine a giant figure-8 lying flat in front of you. Trace it slowly with your eyes for 30 seconds.', duration:'30 seconds' },
      { instruction:'Rub your palms together until warm. Cup them gently over your CLOSED eyes without pressing. Breathe slowly.', duration:'60 seconds' },
      { instruction:'Open your eyes. Blink rapidly for 5 seconds, then close them gently. Repeat 3 times.', duration:'20 seconds' },
      { instruction:'Your eyes are now refreshed! Remember: take an eye break every 20 minutes of screen use.', duration:'Complete! ✨' },
    ]
  },
  stretch: {
    icon:'🧘', title:'Desk Stretches', subtitle:'Quick stretches to release muscle tension', anim:'generic',
    steps: [
      { instruction:'Slowly tilt your RIGHT ear toward your right shoulder. Hold for 15 seconds. Switch sides.', duration:'30 seconds' },
      { instruction:'Roll both shoulders FORWARD in 5 big circles slowly, then BACKWARD in 5 circles.', duration:'30 seconds' },
      { instruction:'Interlace your fingers behind your back. Squeeze shoulder blades together and lift your chest.', duration:'20 seconds' },
      { instruction:'Sit up straight. Twist your torso RIGHT, hold 15 sec. Switch sides.', duration:'30 seconds' },
      { instruction:'Extend both arms forward. Flex wrists UP (fingers pointing up) hold 10s. Then DOWN hold 10s.', duration:'20 seconds' },
      { instruction:'Cross right ankle over left knee. Press down on right knee. Hold 20 seconds then switch.', duration:'40 seconds' },
      { instruction:'Lean forward slowly, let arms hang toward floor. Release your spine completely.', duration:'30 seconds' },
      { instruction:'Sit back up slowly. Take 3 deep breaths. You are refreshed and ready to focus!', duration:'Complete! ✨' },
    ]
  },
  mindful: {
    icon:'🌸', title:'Mindfulness Pause', subtitle:'5-4-3-2-1 Grounding Technique – Instant calm', anim:'generic',
    steps: [
      { instruction:'Take a deep breath. You are about to anchor yourself in the present moment.', duration:'Begin' },
      { instruction:'Look around and name 5 things you can SEE right now.', duration:'~60 seconds' },
      { instruction:'Notice 4 things you can FEEL physically. Texture, temperature, pressure…', duration:'~45 seconds' },
      { instruction:'Close your eyes. Listen for 3 sounds right now.', duration:'~30 seconds' },
      { instruction:'Take a slow breath. Notice 2 things you can SMELL.', duration:'~20 seconds' },
      { instruction:'Notice 1 thing you can TASTE in your mouth right now.', duration:'~10 seconds' },
      { instruction:'You are here. You are grounded. Right now, you are safe and calm.', duration:'Complete! ✨' },
    ]
  },
  neck: {
    icon:'💆', title:'Neck & Shoulder Relief', subtitle:'Guided movements to ease stiffness and pain', anim:'generic',
    steps: [
      { instruction:'Drop your shoulders from your ears. Unclench your jaw. Take one slow breath.', duration:'10 seconds' },
      { instruction:'Lower your chin toward your chest. Hold for 15 seconds. Breathe and feel the stretch.', duration:'15 seconds' },
      { instruction:'Tilt LEFT ear to left shoulder. Do NOT raise shoulder. Hold 15 seconds.', duration:'15 seconds' },
      { instruction:'Tilt RIGHT ear to right shoulder. Hold for 15 seconds. Breathe slowly.', duration:'15 seconds' },
      { instruction:'Roll chin from LEFT shoulder across CHEST to RIGHT shoulder. Repeat 3 times.', duration:'30 seconds' },
      { instruction:'Shrug BOTH shoulders up, hold 3 sec, then DROP suddenly. Repeat 5 times.', duration:'30 seconds' },
      { instruction:'Right arm across chest, pull with left hand. Hold 20 seconds. Switch sides.', duration:'40 seconds' },
      { instruction:'Your neck and shoulders are relaxed. Take stretch breaks every 45 minutes!', duration:'Complete! ✨' },
    ]
  },
  focus: {
    icon:'🎯', title:'Box Breathing – Focus Reset', subtitle:'Used by Navy SEALs to remain calm under pressure', anim:'breathe',
    steps: [
      { instruction:'Sit upright. Relax your face and shoulders. 4-4-4-4 box pattern.', duration:'Begin', phase:null },
      { instruction:'Breathe IN through your nose slowly for a count of 4.', duration:'4 seconds', phase:'inhale' },
      { instruction:'Hold your breath for 4 counts. Keep your chest still.', duration:'4 seconds', phase:'hold' },
      { instruction:'Breathe OUT through your mouth slowly for 4 counts.', duration:'4 seconds', phase:'exhale' },
      { instruction:'Hold with lungs empty for 4 counts. Fourth side of the box.', duration:'4 seconds', phase:'hold' },
      { instruction:'Repeat 4-5 more times. Feel your mind clear with each cycle.', duration:'Repeat', phase:'inhale' },
      { instruction:'Your nervous system is regulated. Return to work with full presence.', duration:'Complete! ✨', phase:null },
    ]
  },
};

let curActivity = null, curStep = 0, breatheInterval = null;

document.querySelectorAll('.start-activity').forEach(btn => {
  btn.addEventListener('click', () => openActivity(btn.dataset.activity));
});

function openActivity(key) {
  curActivity = ACTIVITIES[key]; curStep = 0;
  document.getElementById('relaxOverlay').style.display = 'flex';
  document.getElementById('relaxIconBig').textContent  = curActivity.icon;
  document.getElementById('relaxTitle').textContent    = curActivity.title;
  document.getElementById('relaxSubtitle').textContent = curActivity.subtitle;
  showRelaxStep(0);
}

function showRelaxStep(idx) {
  clearInterval(breatheInterval);
  const step = curActivity.steps[idx];
  const total = curActivity.steps.length;

  document.getElementById('stepFill').style.width = `${((idx+1)/total)*100}%`;
  document.getElementById('stepCounter').textContent = `Step ${idx+1} of ${total}`;
  document.getElementById('stepInstruction').textContent = step.instruction;
  document.getElementById('stepDuration').textContent = step.duration;

  document.getElementById('prevStep').disabled = idx === 0;
  document.getElementById('nextStep').textContent = idx === total-1 ? '✓ Finish' : 'Next ›';

  // Animations
  const bc = document.getElementById('breathCircle');
  const ee = document.getElementById('eyeExercise');
  const ga = document.getElementById('genericAnim');
  bc.style.display = 'none'; ee.style.display = 'none'; ga.style.display = 'none';

  if (curActivity.anim === 'breathe') { bc.style.display = 'flex'; animBreathe(step.phase); }
  else if (curActivity.anim === 'eye') { ee.style.display = 'flex'; animEye(idx); }
  else { ga.style.display = 'flex'; }
}

function animBreathe(phase) {
  const bc = document.getElementById('breathCircle');
  const bt = document.getElementById('breathText');
  bc.className = 'breath-circle';
  if (!phase) { bt.textContent = 'Ready'; return; }
  if (phase === 'inhale') { bt.textContent = 'INHALE'; requestAnimationFrame(()=>bc.classList.add('inhale')); }
  if (phase === 'hold')   { bt.textContent = 'HOLD';   bc.classList.add('hold'); }
  if (phase === 'exhale') { bt.textContent = 'EXHALE'; requestAnimationFrame(()=>bc.classList.add('exhale')); }
}

const EYE_POS = [{x:50,y:50},{x:10,y:50},{x:90,y:50},{x:50,y:10},{x:50,y:90},{x:10,y:10},{x:90,y:10},{x:10,y:90},{x:90,y:90}];
let eyeIdx = 0;
function animEye(stepIdx) {
  const et = document.getElementById('eyeTarget');
  if (stepIdx < 1 || stepIdx > 4) { et.style.left='50%'; et.style.top='50%'; return; }
  function move() { const p=EYE_POS[eyeIdx%EYE_POS.length]; et.style.left=p.x+'%'; et.style.top=p.y+'%'; eyeIdx++; }
  move(); breatheInterval = setInterval(move, 1600);
}

document.getElementById('nextStep')?.addEventListener('click', () => {
  if (curStep < curActivity.steps.length-1) { curStep++; showRelaxStep(curStep); }
  else closeRelax();
});
document.getElementById('prevStep')?.addEventListener('click', () => {
  if (curStep > 0) { curStep--; showRelaxStep(curStep); }
});
document.getElementById('relaxClose')?.addEventListener('click', closeRelax);
document.getElementById('relaxOverlay')?.addEventListener('click', e => { if (e.target.id === 'relaxOverlay') closeRelax(); });

function closeRelax() {
  clearInterval(breatheInterval);
  document.getElementById('relaxOverlay').style.display = 'none';
  document.getElementById('breathCircle').className = 'breath-circle';
}


// ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
// ⑥ INIT
// ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒

renderTasks();
renderCalendar();
initTimerDisplay();

if (window.location.hash) {
  const page = window.location.hash.substring(1);
  if (['dashboard', 'calendar', 'timer', 'relax'].includes(page)) {
    switchPage(page);
  }
}
