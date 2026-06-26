import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

// Keep links inside PWA fullscreen mode (prevent breaking out to Safari)
if (window.navigator.standalone) {
  document.addEventListener('click', function(e) {
    var a = e.target.closest('a');
    if (a && !a.getAttribute('target') && a.href) {
      e.preventDefault();
      window.location = a.href;
    }
  });
}
