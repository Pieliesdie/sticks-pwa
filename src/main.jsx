import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import SticksApp from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SticksApp />
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}