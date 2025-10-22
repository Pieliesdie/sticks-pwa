import React, { useEffect, useState } from 'react';
import './styles.css';

export default function SticksApp() {
  const STORAGE_KEY = 'smoked_sticks_entries_v7';
  const INTERVAL_KEY = 'sticks_interval_minutes';

  const [entries, setEntries] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return arr.map(e => ({
        ...e,
        date: new Date(e.iso),
        pretty: new Date(e.iso).toLocaleString()
      }));
    } catch {
      return [];
    }
  });

  const [collapsedDays, setCollapsedDays] = useState({});
  const [selectedHourMap, setSelectedHourMap] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customDate, setCustomDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [customTime, setCustomTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [intervalMinutes, setIntervalMinutes] = useState(() => {
    const saved = localStorage.getItem(INTERVAL_KEY);
    return saved ? Number(saved) : 60;
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(entries.map(e => ({ iso: e.iso, id: e.id })))
      );
    } catch {}
  }, [entries]);

  useEffect(() => {
    localStorage.setItem(INTERVAL_KEY, String(intervalMinutes));
  }, [intervalMinutes]);

  function addEntry(date) {
    const entry = {
      id: crypto?.randomUUID?.() ?? String(Date.now()),
      iso: date.toISOString(),
      date,
      pretty: date.toLocaleString()
    };
    setEntries(prev => [entry, ...prev]);
    setMenuOpen(false);
  }

  function handleAddCustom() {
    const [hours, minutes] = customTime.split(':').map(Number);
    const [year, month, day] = customDate.split('-').map(Number);
    const date = new Date(year, month - 1, day, hours, minutes);
    if (!isNaN(date)) {
      addEntry(date);
      setShowCustomModal(false);
    }
  }

  function clearAll() {
    if (window.confirm('Вы уверены, что хотите удалить все записи?')) {
      setEntries([]);
    }
  }

  function checkInterval() {
    if (entries.length === 0) {
      alert('Нет записей');
      return;
    }
    const last = new Date(entries.sort((a, b) => b.date - a.date)[0].iso);
    const diffMin = (Date.now() - last.getTime()) / 60000;
    if (diffMin >= intervalMinutes) {
      alert(`Можно курнуть 🚬`);
    } else {
      alert(`Терпи еще ${Math.floor(intervalMinutes - diffMin)} минут 💪`);
    }
  }

  function toggleDay(day) {
    setCollapsedDays(prev => ({ ...prev, [day]: !prev[day] }));
  }

  function groupByDay(items) {
    const groups = {};
    for (const e of items) {
      const d = e.date;
      const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!groups[dayKey]) groups[dayKey] = [];
      groups[dayKey].push(e);
    }

    return Object.entries(groups)
      .map(([day, list]) => [day, list.sort((a, b) => b.date - a.date)])
      .sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }

  const grouped = groupByDay(entries);

  return (
    <div className="app-container">
      <div className={`card ${loaded ? 'show' : ''}`}>
        <h1>Выкуренные стики</h1>

        <div className="controls">
          <div className="dropdown" onMouseLeave={() => setMenuOpen(false)}>
            <button className="dropdown-button" onClick={() => setMenuOpen(prev => !prev)}>
              Добавить запись ▼
            </button>
            {menuOpen && (
              <div className="dropdown-menu show">
                <button onClick={() => addEntry(new Date())}>Текущее время</button>
                <button onClick={() => { setShowCustomModal(true); setMenuOpen(false); }}>
                  Указанное время
                </button>
              </div>
            )}
          </div>

          <button onClick={clearAll} className="secondary">Очистить</button>

          <div className="interval-control">
            <label>
              Интервал:&nbsp;
              <input
                type="number"
                min="1"
                value={intervalMinutes}
                onChange={e => setIntervalMinutes(Number(e.target.value))}
                className="small-input"
              />
              мин
            </label>
            <button onClick={checkInterval}>Проверить</button>
          </div>

          <div className="counter">Записей: {entries.length}</div>
        </div>

        {showCustomModal && (
          <div className="modal-overlay show">
            <div className="modal">
              <h2>Выберите дату и время</h2>
              <div className="modal-controls">
                <label>Дата:</label>
                <input
                  type="date"
                  value={customDate}
                  onChange={e => setCustomDate(e.target.value)}
                />
                <label>Время:</label>
                <input
                  type="time"
                  value={customTime}
                  onChange={e => setCustomTime(e.target.value)}
                />
              </div>
              <div className="modal-buttons">
                <button onClick={handleAddCustom}>Добавить</button>
                <button onClick={() => setShowCustomModal(false)} className="secondary">Отмена</button>
              </div>
            </div>
          </div>
        )}

        <div className="entries">
          {grouped.length === 0 ? (
            <div className="empty">Нет записей</div>
          ) : (
            grouped.map(([day, list]) => {
              const collapsed = collapsedDays[day];
              const hourCounts = Array(24).fill(0);
              list.forEach(e => hourCounts[e.date.getHours()]++);
              const maxHourCount = Math.max(...hourCounts, 1);
              const currentHour = new Date().getHours();
              const selectedHour = selectedHourMap[day];

              return (
                <div key={day} className={`day-group ${loaded ? 'show' : ''}`}>
                  <button
                    className={`day-header ${collapsed ? 'collapsed' : ''}`}
                    onClick={() => toggleDay(day)}
                  >
                    <span>{day}. Выкурено: {list.length}</span>
                    <span className="arrow" style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}>▼</span>
                  </button>

                  {!collapsed && (
                    <div className="day-content">
                      <div className="day-histogram">
                        {hourCounts.map((count, hour) => {
                          const isSelected = selectedHour === hour;
                          return (
                            <div key={hour} className="hour-bar-container">
                              <div
                                className={`hour-bar ${hour === currentHour ? 'current-hour' : ''} ${isSelected ? 'selected' : ''}`}
                                style={{ height: `${(count / maxHourCount) * 80}px` }}
                                onClick={() => setSelectedHourMap(prev => ({
                                  ...prev,
                                  [day]: prev[day] === hour ? null : hour
                                }))}
                              />
                              {isSelected && count > 0 && (
                                <div className="tooltip">{count}</div>
                              )}
                              <div className="hour-label">{hour}</div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="day-entries">
                        <table>
                          <thead>
                            <tr>
                              <th className='left-align'>№</th>
                              <th>Время</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {list.map((e, i) => (
                              <tr key={e.id}>
                                <td className='left-align'>{list.length - i}</td>
                                <td>{e.pretty.split(',')[1]?.trim().slice(0, 5)}</td>
                                <td className="action-cell right-align">
                                  <button
                                    className="secondary small-button"
                                    onClick={() => setEntries(prev => prev.filter(entry => entry.id !== e.id))}
                                  >
                                    ❌
                                  </button>
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
            })
          )}
        </div>
      </div>
    </div>
  );
}
