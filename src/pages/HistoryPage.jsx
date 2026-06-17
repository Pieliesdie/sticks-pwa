import { useState } from 'react';

export default function HistoryPage({ entries, onDelete }) {
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
