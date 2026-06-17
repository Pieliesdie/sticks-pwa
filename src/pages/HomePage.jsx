import { useEffect, useState } from 'react';
import AddModal from '../components/AddModal';

const TAG_OPTIONS = ['Стресс', 'Кофе', 'Скука', 'Привычка', 'Перекур'];

export default function HomePage({ entries, intervalMinutes, onAdd, showSnack, timeSinceLast, moneySpentToday, moneySpentTotal, dailyLimit }) {
  const [showModal, setShowModal] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [selectedTag, setSelectedTag] = useState(null);

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

  const todayCount = entries.filter(e => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return e.date >= d;
  }).length;

  const R = 52, C = 2 * Math.PI * R;
  const progressClamped = Math.min(Math.max(progress, 0), 1);
  const offset = C * (1 - progressClamped);

  const progressLimit = dailyLimit > 0 ? Math.min(todayCount / dailyLimit, 1) : 0;
  const offsetLimit = C * (1 - progressLimit);
  const isOverLimit = todayCount >= dailyLimit;

  function addNow() { 
    if (navigator.vibrate) navigator.vibrate(50);
    onAdd(new Date(), selectedTag); 
    showSnack('Добавлено 🚬', ''); 
  }

  function checkTimer() {
    if (navigator.vibrate) navigator.vibrate(20);
    if (!entries.length) { showSnack('Нет записей', '📭'); return; }
    if (canSmoke) showSnack('Можно курнуть! 🚬', '');
    else showSnack(`Подожди ещё ${displayRemaining} мин ⏳`, '');
  }

  return (
    <div className="page home-page">
      {/* Progress rings card */}
      <div className="status-card">
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          {/* Main Timer Ring */}
          <div className="ring-wrap" style={{ flexShrink: 0 }}>
            <svg width="128" height="128" viewBox="0 0 128 128">
              {!canSmoke && (
                <>
                  <circle
                    cx="64"
                    cy="64"
                    r={R}
                    fill="none"
                    stroke="var(--md-outline-variant)"
                    strokeWidth="12"
                  />
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
                      transition: 'stroke-dashoffset 1.2s cubic-bezier(0,0,0,1), stroke .4s',
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

          {/* Daily Limit Ring */}
          <div className="ring-wrap" style={{ transform: 'scale(0.85)', flexShrink: 0 }}>
            <svg width="128" height="128" viewBox="0 0 128 128">
              <circle
                cx="64"
                cy="64"
                r={R}
                fill="none"
                stroke="var(--md-outline-variant)"
                strokeWidth="12"
              />
              <circle
                cx="64"
                cy="64"
                r={R}
                fill="none"
                stroke={isOverLimit ? "var(--md-error)" : "var(--md-primary)"}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={offsetLimit}
                transform="rotate(-90 64 64)"
                style={{
                  transition: 'stroke-dashoffset 1.2s cubic-bezier(0,0,0,1), stroke .4s',
                }}
              />
            </svg>
            <div className="ring-inner">
              <span className="ring-emoji">
                {isOverLimit ? '🛑' : '🎯'}
              </span>
              <span className="ring-label">
                {todayCount} / {dailyLimit}
              </span>
            </div>
          </div>
        </div>

        <div className="stat-row" style={{ flexWrap: 'wrap' }}>
          <div className="stat-pill" style={{ minWidth: '30%' }}>
            <span className="stat-n">{entries.length}</span>
            <span className="stat-l">всего шт</span>
          </div>
          <div className="stat-pill" style={{ minWidth: '30%' }}>
            <span className="stat-n">{Math.round(moneySpentTotal || 0)}₽</span>
            <span className="stat-l">всего</span>
          </div>
          <div className="stat-pill" style={{ minWidth: '30%' }}>
            <span className="stat-n">{todayCount}</span>
            <span className="stat-l">сегодня шт</span>
          </div>
          <div className="stat-pill" style={{ minWidth: '30%' }}>
            <span className="stat-n">{Math.round(moneySpentToday || 0)}₽</span>
            <span className="stat-l">сегодня</span>
          </div>
          {last && (
            <div className="stat-pill" style={{ minWidth: '30%' }}>
              <span className="stat-n">
                {last.date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="stat-l">последний</span>
            </div>
          )}
        </div>
      </div>

      {/* Tag selector */}
      <div className="tag-selector" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', margin: '12px 0' }}>
        {TAG_OPTIONS.map(t => (
          <button
            key={t}
            className={selectedTag === t ? 'btn-filled' : 'btn-outlined'}
            style={{ borderRadius: 16, padding: '4px 12px', fontSize: 13 }}
            onClick={() => setSelectedTag(prev => prev === t ? null : t)}
          >{t}</button>
        ))}
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

      <AddModal open={showModal} onClose={() => setShowModal(false)} onAdd={onAdd} tag={selectedTag} />
    </div>
  );
}
