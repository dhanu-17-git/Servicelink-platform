import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './context/ThemeContext'
import { FavouritesProvider } from './context/FavouritesContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <FavouritesProvider>
        <App />
      </FavouritesProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
