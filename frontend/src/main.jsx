import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: 'rgba(10,10,20,0.95)', color: '#fff', border: '1px solid rgba(168,85,247,0.25)', backdropFilter: 'blur(20px)', fontFamily: '"DM Sans",sans-serif', fontSize: '13px', borderRadius: '12px' },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          duration: 4000,
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
