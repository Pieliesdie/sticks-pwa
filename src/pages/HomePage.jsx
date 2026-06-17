import { useEffect, useState } from 'react';
import AddModal from '../components/AddModal';

const TAG_OPTIONS = [
  { label: 'Стресс', icon: '🤯' },
  { label: 'Кофе', icon: '☕' },
  { label: 'Скука', icon: '🥱' },
  { label: 'Привычка', icon: '🔄' },
  { label: 'Перекур', icon: '🚬' }
];

export default function HomePage({ entries, intervalMinutes, onAdd, showSnack, timeSinceLast, moneySpentToday, moneySpentTotal, dailyLimit }) {
  const [showModal, setShowModal] = useState(false);
  const [showTagSheet, setShowTagSheet] = useState(false);
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

  const todayCount = entries.filter(e => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return e.date >= d;
  }).length;

  const R = 52, C = 2 * Math.PI * R;
  const progressClamped = Math.min(Math.max(progress, 0), 1);
  const offset = C * (1 - progressClamped);

  const progressLimit = dailyLimit > 0 ? Math.min(todayCount / dailyLimit, 1) : 0;
  const offsetLimit = C * (1 - progressLimit);
  const isOverLimit = todayCount >= dailyLimit;

  function handleAddClick() { 
    if (navigator.vibrate) navigator.vibrate(50);
    setShowTagSheet(true);
  }

  function confirmAdd(tagLabel) {
    if (navigator.vibrate) navigator.vibrate(50);
    onAdd(new Date(), tagLabel);
    setShowTagSheet(false);
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
      <div className="page-content">
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

      {/* Buttons */}
      <div className="home-actions" style={{ marginTop: '16px' }}>
        <button className="btn-filled home-btn" onClick={handleAddClick}>
          <span>＋</span> Добавить сейчас
        </button>
        <button className="btn-tonal home-btn" onClick={() => setShowModal(true)}>
          <span>🕐</span> Указать время
        </button>
        <button className={`home-btn ${canSmoke ? 'btn-tonal-green' : 'btn-outlined'}`} onClick={checkTimer}>
          <span>🔔</span> Проверить таймер
        </button>
      </div>
      </div>

      <AddModal open={showModal} onClose={() => setShowModal(false)} onAdd={onAdd} tag={null} />

      {/* Tag Bottom Sheet */}
      <div className={`modal-overlay ${showTagSheet ? 'show' : ''}`} onClick={() => setShowTagSheet(false)}>
        <div className="modal" onClick={e => e.stopPropagation()} style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)' }}>
          <div className="modal-header">
            <h2>Почему курим?</h2>
            <p>Выбери причину или пропусти</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '12px', margin: '16px 0' }}>
            {TAG_OPTIONS.map(t => (
              <button
                key={t.label}
                className="btn-tonal"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px 8px', borderRadius: '20px', border: 'none', cursor: 'pointer' }}
                onClick={() => confirmAdd(t.label)}
              >
                <span style={{ fontSize: '28px' }}>{t.icon}</span>
                <span style={{ fontSize: '11px', fontWeight: '600' }}>{t.label}</span>
              </button>
            ))}
          </div>

          <button 
            className="btn-outlined home-btn" 
            style={{ width: '100%' }}
            onClick={() => confirmAdd(null)}
          >
            Пропустить
          </button>
        </div>
      </div>
    </div>
  );
}
