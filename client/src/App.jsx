import React, { useEffect, useState } from 'react'

export default function App() {
  const [ping, setPing] = useState(null)

  useEffect(() => {
    fetch('/api/ping')
      .then(res => res.json())
      .then(data => setPing(data.msg))
      .catch(() => setPing('no response'))
  }, [])

  return (
    <div style={{fontFamily: 'Arial, sans-serif', padding: 20}}>
      <h1>Smart Expense Tracker (Minimal)</h1>
      <p>Backend ping: {ping ?? 'loading...'}</p>
      <p>This is a minimal React + Vite scaffold. Expand from here.</p>
    </div>
  )
}
