import React, { useEffect, useState, useRef } from 'react';
import './styles.css';

const IconHome = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
    <path d="M9 21V12h6v9" />
  </svg>
);
const IconHistory = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
  </svg>
);
const IconSettings = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

function Snackbar({ message, icon }) {
  return (
    <div className={`snackbar ${message ? 'show' : ''}`}>
      {icon && <span className="snack-icon">{icon}</span>}
      <span>{message}</span>
    </div>
  );
}

function AddModal({ open, onClose, onAdd }) {
  const [customDate, setCustomDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [customTime, setCustomTime] = useState(() => {
    const n = new Date();
    return `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`;
  });
  function handle() {
    const [h, m] = customTime.split(':').map(Number);
    const [y, mo, d] = customDate.split('-').map(Number);
    const date = new Date(y, mo - 1, d, h, m);
    if (!isNaN(date)) { onAdd(date); onClose(); }
  }
  if (!open) return null;
  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Добавить запись</h2>
          <p>Выберите дату и время</p>
        </div>
        <div className="modal-controls">
          <div className="md-field">
            <label>Дата</label>
            <input type="date" value={customDate} onChange={e => setCustomDate(e.target.value)} />
          </div>
          <div className="md-field">
            <label>Время</label>
            <input type="time" value={customTime} onChange={e => setCustomTime(e.target.value)} />
          </div>
        </div>
        <div className="modal-buttons">
          <button className="btn-text btn-round" onClick={onClose}>Отмена</button>
          <button className="btn-filled btn-round" onClick={handle}>Добавить</button>
        </div>
      </div>
    </div>
  );
}

// ── Home Page ─────────────────────────────────────────────────────────────────
function HomePage({ entries, intervalMinutes, onAdd, showSnack }) {
  const [showModal, setShowModal] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now());
    }, 1000); // обновление каждую секунду

    return () => clearInterval(id);
  }, []);

  const sorted = [...entries].sort((a, b) => b.date - a.date);
  const last = sorted[0] || null;
  const diffMin = last ? (now - last.date.getTime()) / 60000 : null;
  const canSmoke = diffMin === null || diffMin >= intervalMinutes;
  const remaining = diffMin !== null ? Math.max(0, Math.ceil(intervalMinutes - diffMin)) : 0; const progress = diffMin !== null ? Math.min(diffMin / intervalMinutes, 1) : 1;
  const displayRemaining = remaining > intervalMinutes ? intervalMinutes : remaining;
  
  const R = 52, C = 2 * Math.PI * R;
  const progressClamped = Math.min(Math.max(progress, 0), 1);
  const offset = C * (1 - progressClamped);

  const todayCount = entries.filter(e => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return e.date >= d;
  }).length;

  function addNow() { onAdd(new Date()); showSnack('Добавлено 🚬', ''); }

  function checkTimer() {
    if (!entries.length) { showSnack('Нет записей', '📭'); return; }
    if (canSmoke) showSnack('Можно курнуть! 🚬', '');
    else showSnack(`Подожди ещё ${displayRemaining} мин ⏳`, '');
  }

  return (
    <div className="page home-page">
      {/* Progress ring card */}
      <div className="status-card">
        <div className="ring-wrap">
          <svg width="128" height="128" viewBox="0 0 128 128">
            {!canSmoke && (
              <>
                {/* фон */}
                <circle
                  cx="64"
                  cy="64"
                  r={R}
                  fill="none"
                  stroke="var(--md-outline-variant)"
                  strokeWidth="12"
                />

                {/* прогресс */}
                <circle
                  cx="64"
                  cy="64"
                  r={R}
                  fill="none"
                  stroke="var(--md-error)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={offset}
                  transform="rotate(-90 64 64)"
                  style={{
                    transition:
                      'stroke-dashoffset 1.2s cubic-bezier(0,0,0,1), stroke .4s',
                  }}
                />
              </>
            )}
          </svg>

          <div className="ring-inner">
            <span className="ring-emoji">
              {canSmoke ? '✅' : '⏳'}
            </span>
            <span className="ring-label">
              {canSmoke ? 'Можно!' : `${displayRemaining} мин`}
            </span>
          </div>
        </div>

        <div className="status-meta">
          {last ? (
            <div className="last-entry">
              <span className="last-label">Последний</span>
              <span className="last-time">
                {last.date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ) : (
            <span className="last-label">Нет записей</span>
          )}
        </div>

        <div className="stat-row">
          <div className="stat-pill">
            <span className="stat-n">{todayCount}</span>
            <span className="stat-l">сегодня</span>
          </div>
          <div className="stat-pill">
            <span className="stat-n">{entries.length}</span>
            <span className="stat-l">всего</span>
          </div>
          <div className="stat-pill">
            <span className="stat-n">{intervalMinutes}</span>
            <span className="stat-l">мин</span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="home-actions">
        <button className="btn-filled home-btn" onClick={addNow}>
          <span>＋</span> Добавить сейчас
        </button>
        <button className="btn-tonal home-btn" onClick={() => setShowModal(true)}>
          <span>🕐</span> Указать время
        </button>
        <button className={`home-btn ${canSmoke ? 'btn-tonal-green' : 'btn-outlined'}`} onClick={checkTimer}>
          <span>🔔</span> Проверить таймер
        </button>
      </div>

      <AddModal open={showModal} onClose={() => setShowModal(false)} onAdd={onAdd} />
    </div>
  );
}

