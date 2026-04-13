import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import './index.css'
import App from './App.jsx'
import AppMobile from './AppMobile.jsx'

const isNative = Capacitor.isNativePlatform()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isNative ? <AppMobile /> : <App />}
  </StrictMode>,
)
