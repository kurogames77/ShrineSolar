import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { supabase } from '../supabaseClient';
import { Turnstile } from '@marsidev/react-turnstile';
import zamboangaData from '../data/zamboanga.json';
export default function MyCart() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [past, setPast] = useState([]);
    const [future, setFuture] = useState([]);
    const [turnstileToken, setTurnstileToken] = useState(null);
    const [formData, setFormData] = useState({
        fullname: '',
        contactNumber: '',
        gmail: '',
    });
    
    const [selectedCityCode, setSelectedCityCode] = useState('');
    const [selectedCityName, setSelectedCityName] = useState('');
    const [selectedBarangayName, setSelectedBarangayName] = useState('');
    const [isCityOpen, setIsCityOpen] = useState(false);
    const [isBrgyOpen, setIsBrgyOpen] = useState(false);
    
    const cities = zamboangaData.cities.sort((a, b) => a.name.localeCompare(b.name));
    const barangays = selectedCityCode && zamboangaData.barangays[selectedCityCode]
        ? [...zamboangaData.barangays[selectedCityCode]].sort((a, b) => a.name.localeCompare(b.name))
        : [];

    /* ─── Animation: track page-loaded state ─── */
    const [pageLoaded, setPageLoaded] = useState(false);
    const observerRef = useRef(null);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('shrine_cart') || '[]');
        setCartItems(saved);
    }, []);

    /* ─── Trigger page entrance after mount ─── */
    useEffect(() => {
        const t = requestAnimationFrame(() => setPageLoaded(true));
        return () => cancelAnimationFrame(t);
    }, []);

    /* ─── Scroll-reveal observer for cart items ─── */
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        requestAnimationFrame(() => {
                            entry.target.classList.add('cart-visible');
                        });
                    } else {
                        entry.target.classList.remove('cart-visible');
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
        );
        observerRef.current = observer;

        const timer = setTimeout(() => {
            document.querySelectorAll('.cart-scroll-reveal').forEach((el) => {
                observer.observe(el);
            });
        }, 80);

        return () => {
            clearTimeout(timer);
            observer.disconnect();
        };
    }, [cartItems]);

    const handleRemoveItem = (index) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "Do you want to remove this item from the cart?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, remove it!'
        }).then((result) => {
            if (result.isConfirmed) {
                setPast(prev => [...prev, cartItems]);
                setFuture([]);
                
                const updated = cartItems.filter((_, i) => i !== index);
                setCartItems(updated);
                localStorage.setItem('shrine_cart', JSON.stringify(updated));
                
                Swal.fire({
                    icon: 'info',
                    title: 'Removed',
                    text: 'Item removed from cart.',
                    confirmButtonColor: '#f59e0b',
                    timer: 1500,
                    timerProgressBar: true,
                });
            }
        });
    };

    const undo = () => {
        if (past.length === 0) return;
        const previous = past[past.length - 1];
        setPast(prev => prev.slice(0, prev.length - 1));
        setFuture(prev => [cartItems, ...prev]);
        setCartItems(previous);
        localStorage.setItem('shrine_cart', JSON.stringify(previous));
    };

    const redo = () => {
        if (future.length === 0) return;
        const next = future[0];
        setFuture(prev => prev.slice(1));
        setPast(prev => [...prev, cartItems]);
        setCartItems(next);
        localStorage.setItem('shrine_cart', JSON.stringify(next));
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleProceed = async () => {
        if (!formData.fullname || !formData.contactNumber || !selectedCityName || !selectedBarangayName) {
            Swal.fire({
                icon: 'error',
                title: 'Incomplete',
                text: 'Please fill in your Fullname, Contact Number, and select your City and Barangay.',
                confirmButtonColor: '#f59e0b',
            });
            return;
        }
        if (!turnstileToken) {
            Swal.fire({
                icon: 'error',
                title: 'Captcha Required',
                text: 'Please complete the Cloudflare captcha before proceeding.',
                confirmButtonColor: '#f59e0b',
            });
            return;
        }
        if (cartItems.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Empty Cart',
                text: 'Your cart is empty. Please add items before proceeding.',
                confirmButtonColor: '#f59e0b',
            });
            return;
        }

        // Split fullname into first_name and last_name
        const nameParts = formData.fullname.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Unknown';

        // Provide a fallback email since your schema requires a UNIQUE, NOT NULL email
        const email = formData.gmail ? formData.gmail : `${Date.now()}@no-email.com`;

        Swal.fire({
            title: 'Processing...',
            text: 'Saving your order.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            // Generate a UUID for the customer so we don't need to SELECT it back
            const customerId = crypto.randomUUID();

            // 1. Insert Customer
            const { error: customerError } = await supabase
                .from('customers')
                .insert({
                    id: customerId,
                    first_name: firstName,
                    last_name: lastName,
                    email: email,
                    phone: formData.contactNumber,
                    address_line1: [selectedBarangayName, selectedCityName].filter(Boolean).join(', ')
                });

            if (customerError) throw customerError;

            // 2. Insert one order per cart item
            for (const item of cartItems) {
                const productDetails = `${item.name} (x${item.quantity})`;
                const qty = parseInt(item.quantity) || 1;

                const { error: orderError } = await supabase
                    .from('orders')
                    .insert({
                        id: crypto.randomUUID(),
                        customer_id: customerId,
                        order_category: item.category || 'Website Cart',
                        product_details: productDetails,
                        size_or_qty: qty,
                        total_amount: (parseFloat(item.price) || 0) * qty
                    });

                if (orderError) throw orderError;
            }

            // 3. Insert Activity Log
            const allProductDetails = cartItems.map(item => `${item.name} (x${item.quantity})`).join(', ');
            const { error: logError } = await supabase
                .from('activity_log')
                .insert({
                    action: 'Placed New Order',
                    entity_type: 'Order',
                    entity_name: `Order by ${formData.fullname}`,
                    details: `Products: ${allProductDetails} (${cartItems.length} separate order(s))`
                    // user_id is omitted because this is a public user
                });

            if (logError) throw logError;

            // Clear Cart
            localStorage.removeItem('shrine_cart');
            setCartItems([]);

            // Success & Redirect
            Swal.fire({
                icon: 'success',
                title: 'Order Placed!',
                text: 'Redirecting to Facebook...',
                showConfirmButton: false,
                timer: 2000
            });

            setTimeout(() => {
                // REPLACE THIS LINK with your actual Facebook page or Messenger link!
                window.location.href = 'https://www.facebook.com'; 
            }, 2000);

        } catch (error) {
            console.error('Supabase Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error Saving Order',
                text: 'Please make sure your Supabase RLS policies allow public inserts. See console for details.',
                confirmButtonColor: '#f59e0b',
            });
        }
    };

    // Group cart items by category
    const grouped = cartItems.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {});

    return (
        <div className="w-full min-h-screen bg-[#eef2f7] flex flex-col items-center pt-[88px] sm:pt-[96px]">
            {/* ═══ Cinematic Animation Styles ═══ */}
            <style>{`
                /* ── Page entrance: panels slide up ── */
                @keyframes cartPanelIn {
                    from { opacity: 0; transform: translateY(50px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .cart-panel-enter {
                    opacity: 0;
                    transform: translateY(50px);
                }
                .cart-panel-enter.cart-loaded {
                    animation: cartPanelIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                }

                /* ── Header entrance ── */
                @keyframes cartHeaderIn {
                    from { opacity: 0; transform: translateY(-30px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .cart-header-enter {
                    opacity: 0;
                    transform: translateY(-30px);
                }
                .cart-header-enter.cart-loaded {
                    animation: cartHeaderIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                }

                /* ── Cart item scroll reveal ── */
                .cart-scroll-reveal {
                    opacity: 0;
                    transform: translateX(-30px);
                    will-change: opacity, transform;
                }
                .cart-scroll-reveal.cart-visible {
                    opacity: 1;
                    transform: none;
                    animation: cartItemSlideIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) backwards;
                }
                @keyframes cartItemSlideIn {
                    from { opacity: 0; transform: translateX(-30px); }
                }

                /* ── Cart item row hover ── */
                .cart-item-row {
                    transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
                                box-shadow 0.3s ease,
                                background-color 0.3s ease;
                    border-radius: 12px;
                }
                .cart-item-row:hover {
                    transform: translateX(4px);
                    background-color: rgba(245, 158, 11, 0.04);
                    box-shadow: 0 4px 16px rgba(0,0,0,0.06);
                }

                /* ── Category heading reveal ── */
                .cart-cat-reveal {
                    opacity: 0;
                    transform: translateY(20px);
                }
                .cart-cat-reveal.cart-visible {
                    opacity: 1;
                    transform: none;
                    animation: cartCatIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) backwards;
                }
                @keyframes cartCatIn {
                    from { opacity: 0; transform: translateY(20px); }
                }

                /* ── Form input stagger ── */
                @keyframes cartFormFieldIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .cart-form-field {
                    opacity: 0;
                    transform: translateY(20px);
                }
                .cart-form-field.cart-loaded {
                    animation: cartFormFieldIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
                }

                /* ── Totals row reveal ── */
                @keyframes cartTotalsIn {
                    from { opacity: 0; transform: translateY(15px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .cart-totals-reveal {
                    opacity: 0;
                    transform: translateY(15px);
                }
                .cart-totals-reveal.cart-visible {
                    animation: cartTotalsIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;
                }

                /* ── Remove button pulse on hover ── */
                .cart-remove-btn {
                    transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
                                box-shadow 0.25s ease;
                }
                .cart-remove-btn:hover {
                    transform: scale(1.1);
                    box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
                }

                /* ── Proceed button shimmer ── */
                @keyframes cartShimmer {
                    0%   { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                .cart-proceed-shimmer {
                    position: relative;
                    overflow: hidden;
                }
                .cart-proceed-shimmer::after {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: linear-gradient(
                        90deg,
                        transparent 0%,
                        rgba(255,255,255,0.15) 50%,
                        transparent 100%
                    );
                    background-size: 200% 100%;
                    animation: cartShimmer 3s ease-in-out infinite;
                    pointer-events: none;
                    border-radius: inherit;
                }

                /* ── Empty cart animation ── */
                @keyframes cartEmptyBounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                .cart-empty-icon {
                    animation: cartEmptyBounce 2.5s cubic-bezier(0.22, 1, 0.36, 1) infinite;
                }

                /* ── Undo/Redo button hover ── */
                .cart-undo-btn {
                    transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1),
                                background-color 0.2s ease;
                }
                .cart-undo-btn:not(:disabled):hover {
                    transform: scale(1.15);
                }
            `}</style>

            {/* Header */}
            <header className={`cart-header-enter ${pageLoaded ? 'cart-loaded' : ''} w-full max-w-7xl flex justify-center items-center py-3 sm:py-4 px-4 sm:px-8 relative`} style={{ paddingTop: '12px' }}>
                {/* Invisible spacer to preserve header height */}
                <div className="flex items-center gap-3 invisible" aria-hidden="true">
                    <div className="w-8 h-8 sm:w-10 sm:h-10" />
                    <div className="text-3xl sm:text-5xl font-bold tracking-wider">My Cart</div>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="absolute left-4 sm:left-8 text-[#64748b] hover:text-[#1a2332] border-2 border-[#cbd5e1] hover:border-[#94a3b8] hover:bg-white/60 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors"
                    title="Go Back"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                </button>
            </header>

            {/* Main Content */}
            <div className="flex-grow w-full max-w-7xl px-6 sm:px-10 pb-8 pt-6 sm:pt-10 flex flex-col lg:flex-row gap-6 sm:gap-10 justify-center items-start">
                {/* Left: Cart Items */}
                <div
                    className={`cart-panel-enter ${pageLoaded ? 'cart-loaded' : ''} w-full mx-auto lg:mx-0 max-w-[550px] bg-white border border-[#e2e8f0] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-y-auto max-h-[60vh] lg:max-h-[70vh]`}
                    style={{ padding: '28px 32px', animationDelay: '0.1s' }}
                >
                    <div className="flex items-center justify-between mb-6 sm:mb-8 w-full">
                        <h2 className="text-xl sm:text-2xl font-bold text-[#1a2332] m-0">Cart Items</h2>
                        <div className="flex gap-2">
                            <button onClick={undo} disabled={past.length === 0} className="cart-undo-btn p-1.5 sm:p-2 text-[#1a2332] hover:bg-[#eef2f7] rounded-lg disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-default" title="Undo">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                                </svg>
                            </button>
                            <button onClick={redo} disabled={future.length === 0} className="cart-undo-btn p-1.5 sm:p-2 text-[#1a2332] hover:bg-[#eef2f7] rounded-lg disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-default" title="Redo">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    {cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-[#94a3b8]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="cart-empty-icon w-16 h-16 text-[#cbd5e1] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                            </svg>
                            <p className="text-lg font-medium">Your cart is empty</p>
                        </div>
                    ) : (
                        Object.entries(grouped).map(([category, items]) => (
                            <div key={category} className="mb-5 sm:mb-7">
                                <h3 className="cart-scroll-reveal cart-cat-reveal text-lg sm:text-xl font-semibold text-[#1a2332] mb-3 sm:mb-4">{category}</h3>
                                <div className="flex flex-col gap-2.5 sm:gap-3">
                                    {items.map((item, idx) => {
                                        const globalIndex = cartItems.indexOf(item);
                                        return (
                                            <div
                                                key={idx}
                                                className="cart-scroll-reveal cart-item-row flex items-center gap-3 sm:gap-4"
                                                style={{ animationDelay: `${idx * 80}ms` }}
                                            >
                                                {/* Product Image */}
                                                <img 
                                                    src={item.image || "/apple-touch-icon.png"} 
                                                    alt={item.name} 
                                                    className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-xl shadow-sm border border-[#e2e8f0] flex-shrink-0 bg-white"
                                                />
                                                {/* Product Details Box */}
                                                <div className="flex-1 min-w-0 p-3 sm:p-4">
                                                    <p className="font-semibold text-[#1a2332] text-sm sm:text-base truncate">
                                                        {item.name} <span className="text-[#64748b] font-normal ml-2">x{item.quantity}</span>
                                                    </p>
                                                    <p className="text-[#f59e0b] font-medium text-xs sm:text-sm mt-0.5">
                                                        ₱{(item.price || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })} x {item.quantity || 1} = ₱{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveItem(globalIndex)}
                                                    className="cart-remove-btn w-10 h-10 sm:w-12 sm:h-12 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
                                                    title="Remove"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                    </svg>
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}

                    {/* Totals Row */}
                    {cartItems.length > 0 && (
                        <div className="cart-scroll-reveal cart-totals-reveal mt-8 flex items-center justify-between">
                            <span className="text-sm sm:text-base text-[#64748b] font-medium">
                                Total ({cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)} item{cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0) !== 1 ? 's' : ''}):
                            </span>
                            <span className="text-base sm:text-lg font-bold text-[#f59e0b]">
                                ₱{cartItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    )}
                </div>

                {/* Right: Customer Info Form */}
                <div
                    className={`cart-panel-enter ${pageLoaded ? 'cart-loaded' : ''} w-full mx-auto lg:mx-0 max-w-[550px] bg-white border border-[#e2e8f0] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-col items-start`}
                    style={{ padding: '28px 32px', animationDelay: '0.25s' }}
                >
                    <h2 className="text-xl sm:text-2xl font-bold text-[#1a2332] mb-6 sm:mb-8">Customer Information</h2>
                    <div className="flex flex-col gap-6 w-full">
                        <div className={`cart-form-field ${pageLoaded ? 'cart-loaded' : ''} mycart-input-group`} style={{ animationDelay: '0.35s' }}>
                            <input
                                required
                                type="text"
                                name="fullname"
                                autoComplete="off"
                                placeholder=" "
                                value={formData.fullname}
                                onChange={handleInputChange}
                                className="mycart-input"
                            />
                            <label className="mycart-user-label">Fullname</label>
                        </div>
                        <div className={`cart-form-field ${pageLoaded ? 'cart-loaded' : ''} mycart-input-group`} style={{ animationDelay: '0.45s' }}>
                            <input
                                required
                                type="text"
                                name="contactNumber"
                                autoComplete="off"
                                placeholder=" "
                                value={formData.contactNumber}
                                onChange={handleInputChange}
                                className="mycart-input"
                            />
                            <label className="mycart-user-label">Contact Number</label>
                        </div>
                        <div className={`cart-form-field ${pageLoaded ? 'cart-loaded' : ''} grid grid-cols-1 sm:grid-cols-2 gap-4`} style={{ animationDelay: '0.55s' }}>
                            <div className="mycart-input-group relative">
                                <div 
                                    className="mycart-input bg-white flex items-center justify-between cursor-pointer"
                                    onClick={() => { setIsCityOpen(!isCityOpen); setIsBrgyOpen(false); }}
                                >
                                    <span>{selectedCityName || ' '}</span>
                                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${isCityOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                                <label className="mycart-user-label pointer-events-none" style={{ top: selectedCityName ? '-0.5rem' : '1rem', fontSize: selectedCityName ? '0.85rem' : '1rem', color: selectedCityName ? '#f59e0b' : '#9ca3af' }}>City / Municipality</label>
                                
                                {isCityOpen && (
                                    <>
                                        <div className="fixed inset-0 z-[9998]" onClick={() => setIsCityOpen(false)}></div>
                                        <ul className="absolute z-[9999] top-[calc(100%+4px)] left-0 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto py-1">
                                            {cities.map((city) => (
                                                <li 
                                                    key={city.code} 
                                                    className="px-4 py-2 hover:bg-yellow-50 cursor-pointer text-gray-700"
                                                    onClick={() => {
                                                        setSelectedCityCode(city.code);
                                                        setSelectedCityName(city.name);
                                                        setSelectedBarangayName('');
                                                        setIsCityOpen(false);
                                                    }}
                                                >
                                                    {city.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>
                            
                            <div className="mycart-input-group relative">
                                <div 
                                    className={`mycart-input flex items-center justify-between ${!selectedCityCode ? 'bg-gray-50 cursor-not-allowed' : 'bg-white cursor-pointer'}`}
                                    onClick={() => {
                                        if (selectedCityCode) {
                                            setIsBrgyOpen(!isBrgyOpen);
                                            setIsCityOpen(false);
                                        }
                                    }}
                                >
                                    <span>{selectedBarangayName || ' '}</span>
                                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${isBrgyOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                                <label className="mycart-user-label pointer-events-none" style={{ top: selectedBarangayName ? '-0.5rem' : '1rem', fontSize: selectedBarangayName ? '0.85rem' : '1rem', color: selectedBarangayName ? '#f59e0b' : '#9ca3af' }}>Barangay</label>
                                
                                {isBrgyOpen && selectedCityCode && (
                                    <>
                                        <div className="fixed inset-0 z-[9998]" onClick={() => setIsBrgyOpen(false)}></div>
                                        <ul className="absolute z-[9999] top-[calc(100%+4px)] left-0 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto py-1">
                                            {barangays.map((brgy) => (
                                                <li 
                                                    key={brgy.name} 
                                                    className="px-4 py-2 hover:bg-yellow-50 cursor-pointer text-gray-700"
                                                    onClick={() => {
                                                        setSelectedBarangayName(brgy.name);
                                                        setIsBrgyOpen(false);
                                                    }}
                                                >
                                                    {brgy.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className={`cart-form-field ${pageLoaded ? 'cart-loaded' : ''} mycart-input-group`} style={{ animationDelay: '0.65s' }}>
                            <input
                                type="email"
                                name="gmail"
                                autoComplete="off"
                                placeholder=" "
                                value={formData.gmail}
                                onChange={handleInputChange}
                                className="mycart-input"
                            />
                            <label className="mycart-user-label">Gmail (Optional)</label>
                        </div>
                    </div>
                    {/* Cloudflare Turnstile */}
                    <div className="mt-8 mb-8 min-h-[100px] flex items-center justify-center w-full">
                        <Turnstile 
                            siteKey="0x4AAAAAAD6EPzOFjE9_pvVF" 
                            onSuccess={(token) => setTurnstileToken(token)}
                            options={{ theme: 'light' }}
                        />
                    </div>
                    {/* Proceed Button */}
                    <button
                        onClick={handleProceed}
                        className="cart-proceed-shimmer fb-button type1"
                    >
                        <span className="fb-btn-txt">Proceed to Facebook</span>
                    </button>
                </div>
            </div>

            {/* ── Footer ── */}
            <footer
                style={{
                    position: 'relative',
                    width: '100%',
                    zIndex: 5,
                    background: '#ffffff',
                    borderTop: '1px solid rgba(255, 215, 0, 0.2)',
                    marginTop: '48px',
                }}
            >
                {/* Gold accent line at top */}
                <div style={{ width: '100%', height: '2px', background: 'linear-gradient(90deg, transparent 0%, #FFD700 50%, transparent 100%)' }} />

                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '48px 40px 24px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '40px',
                    justifyContent: 'space-between',
                }}>
                    {/* Column 1: Logo & Description */}
                    <div style={{ flex: '1 1 280px', minWidth: '250px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <img src="/apple-touch-icon.png" alt="Shrine Solar" style={{ width: '50px', height: '50px', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))' }} />
                            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 900, color: '#111111' }}>SHRINE SOLAR</span>
                        </div>
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', lineHeight: 1.7, color: 'rgba(0,0,0,0.65)', maxWidth: '300px' }}>
                            Empowering homes and businesses in Dapitan City with reliable, affordable solar energy solutions. Your trusted partner for panel installation and electrical maintenance.
                        </p>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div style={{ flex: '0 1 160px' }}>
                        <h4 style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', fontWeight: 800, color: '#111111', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Quick Links</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <li><span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'rgba(0,0,0,0.65)', cursor: 'pointer', transition: 'color 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.color = '#B8860B'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(0,0,0,0.65)'} onClick={() => navigate('/')}>Home</span></li>
                            <li><span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'rgba(0,0,0,0.65)', cursor: 'pointer', transition: 'color 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.color = '#B8860B'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(0,0,0,0.65)'} onClick={() => { Array.from(document.querySelectorAll('nav button')).find(b => b.textContent.includes('Shop'))?.click(); }}>Shop</span></li>
                            <li><span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'rgba(0,0,0,0.65)', cursor: 'pointer', transition: 'color 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.color = '#B8860B'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(0,0,0,0.65)'} onClick={() => navigate('/my-cart')}>My Carts</span></li>
                            <li><span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'rgba(0,0,0,0.65)', cursor: 'pointer', transition: 'color 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.color = '#B8860B'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(0,0,0,0.65)'} onClick={() => { Array.from(document.querySelectorAll('nav button')).find(b => b.textContent.includes('Inquiry'))?.click(); }}>Inquiry</span></li>
                        </ul>
                    </div>

                    {/* Column 3: Contact */}
                    <div style={{ flex: '0 1 250px' }}>
                        <h4 style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', fontWeight: 800, color: '#111111', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Contact Us</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <a href="https://www.facebook.com/shrinesolarservices" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'rgba(0,0,0,0.65)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#B8860B'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(0,0,0,0.65)'}>
                                <img src="/fblogo.png" alt="FB" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                                ShrineSolar
                            </a>
                            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <img src="/phonelogo.png" alt="Phone" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                                09171842499
                            </span>
                            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=Shrinesolar2022@gmail.com" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'rgba(0,0,0,0.65)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#B8860B'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(0,0,0,0.65)'}>
                                <img src="/gmaillogo.png" alt="Gmail" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                                Shrinesolar2022@gmail.com
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', padding: '20px 40px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)', textAlign: 'center' }}>
                        © {new Date().getFullYear()} Shrine Solar. All rights reserved. · #1 Panel & Electrical Installations in Dapitan City
                    </p>
                </div>
            </footer>
        </div>
    );
}
