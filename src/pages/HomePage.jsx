import { useEffect, useState } from 'react';
import AddModal from '../components/AddModal';

export default function HomePage({ entries, intervalMinutes, onAdd, showSnack }) {
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
  const remaining = diffMin !== null ? Math.max(0, Math.ceil(intervalMinutes - diffMin)) : 0;
  const progress = diffMin !== null ? Math.min(diffMin / intervalMinutes, 1) : 1;
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
