import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import FanMode from './pages/FanMode'
import StaffMode from './pages/StaffMode'

function App() {
  const [accessibleMode, setAccessibleMode] = useState(false)

  const toggleAccessibility = () => {
    setAccessibleMode(!accessibleMode)
    if (!accessibleMode) {
      document.body.classList.add('accessible-mode')
    } else {
      document.body.classList.remove('accessible-mode')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        toggleAccessibility={toggleAccessibility} 
        accessibleMode={accessibleMode} 
      />
      
      <main>
        <Routes>
          <Route path="/" element={<FanMode accessibleMode={accessibleMode} />} />
          <Route path="/staff" element={<StaffMode />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
