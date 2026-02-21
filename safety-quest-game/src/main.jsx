import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'
import { initializeAnalytics } from './utils/analytics'
import { registerSW } from 'virtual:pwa-register'

// GA4 초기화
initializeAnalytics();

import { AuthProvider } from './context/AuthContext';

registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <App />
        </AuthProvider>
    </React.StrictMode>,
)

