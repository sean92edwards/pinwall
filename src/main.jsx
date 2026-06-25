import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Capacitor initialization
const initCapacitor = async () => {
  try {
    const { Capacitor } = await import('@capacitor/core')

    if (Capacitor.isNativePlatform()) {
      // Hide splash screen once the app is ready
      const { SplashScreen } = await import('@capacitor/splash-screen')
      await SplashScreen.hide()

      // Handle Android back button
      const { App: CapApp } = await import('@capacitor/app')
      CapApp.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          CapApp.minimizeApp()
        } else {
          window.history.back()
        }
      })

      // Configure status bar
      const { StatusBar, Style } = await import('@capacitor/status-bar')
      await StatusBar.setStyle({ style: Style.Light })
      await StatusBar.setBackgroundColor({ color: '#fffdf8' })

      // Handle keyboard for better mobile experience
      const { Keyboard } = await import('@capacitor/keyboard')
      Keyboard.addListener('keyboardWillShow', () => {
        document.body.classList.add('keyboard-open')
      })
      Keyboard.addListener('keyboardWillHide', () => {
        document.body.classList.remove('keyboard-open')
      })
    }
  } catch (e) {
    // Capacitor not available (running in browser) - that's fine
    console.debug('Capacitor not available:', e.message)
  }
}

// Initialize the app
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Run Capacitor init after render
initCapacitor()
