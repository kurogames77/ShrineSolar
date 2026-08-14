import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const isHome = location.pathname === '/';

    const [isInquiryOpen, setIsInquiryOpen] = useState(false);
    const [isInquiryClosing, setIsInquiryClosing] = useState(false);
    const [cursorLabel, setCursorLabel] = useState(null);
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const [phoneCopied, setPhoneCopied] = useState(false);

    const handleMouseMove = (e) => {
        setCursorPos({ x: e.clientX, y: e.clientY });
    };

    const closeInquiry = () => { setIsInquiryClosing(true); setTimeout(() => { setIsInquiryOpen(false); setIsInquiryClosing(false); }, 300); };

    useEffect(() => {
        const isAnyOpen = isInquiryOpen;
        if (isAnyOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            // We only clear overflow if it's safe to do so. App.jsx might be managing Facebook modals.
            // But realistically, this is fine because they shouldn't overlap.
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isInquiryOpen]);

    // Transparent on home (hero image shows through), white on all other pages
    const bgClass = isHome
        ? 'bg-transparent'
        : 'bg-white shadow-md';

    // White text on home (over hero image), dark text on other pages
    const textClass = isHome
        ? 'text-white hover:text-gray-200'
        : 'text-gray-800 hover:text-black';

    const textShadow = isHome
        ? { textShadow: '0 2px 10px rgba(0,0,0,1), 0 1px 4px rgba(0,0,0,0.8)' }
        : {};

    const underlineColor = isHome ? 'bg-yellow-400' : 'bg-yellow-500';

    const handleNavigation = (path) => {
        setIsInquiryOpen(false);
        setIsInquiryClosing(false);
        navigate(path);
    };

    return (
        <>
            <nav
                className={`fixed top-0 left-0 w-full z-40 ${bgClass}`}
                style={{ opacity: 1, pointerEvents: 'auto', transition: 'background-color 0.3s ease' }}
            >
                <div className="flex items-center justify-center sm:justify-between w-full" style={{ paddingLeft: '40px', paddingRight: '40px', paddingTop: '12px', paddingBottom: '12px' }}>
                    <img
                        src="/logo.png"
                        alt="Shrine Solar Logo"
                        className="hidden sm:block h-7 sm:h-8 w-auto cursor-pointer"
                        onClick={() => handleNavigation('/')}
                        style={{ filter: isHome ? 'drop-shadow(0 0 8px rgba(255,200,0,0.9)) drop-shadow(0 0 16px rgba(255,180,0,0.5))' : 'none' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                        <button
                            onClick={() => handleNavigation('/')}
                            className={`relative animate-fade-in font-bold tracking-wide transition-colors text-xs sm:text-sm group ${textClass}`}
                            style={{ ...textShadow, animationDelay: '0.1s' }}
                        >
                            Home
                            <span className={`absolute left-0 -bottom-1 h-[2px] ${underlineColor} transition-all duration-300 ${!isInquiryOpen && location.pathname === '/' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                        </button>
                        <button
                            onClick={() => handleNavigation('/shop')}
                            className={`relative animate-fade-in font-bold tracking-wide transition-colors text-xs sm:text-sm group ${textClass}`}
                            style={{ ...textShadow, animationDelay: '0.2s' }}
                        >
                            Shop
                            <span className={`absolute left-0 -bottom-1 h-[2px] ${underlineColor} transition-all duration-300 ${location.pathname === '/shop' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                        </button>
                        <button
                            onClick={() => handleNavigation('/my-cart')}
                            className={`relative animate-fade-in font-bold tracking-wide transition-colors text-xs sm:text-sm group ${textClass}`}
                            style={{ ...textShadow, animationDelay: '0.3s' }}
                        >
                            My Carts
                            <span className={`absolute left-0 -bottom-1 h-[2px] ${underlineColor} transition-all duration-300 ${location.pathname === '/my-cart' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                        </button>
                        <button
                            onClick={() => { setIsInquiryOpen(true); }}
                            className={`relative animate-fade-in font-bold tracking-wide transition-colors text-xs sm:text-sm group ${textClass}`}
                            style={{ ...textShadow, animationDelay: '0.4s' }}
                        >
                            Inquiry
                            <span className={`absolute left-0 -bottom-1 h-[2px] ${underlineColor} transition-all duration-300 ${isInquiryOpen ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                        </button>
                    </div>
                </div>
            </nav>



            {/* Inquiry Modal */}
            {isInquiryOpen && (
                <div className={`fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 ${isInquiryClosing ? 'modal-backdrop-out' : 'modal-backdrop-in'}`} onClick={closeInquiry}>
                    <div className={`border-4 border-yellow-300 rounded-3xl w-full max-w-5xl h-[85vh] sm:h-[75vh] flex flex-col shadow-2xl relative ${isInquiryClosing ? 'modal-panel-out' : 'modal-panel-in'}`} style={{ background: 'linear-gradient(160deg, #FFF9C4 0%, #FFFFFF 40%, #FFFFFF 100%)' }} onClick={(e) => e.stopPropagation()}>
                        <button onClick={closeInquiry} className="absolute top-4 right-4 sm:top-6 sm:right-6 text-yellow-800 hover:text-yellow-900 hover:bg-yellow-200 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold transition-colors z-10">✕</button>
                        <h2 className="text-xl sm:text-2xl font-bold text-yellow-900 tracking-wider text-center pr-14 sm:pr-20 pl-14 sm:pl-20 flex items-center justify-center h-[58px] sm:h-[72px] flex-shrink-0">Contact Information</h2>
                        <div className="flex-grow flex flex-col md:flex-row gap-6 sm:gap-12 w-full items-center justify-center px-8 pb-8 sm:px-12 sm:pb-12 overflow-y-auto">
                            <a href="https://www.facebook.com/shrinesolarservices" target="_blank" rel="noopener noreferrer" className="contact-card-anim animate-slide-up w-full max-w-[200px] sm:max-w-none sm:w-56 h-32 sm:h-56 flex flex-col items-center justify-center shadow p-4 sm:p-6 transition-all flex-shrink-0 bg-white border border-yellow-100 rounded-2xl" style={{ animationDelay: '0.1s' }} onMouseEnter={() => setCursorLabel('Click to see the Facebook Page')} onMouseLeave={() => setCursorLabel(null)} onMouseMove={handleMouseMove}>
                                <img src="/fblogo.png" alt="Facebook" className="relative z-10 w-10 h-10 sm:w-14 sm:h-14 object-contain pointer-events-none mb-1 sm:mb-2" />
                                <span className="relative z-10 text-xl sm:text-2xl font-bold text-yellow-900 pointer-events-none">Facebook</span>
                                <span className="relative z-10 text-sm text-yellow-700 mt-1 sm:mt-2 text-center pointer-events-none">ShrineSolar</span>
                            </a>
                            <button onClick={() => { navigator.clipboard.writeText('09171842499'); setPhoneCopied(true); }} className="contact-card-anim animate-slide-up w-full max-w-[200px] sm:max-w-none sm:w-56 h-32 sm:h-56 flex flex-col items-center justify-center shadow p-4 sm:p-6 transition-all flex-shrink-0 bg-white border border-yellow-100 rounded-2xl" style={{ animationDelay: '0.2s' }} onMouseEnter={() => setCursorLabel('Click to copy to Clipboard')} onMouseLeave={() => setCursorLabel(null)} onMouseMove={handleMouseMove}>
                                <img src="/phonelogo.png" alt="Phone" className="relative z-10 w-10 h-10 sm:w-14 sm:h-14 object-contain pointer-events-none mb-1 sm:mb-2" />
                                <span className="relative z-10 text-xl sm:text-2xl font-bold text-yellow-900 pointer-events-none">Mobile No.</span>
                                <span className="relative z-10 text-sm text-yellow-700 mt-1 sm:mt-2 text-center pointer-events-none">09171842499</span>
                                {phoneCopied && (
                                    <span className="relative z-10 text-xs text-green-600 font-bold mt-1 text-center pointer-events-none animate-fade-in">Copied to Clipboard</span>
                                )}
                            </button>
                            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=Shrinesolar2022@gmail.com" target="_blank" rel="noopener noreferrer" className="contact-card-anim animate-slide-up w-full max-w-[200px] sm:max-w-none sm:w-56 h-32 sm:h-56 flex flex-col items-center justify-center shadow p-4 sm:p-6 transition-all flex-shrink-0 bg-white border border-yellow-100 rounded-2xl" style={{ animationDelay: '0.3s' }} onMouseEnter={() => setCursorLabel('Click to message us in Gmail')} onMouseLeave={() => setCursorLabel(null)} onMouseMove={handleMouseMove}>
                                <img src="/gmaillogo.png" alt="Gmail" className="relative z-10 w-10 h-10 sm:w-14 sm:h-14 object-contain pointer-events-none mb-1 sm:mb-2" />
                                <span className="relative z-10 text-xl sm:text-2xl font-bold text-yellow-900 pointer-events-none">Gmail</span>
                                <span className="relative z-10 text-xs sm:text-sm text-yellow-700 mt-1 sm:mt-2 text-center break-all pointer-events-none">Shrinesolar2022@gmail.com</span>
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Global Custom Cursor Label */}
            {cursorLabel && (
                <div
                    className="fixed pointer-events-none z-[9999] bg-yellow-100 border-2 border-yellow-400 text-yellow-900 px-3 py-1.5 rounded-full text-sm font-semibold shadow-xl whitespace-nowrap transition-opacity duration-200"
                    style={{
                        left: cursorPos.x + 15,
                        top: cursorPos.y + 15
                    }}
                >
                    {cursorLabel}
                </div>
            )}
        </>
    );
}
