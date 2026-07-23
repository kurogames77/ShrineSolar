import { useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import SolarPanel from './pages/SolarPanel'
import Battery from './pages/Battery'
import Accessories from './pages/Accessories'
import MyCart from './pages/MyCart'
import CinematicIntro from './pages/CinematicIntro'
import './App.css'

function App() {
  // Only show intro once per session (so navigating back to "/" doesn't replay it)
  const [showIntro, setShowIntro] = useState(() => {
    if (sessionStorage.getItem('shrine_intro_seen')) return false;
    return true;
  });
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isFacebookOpen, setIsFacebookOpen] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleIntroComplete = () => {
    sessionStorage.setItem('shrine_intro_seen', '1');
    setShowIntro(false);
  };

  const handleNavigation = (path) => {
    setIsShopOpen(false);
    setIsFacebookOpen(false);
    navigate(path);
  };

  const isHome = location.pathname === '/';

  return (
    <>
      {/* Cinematic intro overlay — homepage renders underneath */}
      {showIntro && isHome && (
        <div className="fixed inset-0 z-[9999]" style={{ width: '100vw', height: '100vh' }}>
          <CinematicIntro onComplete={handleIntroComplete} />
        </div>
      )}

      <div className="min-h-screen bg-[#a8a8a8] flex flex-col">
        {/* Header Layout (No visible container) */}
        {isHome && (
          <header className="w-full max-w-7xl mx-auto px-4 sm:px-16 pt-8 sm:pt-24 pb-4 sm:pb-8 flex flex-col sm:flex-row justify-between items-center gap-4">

            {/* Logo */}
            <img src="/logo.png" alt="Shrine Solar Logo" className="h-10 sm:h-14 w-auto" />

            {/* Navigation Buttons */}
            <nav className="flex gap-3 sm:gap-10">
              <button onClick={() => navigate('/')} className="w-28 sm:w-44 py-3 sm:py-5 bg-[#909090] border-2 border-gray-500 text-black rounded-full font-medium text-center text-sm sm:text-base shadow-sm hover:bg-[#808080] transition-colors">
                Home
              </button>
              <button onClick={() => setIsFacebookOpen(true)} className="w-28 sm:w-44 py-3 sm:py-5 bg-[#909090] border-2 border-gray-500 text-black rounded-full font-medium text-center text-sm sm:text-base shadow-sm hover:bg-[#808080] transition-colors">
                Facebook post
              </button>
              <button onClick={() => setIsShopOpen(true)} className="w-28 sm:w-44 py-3 sm:py-5 bg-[#909090] border-2 border-gray-500 text-black rounded-full font-medium text-center text-sm sm:text-base shadow-sm hover:bg-[#808080] transition-colors">
                Shop
              </button>
              <button onClick={() => setIsInquiryOpen(true)} className="w-28 sm:w-44 py-3 sm:py-5 bg-[#909090] border-2 border-gray-500 text-black rounded-full font-medium text-center text-sm sm:text-base shadow-sm hover:bg-[#808080] transition-colors">
                Inquiry
              </button>
              <button onClick={() => navigate('/my-cart')} className="w-28 sm:w-44 py-3 sm:py-5 bg-[#909090] border-2 border-gray-500 text-black rounded-full font-medium text-center text-sm sm:text-base shadow-sm hover:bg-[#808080] transition-colors">
                My Carts
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
            <Route path="/my-cart" element={<MyCart />} />
          </Routes>
        </main>
        {/* Facebook Modal */}
        {isHome && isFacebookOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setIsFacebookOpen(false)}>
            <div className="bg-[#a8a8a8] border-4 border-gray-600 rounded-3xl w-full max-w-2xl h-[85vh] sm:h-[75vh] flex flex-col shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setIsFacebookOpen(false)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-700 hover:text-black hover:bg-gray-300 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold transition-colors z-10"
              >
                ✕
              </button>
              <h2 className="text-xl sm:text-2xl font-bold text-black tracking-wider text-center pr-14 sm:pr-20 pl-14 sm:pl-20 flex items-center justify-center h-[58px] sm:h-[72px] flex-shrink-0">Facebook Post</h2>
              <div className="flex-grow flex flex-col w-full items-center justify-start px-4 pb-4 sm:px-8 sm:pb-8 overflow-y-auto">
                <div className="bg-white p-2.5 sm:p-5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] w-full max-w-[540px] flex justify-center overflow-hidden">
                  <iframe src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fshrinesolarservices&tabs=timeline&width=500&height=700&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId" 
                          className="w-full h-[500px] sm:h-[700px]" 
                          style={{ border: 'none', overflow: 'hidden' }}
                          scrolling="no" 
                          frameBorder="0" 
                          allowFullScreen={true} 
                          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share">
                  </iframe>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Shop Modal */}
        {isHome && isShopOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setIsShopOpen(false)}>
            <div className="bg-[#a8a8a8] border-4 border-gray-600 rounded-3xl w-full max-w-5xl h-[85vh] sm:h-[75vh] flex flex-col shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setIsShopOpen(false)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-700 hover:text-black hover:bg-gray-300 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold transition-colors z-10"
              >
                ✕
              </button>
              <div className="flex-grow flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-12 p-8 pt-16 sm:p-12 sm:pt-24 w-full overflow-y-auto">
                <button onClick={() => handleNavigation('/solar-panel')} className="w-full max-w-[200px] sm:max-w-none sm:w-56 h-32 sm:h-56 bg-[#909090] border-2 border-gray-500 text-black font-semibold text-xl sm:text-2xl rounded-2xl flex items-center justify-center shadow-lg hover:bg-[#808080] hover:scale-105 transition-all flex-shrink-0">
                  Solar Panel
                </button>
                <button onClick={() => handleNavigation('/battery')} className="w-full max-w-[200px] sm:max-w-none sm:w-56 h-32 sm:h-56 bg-[#909090] border-2 border-gray-500 text-black font-semibold text-xl sm:text-2xl rounded-2xl flex items-center justify-center shadow-lg hover:bg-[#808080] hover:scale-105 transition-all flex-shrink-0">
                  Battery
                </button>
                <button onClick={() => handleNavigation('/accessories')} className="w-full max-w-[200px] sm:max-w-none sm:w-56 h-32 sm:h-56 bg-[#909090] border-2 border-gray-500 text-black font-semibold text-xl sm:text-2xl rounded-2xl flex items-center justify-center shadow-lg hover:bg-[#808080] hover:scale-105 transition-all flex-shrink-0">
                  Accessories
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Inquiry Modal */}
        {isHome && isInquiryOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setIsInquiryOpen(false)}>
            <div className="bg-[#a8a8a8] border-4 border-gray-600 rounded-3xl w-full max-w-5xl h-[85vh] sm:h-[75vh] flex flex-col shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
              {/* X button — absolute top-right */}
              <button
                onClick={() => setIsInquiryOpen(false)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-700 hover:text-black hover:bg-gray-300 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold transition-colors z-10"
              >
                ✕
              </button>
              {/* Title aligned to same line as X button using matching top padding and right padding */}
              <h2 className="text-xl sm:text-2xl font-bold text-black tracking-wider text-center pr-14 sm:pr-20 pl-14 sm:pl-20 flex items-center justify-center h-[58px] sm:h-[72px] flex-shrink-0">Contact Information</h2>
              {/* Cards centered in remaining space */}
              <div className="flex-grow flex flex-col md:flex-row gap-6 sm:gap-12 w-full items-center justify-center px-8 pb-8 sm:px-12 sm:pb-12 overflow-y-auto">
                <a href="https://www.facebook.com/shrinesolarservices" target="_blank" rel="noopener noreferrer" className="w-full max-w-[200px] sm:max-w-none sm:w-56 h-32 sm:h-56 bg-[#909090] border-2 border-gray-500 rounded-2xl flex flex-col items-center justify-center shadow-lg p-4 sm:p-6 hover:bg-[#808080] hover:scale-105 transition-all flex-shrink-0">
                  <span className="text-xl sm:text-2xl font-bold text-black">Facebook</span>
                  <span className="text-sm text-gray-700 mt-2 sm:mt-4 text-center">ShrineSolar</span>
                </a>
                <button onClick={() => navigator.clipboard.writeText('09171842499')} className="w-full max-w-[200px] sm:max-w-none sm:w-56 h-32 sm:h-56 bg-[#909090] border-2 border-gray-500 rounded-2xl flex flex-col items-center justify-center shadow-lg p-4 sm:p-6 hover:bg-[#808080] hover:scale-105 transition-all flex-shrink-0">
                  <span className="text-xl sm:text-2xl font-bold text-black">Mobile No.</span>
                  <span className="text-sm text-gray-700 mt-2 sm:mt-4 text-center">09171842499</span>
                </button>
                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=Shrinesolar2022@gmail.com" target="_blank" rel="noopener noreferrer" className="w-full max-w-[200px] sm:max-w-none sm:w-56 h-32 sm:h-56 bg-[#909090] border-2 border-gray-500 rounded-2xl flex flex-col items-center justify-center shadow-lg p-4 sm:p-6 hover:bg-[#808080] hover:scale-105 transition-all flex-shrink-0">
                  <span className="text-xl sm:text-2xl font-bold text-black">Gmail</span>
                  <span className="text-xs sm:text-sm text-gray-700 mt-2 sm:mt-4 text-center break-all">Shrinesolar2022@gmail.com</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default App