// ── History Page ──────────────────────────────────────────────────────────────
function HistoryPage({ entries, onDelete }) {
  const [collapsedDays, setCollapsedDays] = useState({});
  const [selectedHourMap, setSelectedHourMap] = useState({});
  const currentHour = new Date().getHours();

  function groupByDay(items) {
    const groups = {};
    for (const e of items) {
      const d = e.date;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      (groups[key] = groups[key] || []).push(e);
    }
    return Object.entries(groups)
      .map(([day, list]) => [day, list.sort((a, b) => b.date - a.date)])
      .sort((a, b) => a[0] < b[0] ? 1 : -1);
  }

  function formatDay(key) {
    const [y, m, d] = key.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const yest = new Date(today); yest.setDate(today.getDate() - 1);
    if (date.getTime() === today.getTime()) return 'Сегодня';
    if (date.getTime() === yest.getTime()) return 'Вчера';
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' });
  }

  const grouped = groupByDay(entries);

  if (!grouped.length) return (
    <div className="page">
      <div className="empty">
        <div className="empty-icon">📋</div>
        <p>История пуста</p>
      </div>
    </div>
  );

  return (
    <div className="page history-page">
      <div className="entries">
        {grouped.map(([day, list], gi) => {
          const collapsed = collapsedDays[day];
          const hourCounts = Array(24).fill(0);
          list.forEach(e => hourCounts[e.date.getHours()]++);
          const maxCount = Math.max(...hourCounts, 1);
          const selectedHour = selectedHourMap[day];

          return (
            <div key={day} className="day-group show" style={{ transitionDelay: `${gi * 40}ms` }}>
              <button
                className="day-header"
                onClick={() => setCollapsedDays(p => ({ ...p, [day]: !p[day] }))}
              >
                <div className="day-header-left">
                  <span className="day-date">{formatDay(day)}</span>
                  <span className="day-count-chip">{list.length}</span>
                </div>
                <span className="arrow" style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>▾</span>
              </button>

              {!collapsed && (
                <div className="day-content">
                  <div>
                    <div className="hist-label" style={{ marginBottom: 8 }}>По часам</div>
                    <div className="day-histogram">
                      {hourCounts.map((count, hour) => {
                        const isSelected = selectedHour === hour;
                        const isCurrent = hour === currentHour;
                        const barH = count > 0 ? Math.max((count / maxCount) * 64, 6) : 2;
                        return (
                          <div key={hour} className="hour-bar-container" style={{ position: 'relative' }}>
                            {isSelected && count > 0 && <div className="tooltip">{count}</div>}
                            <div
                              className={`hour-bar${isCurrent ? ' current-hour' : ''}${isSelected ? ' selected' : ''}${count === 0 ? ' empty-bar' : ''}`}
                              style={{ height: `${barH}px` }}
                              onClick={() => setSelectedHourMap(p => ({ ...p, [day]: p[day] === hour ? null : hour }))}
                              title={`${hour}:00 — ${count} шт`}
                            />
                            <div className={`hour-label${isCurrent ? ' active' : ''}`}>
                              {hour % 6 === 0 ? hour : ''}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="day-entries">
                    <table>
                      <thead>
                        <tr>
                          <th className="left-align" style={{ width: 40 }}>№</th>
                          <th>Время</th>
                          <th style={{ width: 48 }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {list.map((e, i) => (
                          <tr key={e.id} style={{ animationDelay: `${i * 25}ms` }}>
                            <td className="left-align">
                              <span className="entry-number">{list.length - i}</span>
                            </td>
                            <td>
                              <span className="time-badge">
                                {new Date(e.iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </td>
                            <td className="right-align">
                              <button className="btn-delete" onClick={() => onDelete(e.id)}>✕</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Settings Page ─────────────────────────────────────────────────────────────
function SettingsPage({ intervalMinutes, setIntervalMinutes, entries, onClear }) {
  const todayCount = entries.filter(e => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return e.date >= d;
  }).length;

  return (
    <div className="page settings-page">
      <div className="settings-section">
        <div className="settings-title">Таймер</div>
        <div className="settings-card">
          <div className="settings-row">
            <div className="settings-row-info">
              <span className="settings-row-label">Интервал между стиками</span>
              <span className="settings-row-sub">Минимальное время ожидания</span>
            </div>
            <div className="stepper">
              <button className="stepper-btn" onClick={() => setIntervalMinutes(v => Math.max(1, v - 5))}>−</button>
              <span className="stepper-val">{intervalMinutes}</span>
              <button className="stepper-btn" onClick={() => setIntervalMinutes(v => v + 5)}>+</button>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-title">Статистика</div>
        <div className="settings-card">
          <div className="settings-row">
            <span className="settings-row-label">Сегодня выкурено</span>
            <span className="settings-row-badge">{todayCount} шт</span>
          </div>
          <div className="settings-divider" />
          <div className="settings-row">
            <span className="settings-row-label">Всего записей</span>
            <span className="settings-row-badge">{entries.length} шт</span>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-title">Данные</div>
        <div className="settings-card">
          <div className="settings-row" style={{ cursor: 'pointer' }} onClick={onClear}>
            <div className="settings-row-info">
              <span className="settings-row-label" style={{ color: 'var(--md-error)' }}>Очистить все записи</span>
              <span className="settings-row-sub">Действие необратимо</span>
            </div>
            <span style={{ fontSize: 20 }}>🗑️</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Bottom Nav ────────────────────────────────────────────────────────────────
function BottomNav({ active, onChange }) {
  const tabs = [
    { id: 'home', label: 'Главная', Icon: IconHome },
    { id: 'history', label: 'История', Icon: IconHistory },
    { id: 'settings', label: 'Настройки', Icon: IconSettings },
  ];
  return (
    <nav className="bottom-nav">
      {tabs.map(({ id, label, Icon }) => {
        const isActive = active === id;
        return (
          <button key={id} className={`nav-item ${isActive ? 'active' : ''}`} onClick={() => onChange(id)}>
            <div className="nav-pill">
              <div className="nav-icon"><Icon /></div>
            </div>
            <span className="nav-label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function SticksApp() {
  const STORAGE_KEY = 'smoked_sticks_entries_v7';
  const INTERVAL_KEY = 'sticks_interval_minutes';

  const [page, setPage] = useState('home');
  const [entries, setEntries] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw).map(e => ({
        ...e,
        date: new Date(e.iso),
        pretty: new Date(e.iso).toLocaleString('ru-RU')
      }));
    } catch { return []; }
  });
  const [intervalMinutes, setIntervalMinutes] = useState(
    () => Number(localStorage.getItem(INTERVAL_KEY) || '60')
  );
  const [snack, setSnack] = useState({ msg: '' });
  const snackTimer = useRef(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.map(e => ({ iso: e.iso, id: e.id })))); } catch { }
  }, [entries]);
  useEffect(() => { localStorage.setItem(INTERVAL_KEY, String(intervalMinutes)); }, [intervalMinutes]);

  function showSnack(msg) {
    clearTimeout(snackTimer.current);
    setSnack({ msg });
    snackTimer.current = setTimeout(() => setSnack({ msg: '' }), 3000);
  }

  function addEntry(date) {
    setEntries(prev => [{
      id: crypto?.randomUUID?.() ?? String(Date.now()),
      iso: date.toISOString(), date,
      pretty: date.toLocaleString('ru-RU')
    }, ...prev]);
  }

  function deleteEntry(id) {
    setEntries(prev => prev.filter(e => e.id !== id));
    showSnack('Запись удалена');
  }

  function clearAll() {
    if (!window.confirm('Удалить все записи?')) {
      return;
    }
    if (!window.confirm('Это действие необратимо. Вы уверены?')) {
      return;
    }
    setEntries([]); showSnack('Очищено');
  }

  const titles = { home: 'Стики', history: 'История', settings: 'Настройки' };
  const todayCount = entries.filter(e => { const d = new Date(); d.setHours(0, 0, 0, 0); return e.date >= d; }).length;

  return (
    <div className="app-root">
      <div className="top-bar">
        <div className="top-bar-icon">🚬</div>
        <h1>{titles[page]}</h1>
        {page === 'home' && <div className="counter-chip">{todayCount} сегодня</div>}
      </div>

      <div className="page-container">
        {page === 'home' && (
          <HomePage entries={entries} intervalMinutes={intervalMinutes} onAdd={addEntry} showSnack={showSnack} />
        )}
        {page === 'history' && <HistoryPage entries={entries} onDelete={deleteEntry} />}
        {page === 'settings' && (
          <SettingsPage intervalMinutes={intervalMinutes} setIntervalMinutes={setIntervalMinutes} entries={entries} onClear={clearAll} />
        )}
      </div>

      <BottomNav active={page} onChange={setPage} />
      <Snackbar message={snack.msg} />
    </div>
  );
}