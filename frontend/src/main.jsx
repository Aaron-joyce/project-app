import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Registration from './registration.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Registration/>
  </StrictMode>,
)
