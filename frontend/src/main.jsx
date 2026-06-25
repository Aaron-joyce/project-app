import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ToastProvider } from './toastContext.jsx';
import { AuthProvider } from './authContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <AuthProvider>
        <Router>
          <App />
        </Router>
      </AuthProvider>
    </ToastProvider>
  </StrictMode>,
)
