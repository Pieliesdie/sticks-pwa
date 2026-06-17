export default function Snackbar({ message, icon }) {
  return (
    <div className={`snackbar ${message ? 'show' : ''}`}>
      {icon && <span className="snack-icon">{icon}</span>}
      <span>{message}</span>
    </div>
  );
}
