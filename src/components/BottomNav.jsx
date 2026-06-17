import IconHome from './icons/IconHome';
import IconHistory from './icons/IconHistory';
import IconSettings from './icons/IconSettings';

export default function BottomNav({ active, onChange }) {
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
