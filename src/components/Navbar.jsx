import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar({ isShopOpen, setIsShopOpen, isInquiryOpen, setIsInquiryOpen }) {
    const navigate = useNavigate();
    const location = useLocation();

    // Use transparent background on the home page, and a dark semi-transparent background on other pages
    const isHome = location.pathname === '/';
    const bgClass = isHome ? 'bg-transparent' : 'bg-black/80 backdrop-blur-md border-b border-white/10';

    const handleNavigation = (path) => {
        setIsShopOpen(false);
        setIsInquiryOpen(false);
        navigate(path);
    };

    return (
        <nav
            className={`fixed top-0 left-0 w-full z-40 ${bgClass}`}
            style={{ opacity: 1, pointerEvents: 'auto', transition: 'background-color 0.3s ease' }}
        >
            <div className="flex items-center justify-center sm:justify-between w-full" style={{ paddingLeft: '40px', paddingRight: '40px', paddingTop: '20px', paddingBottom: '20px' }}>
                <img 
                    src="/logo.png" 
                    alt="Shrine Solar Logo" 
                    className="hidden sm:block h-9 sm:h-12 w-auto cursor-pointer" 
                    onClick={() => handleNavigation('/')} 
                    style={{ filter: 'drop-shadow(0 0 8px rgba(255,200,0,0.9)) drop-shadow(0 0 16px rgba(255,180,0,0.5))' }} 
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                    <button 
                        onClick={() => handleNavigation('/')} 
                        className="relative animate-fade-in text-white font-bold tracking-wide transition-colors hover:text-gray-200 text-xs sm:text-base group" 
                        style={{ textShadow: '0 2px 10px rgba(0,0,0,1), 0 1px 4px rgba(0,0,0,0.8)', animationDelay: '0.1s' }}
                    >
                        Home
                        <span className={`absolute left-0 -bottom-1 h-[2px] bg-yellow-400 transition-all duration-300 ${!isShopOpen && !isInquiryOpen && location.pathname === '/' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                    </button>
                    <button 
                        onClick={() => { setIsInquiryOpen(false); setIsShopOpen(true); }} 
                        className="relative animate-fade-in text-white font-bold tracking-wide transition-colors hover:text-gray-200 text-xs sm:text-base group" 
                        style={{ textShadow: '0 2px 10px rgba(0,0,0,1), 0 1px 4px rgba(0,0,0,0.8)', animationDelay: '0.2s' }}
                    >
                        Shop
                        <span className={`absolute left-0 -bottom-1 h-[2px] bg-yellow-400 transition-all duration-300 ${isShopOpen ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                    </button>
                    <button 
                        onClick={() => handleNavigation('/my-cart')} 
                        className="relative animate-fade-in text-white font-bold tracking-wide transition-colors hover:text-gray-200 text-xs sm:text-base group" 
                        style={{ textShadow: '0 2px 10px rgba(0,0,0,1), 0 1px 4px rgba(0,0,0,0.8)', animationDelay: '0.3s' }}
                    >
                        My Carts
                        <span className={`absolute left-0 -bottom-1 h-[2px] bg-yellow-400 transition-all duration-300 ${location.pathname === '/my-cart' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                    </button>
                    <button 
                        onClick={() => { setIsShopOpen(false); setIsInquiryOpen(true); }} 
                        className="relative animate-fade-in text-white font-bold tracking-wide transition-colors hover:text-gray-200 text-xs sm:text-base group" 
                        style={{ textShadow: '0 2px 10px rgba(0,0,0,1), 0 1px 4px rgba(0,0,0,0.8)', animationDelay: '0.4s' }}
                    >
                        Inquiry
                        <span className={`absolute left-0 -bottom-1 h-[2px] bg-yellow-400 transition-all duration-300 ${isInquiryOpen ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                    </button>
                </div>
            </div>
        </nav>
    );
}
