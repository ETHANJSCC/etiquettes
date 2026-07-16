import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './base.css'

/**
 * Point d'entree du renderer : monte l'application React dans le DOM.
 */
const container = document.getElementById('root')
if (!container) {
  throw new Error("Element racine #root introuvable dans le document HTML.")
}

ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
