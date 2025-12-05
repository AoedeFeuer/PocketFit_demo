import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './reset.css'
import { inject } from '@vercel/analytics/next';
createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>)
