import { useState, lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'

const FanMode = lazy(() => import('./pages/FanMode'))
const StaffMode = lazy(() => import('./pages/StaffMode'))

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
        <Suspense fallback={<div className="flex h-[50vh] items-center justify-center text-slate-400">Loading App Module...</div>}>
          <Routes>
            <Route path="/" element={<FanMode accessibleMode={accessibleMode} />} />
            <Route path="/staff" element={<StaffMode />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  )
}

export default App
