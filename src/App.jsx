import React, { useEffect, useState } from 'react';
import './index.css';

export default function SticksApp() {
  const STORAGE_KEY = 'smoked_sticks_entries_v3';
  const [entries, setEntries] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [collapsedDays, setCollapsedDays] = useState({});

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {}
  }, [entries]);

  function addNow() {
    const now = new Date();
    const entry = {
      id: crypto?.randomUUID?.() ?? String(Date.now()),
      iso: now.toISOString(),
      pretty: now.toLocaleString(),
      dayKey: now.toISOString().split('T')[0],
    };
    setEntries(prev => [entry, ...prev]);
  }

  function clearAll() {
    setEntries([]);
  }

  function toggleDay(day) {
    setCollapsedDays(prev => ({ ...prev, [day]: !prev[day] }));
  }

  function groupByDay(items) {
    const groups = {};
    for (const e of items) {
      if (!groups[e.dayKey]) groups[e.dayKey] = [];
      groups[e.dayKey].push(e);
    }
    return Object.entries(groups).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }

  const grouped = groupByDay(entries);

  return (
    <div className="app-container">
      <div className="card">
        <h1>Выкуренные стики</h1>

        <div className="controls">
          <button onClick={addNow}>Добавить запись</button>
          <button onClick={clearAll} className="secondary">Очистить</button>
          <div className="counter">Записей: {entries.length}</div>
        </div>

        <div className="entries">
          {grouped.length === 0 ? (
            <div className="empty">Нет записей</div>
          ) : (
            grouped.map(([day, list]) => {
              const collapsed = collapsedDays[day];
              return (
                <div key={day} className="day-group">
                  <button
                    className={`day-header ${collapsed ? 'collapsed' : ''}`}
                    onClick={() => toggleDay(day)}
                  >
                    <span>{day}. Выкурено: {list.length}</span>
                    <span
                      className="arrow"
                      style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}
                    >
                      ▼
                    </span>
                  </button>

                  <div className={`day-entries ${collapsed ? 'collapsed' : ''}`}>
                    <table>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Время (локальное)</th>
                          <th>ISO</th>
                        </tr>
                      </thead>
                      <tbody>
                        {list.map((e, i) => (
                          <tr key={e.id}>
                            <td>{list.length - i}</td>
                            <td>{e.pretty}</td>
                            <td>{e.iso}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
