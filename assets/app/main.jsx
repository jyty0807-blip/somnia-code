import React from 'react'
import ReactDOM from 'react-dom/client'
import './app.css'
import '../image-slot.js'
import { App } from './app.jsx'

function fit() {
  const sc = document.getElementById('scaler');
  if (!sc) return;
  const m = 36;
  const s = Math.min((window.innerWidth - m) / 402, (window.innerHeight - m) / 874, 1.1);
  sc.style.transform = 'scale(' + s + ')';
}
window.addEventListener('resize', fit);

ReactDOM.createRoot(document.getElementById('scaler')).render(<App />);
setTimeout(fit, 30);
