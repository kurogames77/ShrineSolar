import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import SolarPanel from './pages/SolarPanel'
import Battery from './pages/Battery'
import Accessories from './pages/Accessories'
import MyCart from './pages/MyCart'
import Shop from './pages/Shop'
import CinematicIntro from './pages/CinematicIntro'
import ScrollAnimation from './pages/ScrollAnimation'
import Navbar from './components/Navbar'
import './App.css'

function App() {
  // Only show intro once per session (so navigating back to "/" doesn't replay it)
  const [showIntro, setShowIntro] = useState(() => {
    if (sessionStorage.getItem('shrine_intro_seen')) return false;
    return true;
  });
  const [isFacebookOpen, setIsFacebookOpen] = useState(false);
  const [isFacebookClosing, setIsFacebookClosing] = useState(false);

  const closeFacebook = () => { setIsFacebookClosing(true); setTimeout(() => { setIsFacebookOpen(false); setIsFacebookClosing(false); }, 300); };
  const navigate = useNavigate();
  const location = useLocation();

  const handleIntroComplete = () => {
    sessionStorage.setItem('shrine_intro_seen', '1');
    setShowIntro(false);
  };

  const handleNavigation = (path) => {
    setIsFacebookOpen(false); setIsFacebookClosing(false);
    navigate(path);
  };

  const isHome = location.pathname === '/';

  const [scrollY, setScrollY] = useState(0);
  const [showFacebook, setShowFacebook] = useState(false);
  const [heroExiting, setHeroExiting] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top on page refresh
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  // Reset Facebook view when leaving home
  useEffect(() => {
    if (!isHome) { setShowFacebook(false); setHeroExiting(false); }
  }, [isHome]);

  // Any keypress triggers the Facebook transition (only when near top of page)
  useEffect(() => {
    if (!isHome || showFacebook || heroExiting) return;
    const handleKey = (e) => {
      if (['Tab', 'Escape', 'Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) return;
      // Don't trigger if the user has scrolled down into the cinematic sequence
      if (window.scrollY > 200) return;
      doTriggerFacebook();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isHome, showFacebook, heroExiting]);

  // Lock body scroll when Facebook embed is open
  useEffect(() => {
    const isAnyOpen = isFacebookOpen || showFacebook;
    document.body.style.overflow = isAnyOpen ? 'hidden' : '';
    // Let Navbar handle its own modals, but make sure they don't fight.
    // If Facebook is closed, we clear the overflow unless Navbar is setting it.
    // Cleanest way is to let Navbar clean up its own, and App clean up its own.
  }, [isFacebookOpen, showFacebook]);

  const heroOpacity = Math.max(0, 1 - scrollY / 400);

  const doTriggerFacebook = () => {
    if (showFacebook || heroExiting) return;
    window.scrollTo({ top: 0 });
    setHeroExiting(true);
    setTimeout(() => { setShowFacebook(true); setHeroExiting(false); }, 600);
  };

  return (
    <>
      {/* Cinematic intro overlay — homepage renders underneath */}
      {showIntro && isHome && (
        <div className="fixed inset-0 z-[9999]" style={{ width: '100%', height: '100vh' }}>
          <CinematicIntro onComplete={handleIntroComplete} />
        </div>
      )}

      <div className={`min-h-screen ${location.pathname === '/my-cart' ? 'bg-[#eef2f7]' : 'bg-[#a8a8a8]'} flex flex-col`}>
        {/* Global Navbar */}
        <Navbar />

        {/* Mobile-only icon below navbar — hidden when Facebook embed is showing */}
        {isHome && !showFacebook && (
          <div className="block sm:hidden fixed z-40 w-full flex justify-center" style={{ top: '90px', opacity: heroOpacity, transition: 'opacity 0.3s ease', pointerEvents: heroOpacity < 0.1 ? 'none' : 'auto' }}>
            <img src="/apple-touch-icon.png" alt="Shrine Solar Icon" style={{ width: '130px', height: '130px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.8))' }} />
          </div>
        )}

        {/* Hero Overlay */}
        {isHome && (
          <div
            className="fixed inset-0 z-30 flex flex-col justify-center transition-opacity duration-300"
            style={{
              opacity: (showFacebook || heroExiting) ? 1 : heroOpacity,
              pointerEvents: (!showFacebook && !heroExiting && heroOpacity < 0.1) ? 'none' : 'auto',
              background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.1) 100%)',
              cursor: !showFacebook && !heroExiting ? 'pointer' : 'default',
            }}
            onClick={doTriggerFacebook}
          >
            {/* Default hero content */}
            {!showFacebook && (
              <div className="w-full px-6 sm:px-16 lg:px-24 flex flex-col items-center text-center">
                <h1
                  className={`${heroExiting ? 'hero-text-exit' : (!showIntro ? 'animate-slide-up' : '')} text-white text-3xl sm:text-5xl lg:text-[4rem] font-bold leading-snug sm:leading-tight max-w-4xl`}
                  style={{ fontFamily: "'Playfair Display', serif", textShadow: '0 2px 30px rgba(0,0,0,0.5)' }}
                >
                  Empowering homes and businesses to cut electricity cost with solar
                </h1>
                <p
                  className={`${heroExiting ? 'hero-sub-exit' : (!showIntro ? 'animate-slide-up' : '')} text-gray-300 text-xs sm:text-base lg:text-lg mt-3 sm:mt-5 max-w-2xl font-light`}
                  style={{ textShadow: '0 1px 10px rgba(0,0,0,0.7)', animationDelay: '0.2s' }}
                >
                  #1 Panel & Electrical Installations and Maintenance Services in Dapitan City
                </p>
                <div className={`mt-3 sm:mt-4 ${heroExiting ? 'hero-sub-exit' : (!showIntro ? 'animate-slide-up' : '')}`} style={{ animationDelay: '0.4s' }}>
                  <p className="text-white/80 text-sm sm:text-base font-light tracking-widest animate-pulse" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.8)', letterSpacing: '0.15em' }}>
                    Press any key to see Facebook Posts
                  </p>
                </div>
              </div>
            )}
            {/* Scroll to Begin — absolute bottom center, hidden when Facebook embed shows */}
            {!showFacebook && (
              <div className={`absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce ${heroExiting ? 'hero-sub-exit' : ''}`}>
                <span className="text-white/70 text-[10px] sm:text-xs font-medium tracking-[0.25em] uppercase" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}>Scroll to Begin</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            )}
            {/* Facebook embed — fades in after hero exits */}
            {showFacebook && (
              <div className="w-full flex flex-col items-center justify-center px-4 facebook-enter" onClick={(e) => e.stopPropagation()}>
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-4 sm:p-6 w-full max-w-lg overflow-y-auto relative" style={{ maxHeight: '75vh' }}>
                  {/* X button to close and return to hero text */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowFacebook(false); setHeroExiting(false); }}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-gray-200 hover:bg-gray-300 text-gray-700 hover:text-black w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold transition-colors z-10"
                  >
                    ✕
                  </button>
                  <h2 className="text-xl font-bold text-black text-center mb-4 tracking-wide pr-8">Facebook Post</h2>
                  <div className="flex justify-center w-full">
                    <iframe
                      src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fshrinesolarservices&tabs=timeline&width=340&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId"
                      className="w-full sm:hidden"
                      style={{ border: 'none', overflow: 'hidden', height: '500px' }}
                      scrolling="no"
                      frameBorder="0"
                      allowFullScreen={true}
                      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    />
                    <iframe
                      src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fshrinesolarservices&tabs=timeline&width=500&height=700&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId"
                      className="hidden sm:block w-full"
                      style={{ border: 'none', overflow: 'hidden', height: '500px' }}
                      scrolling="no"
                      frameBorder="0"
                      allowFullScreen={true}
                      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-grow flex flex-col w-full" style={{ paddingTop: !isHome ? '64px' : '0' }}>
          <Routes>
            <Route path="/" element={<ScrollAnimation />} />
            <Route path="/solar-panel" element={<SolarPanel />} />
            <Route path="/battery" element={<Battery />} />
            <Route path="/accessories" element={<Accessories />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/my-cart" element={<MyCart />} />
          </Routes>
        </main>
        {/* Facebook Modal */}
        {isHome && isFacebookOpen && (
          <div className={`fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 ${isFacebookClosing ? 'modal-backdrop-out' : 'modal-backdrop-in'}`} onClick={closeFacebook}>
            <div className={`bg-[#a8a8a8] border-4 border-gray-600 rounded-3xl w-full max-w-2xl h-[85vh] sm:h-[75vh] flex flex-col shadow-2xl relative ${isFacebookClosing ? 'modal-panel-out' : 'modal-panel-in'}`} onClick={(e) => e.stopPropagation()}>
              <button
                onClick={closeFacebook}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-700 hover:text-black hover:bg-gray-300 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold transition-colors z-10"
              >
                ✕
              </button>
              <h2 className="text-xl sm:text-2xl font-bold text-black tracking-wider text-center pr-14 sm:pr-20 pl-14 sm:pl-20 flex items-center justify-center h-[58px] sm:h-[72px] flex-shrink-0">Facebook Post</h2>
              <div className="flex-grow flex flex-col w-full items-center justify-start px-4 pb-4 sm:px-8 sm:pb-8 overflow-y-auto">
                <div className="bg-white p-2.5 sm:p-5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] w-full max-w-[540px] flex justify-center overflow-hidden">
                  <iframe src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fshrinesolarservices&tabs=timeline&width=340&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId"
                    className="w-full h-[500px] sm:hidden"
                    style={{ border: 'none', overflow: 'hidden' }}
                    scrolling="no"
                    frameBorder="0"
                    allowFullScreen={true}
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share">
                  </iframe>
                  <iframe src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fshrinesolarservices&tabs=timeline&width=500&height=700&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId"
                    className="hidden sm:block w-full h-[700px]"
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
      </div>
    </>
  )
}

export default App
