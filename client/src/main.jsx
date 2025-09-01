import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AppContextProvider } from './context/AppContext.jsx'
import { TeamContextProvider } from './context/TeamContext.jsx'
import axios from 'axios'

axios.defaults.withCredentials = true

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppContextProvider>
      <TeamContextProvider>
        <App />
      </TeamContextProvider>
    </AppContextProvider>
  </StrictMode>
)
