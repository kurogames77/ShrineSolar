import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar({ isShopOpen, setIsShopOpen, isInquiryOpen, setIsInquiryOpen }) {
    const navigate = useNavigate();
    const location = useLocation();

    const isHome = location.pathname === '/';

    // Transparent on home (hero image shows through), white on all other pages
    const bgClass = isHome
        ? 'bg-transparent'
        : 'bg-white shadow-md border-b border-gray-200';

    // White text on home (over hero image), dark text on other pages
    const textClass = isHome
        ? 'text-white hover:text-gray-200'
        : 'text-gray-800 hover:text-black';

    const textShadow = isHome
        ? { textShadow: '0 2px 10px rgba(0,0,0,1), 0 1px 4px rgba(0,0,0,0.8)' }
        : {};

    const underlineColor = isHome ? 'bg-yellow-400' : 'bg-yellow-500';

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
            <div className="flex items-center justify-center sm:justify-between w-full" style={{ paddingLeft: '40px', paddingRight: '40px', paddingTop: '12px', paddingBottom: '12px' }}>
                <img
                    src="/logo.png"
                    alt="Shrine Solar Logo"
                    className="hidden sm:block h-7 sm:h-8 w-auto cursor-pointer"
                    onClick={() => handleNavigation('/')}
                    style={{ filter: 'drop-shadow(0 0 8px rgba(255,200,0,0.9)) drop-shadow(0 0 16px rgba(255,180,0,0.5))' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                    <button
                        onClick={() => handleNavigation('/')}
                        className={`relative animate-fade-in font-bold tracking-wide transition-colors text-xs sm:text-sm group ${textClass}`}
                        style={{ ...textShadow, animationDelay: '0.1s' }}
                    >
                        Home
                        <span className={`absolute left-0 -bottom-1 h-[2px] ${underlineColor} transition-all duration-300 ${!isShopOpen && !isInquiryOpen && location.pathname === '/' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                    </button>
                    <button
                        onClick={() => { setIsInquiryOpen(false); setIsShopOpen(true); }}
                        className={`relative animate-fade-in font-bold tracking-wide transition-colors text-xs sm:text-sm group ${textClass}`}
                        style={{ ...textShadow, animationDelay: '0.2s' }}
                    >
                        Shop
                        <span className={`absolute left-0 -bottom-1 h-[2px] ${underlineColor} transition-all duration-300 ${isShopOpen ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
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
                        onClick={() => { setIsShopOpen(false); setIsInquiryOpen(true); }}
                        className={`relative animate-fade-in font-bold tracking-wide transition-colors text-xs sm:text-sm group ${textClass}`}
                        style={{ ...textShadow, animationDelay: '0.4s' }}
                    >
                        Inquiry
                        <span className={`absolute left-0 -bottom-1 h-[2px] ${underlineColor} transition-all duration-300 ${isInquiryOpen ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                    </button>
                </div>
            </div>
        </nav>
    );
}
