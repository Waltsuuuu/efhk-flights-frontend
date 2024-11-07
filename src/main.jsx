import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import FlightData from './App.jsx'
import React from 'react'



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FlightData />
  </StrictMode>,
)
