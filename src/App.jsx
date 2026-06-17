import { useEffect, useState, useRef } from 'react';
import './styles.css';
import Snackbar from './components/Snackbar';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';

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