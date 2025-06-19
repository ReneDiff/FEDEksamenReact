import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'; 

const rootElement = document.getElementById('root')

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>,
  )
} else {
  console.error("Kunne ikke finde root-elementet. Tjek at du har et <div id=\"root\"></div> i din index.html.");
}
