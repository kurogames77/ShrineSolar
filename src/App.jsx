import { useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import SolarPanel from './pages/SolarPanel'
import Battery from './pages/Battery'
import Accessories from './pages/Accessories'
import './App.css'

function App() {
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    setIsShopOpen(false);
    navigate(path);
  };

  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen bg-[#a8a8a8] flex flex-col">
      {/* Header Layout (No visible container) */}
      {isHome && (
        <header className="w-full max-w-7xl mx-auto px-16 pt-24 pb-8 flex justify-between items-center">

        {/* Logo */}
        <img src="/logo.png" alt="Shrine Solar Logo" className="h-14 w-auto" />

        {/* Navigation Buttons */}
        <nav className="flex gap-10">
          <button onClick={() => navigate('/')} className="w-44 py-5 bg-[#909090] border-2 border-gray-500 text-black rounded-full font-medium text-center shadow-sm hover:bg-[#808080] transition-colors">
            Home
          </button>
          <button onClick={() => setIsShopOpen(true)} className="w-44 py-5 bg-[#909090] border-2 border-gray-500 text-black rounded-full font-medium text-center shadow-sm hover:bg-[#808080] transition-colors">
            Shop
          </button>
          <button onClick={() => setIsInquiryOpen(true)} className="w-44 py-5 bg-[#909090] border-2 border-gray-500 text-black rounded-full font-medium text-center shadow-sm hover:bg-[#808080] transition-colors">
            Inquiry
          </button>
        </nav>
      </header>
      )}

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col w-full">
        <Routes>
          <Route path="/" element={<p className="text-gray-600 text-lg">{/* Shrine Solar — Content will go here */}</p>} />
          <Route path="/solar-panel" element={<SolarPanel />} />
          <Route path="/battery" element={<Battery />} />
          <Route path="/accessories" element={<Accessories />} />
        </Routes>
      </main>
      {/* Shop Modal */}
      {isHome && isShopOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setIsShopOpen(false)}>
          <div className="bg-[#a8a8a8] border-4 border-gray-600 rounded-3xl w-11/12 max-w-5xl h-[60vh] min-h-[500px] flex items-center justify-center gap-12 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setIsShopOpen(false)}
              className="absolute top-6 right-6 text-gray-700 hover:text-black hover:bg-gray-300 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold transition-colors"
            >
              ✕
            </button>
            <button onClick={() => handleNavigation('/solar-panel')} className="w-56 h-56 bg-[#909090] border-2 border-gray-500 text-black font-semibold text-2xl rounded-2xl flex items-center justify-center shadow-lg hover:bg-[#808080] hover:scale-105 transition-all">
              Solar Panel
            </button>
            <button onClick={() => handleNavigation('/battery')} className="w-56 h-56 bg-[#909090] border-2 border-gray-500 text-black font-semibold text-2xl rounded-2xl flex items-center justify-center shadow-lg hover:bg-[#808080] hover:scale-105 transition-all">
              Battery
            </button>
            <button onClick={() => handleNavigation('/accessories')} className="w-56 h-56 bg-[#909090] border-2 border-gray-500 text-black font-semibold text-2xl rounded-2xl flex items-center justify-center shadow-lg hover:bg-[#808080] hover:scale-105 transition-all">
              Accessories
            </button>
          </div>
        </div>
      )}
      {/* Inquiry Modal */}
      {isHome && isInquiryOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setIsInquiryOpen(false)}>
          <div className="bg-[#a8a8a8] border-4 border-gray-600 rounded-3xl w-11/12 max-w-5xl h-[60vh] min-h-[500px] flex flex-col items-center justify-center gap-12 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setIsInquiryOpen(false)}
              className="absolute top-6 right-6 text-gray-700 hover:text-black hover:bg-gray-300 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold transition-colors"
            >
              ✕
            </button>
            <h2 className="text-4xl font-bold text-black tracking-wider">Contact Information</h2>
            <div className="flex gap-12">
              <a href="https://www.facebook.com/shrinesolarservices" target="_blank" rel="noopener noreferrer" className="w-56 h-56 bg-[#909090] border-2 border-gray-500 rounded-2xl flex flex-col items-center justify-center shadow-lg p-6 hover:bg-[#808080] hover:scale-105 transition-all">
                <span className="text-2xl font-bold text-black">Facebook</span>
                <span className="text-sm text-gray-700 mt-4 text-center">ShrineSolar</span>
              </a>
              <button onClick={() => navigator.clipboard.writeText('09171842499')} className="w-56 h-56 bg-[#909090] border-2 border-gray-500 rounded-2xl flex flex-col items-center justify-center shadow-lg p-6 hover:bg-[#808080] hover:scale-105 transition-all">
                <span className="text-2xl font-bold text-black">Mobile No.</span>
                <span className="text-sm text-gray-700 mt-4 text-center">09171842499</span>
              </button>
              <a href="https://mail.google.com/mail/?view=cm&fs=1&to=Shrinesolar2022@gmail.com" target="_blank" rel="noopener noreferrer" className="w-56 h-56 bg-[#909090] border-2 border-gray-500 rounded-2xl flex flex-col items-center justify-center shadow-lg p-6 hover:bg-[#808080] hover:scale-105 transition-all">
                <span className="text-2xl font-bold text-black">Gmail</span>
                <span className="text-sm text-gray-700 mt-4 text-center break-all">Shrinesolar2022@gmail.com</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
