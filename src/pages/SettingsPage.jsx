export default function SettingsPage({ intervalMinutes, setIntervalMinutes, entries, onClear }) {
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
