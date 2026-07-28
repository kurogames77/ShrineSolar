import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { supabase } from '../supabaseClient';
import { Turnstile } from '@marsidev/react-turnstile';
export default function MyCart() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [past, setPast] = useState([]);
    const [future, setFuture] = useState([]);
    const [turnstileToken, setTurnstileToken] = useState(null);
    const [formData, setFormData] = useState({
        fullname: '',
        contactNumber: '',
        address: '',
        gmail: '',
    });

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('shrine_cart') || '[]');
        setCartItems(saved);
    }, []);

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
        if (!formData.fullname || !formData.contactNumber) {
            Swal.fire({
                icon: 'error',
                title: 'Incomplete',
                text: 'Please fill in your Fullname and Contact Number.',
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
                    address_line1: formData.address
                });

            if (customerError) throw customerError;

            // 2. Insert Order
            // Compile product details into a string
            const productDetails = cartItems.map(item => `${item.name} (x${item.quantity})`).join(', ');
            const totalQty = cartItems.reduce((acc, item) => acc + (parseInt(item.quantity) || 1), 0);
            
            const orderId = crypto.randomUUID();

            const { error: orderError } = await supabase
                .from('orders')
                .insert({
                    id: orderId,
                    customer_id: customerId,
                    order_category: 'Website Cart',
                    product_details: productDetails,
                    size_or_qty: totalQty,
                    total_amount: 0 // You can calculate this if you have prices later
                });

            if (orderError) throw orderError;

            // 3. Insert Activity Log
            const { error: logError } = await supabase
                .from('activity_log')
                .insert({
                    action: 'Placed New Order',
                    entity_type: 'Order',
                    entity_name: `Order by ${formData.fullname}`,
                    details: `Products: ${productDetails}`
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
        <div className="w-full min-h-screen bg-[#eef2f7] flex flex-col items-center">
            {/* Header */}
            <header className="w-full max-w-7xl flex justify-center items-center pt-8 sm:pt-12 pb-4 sm:pb-8 px-4 sm:px-8 relative">
                <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 sm:w-10 sm:h-10 text-[#1a2332]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                    <h1 className="text-3xl sm:text-5xl font-bold text-[#1a2332] tracking-wider">My Cart</h1>
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="absolute right-4 sm:right-8 text-[#64748b] hover:text-[#1a2332] hover:bg-white/60 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold transition-colors"
                >
                    ✕
                </button>
            </header>

            {/* Main Content */}
            <div className="flex-grow w-full max-w-7xl px-6 sm:px-10 pb-8 pt-6 sm:pt-10 flex flex-col lg:flex-row gap-6 sm:gap-10 justify-center items-start">
                {/* Left: Cart Items */}
                <div className="w-full mx-auto lg:mx-0 max-w-[550px] bg-white border border-[#e2e8f0] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-y-auto max-h-[60vh] lg:max-h-[70vh]" style={{padding: '28px 32px'}}>
                    <div className="flex items-center justify-between mb-6 sm:mb-8 w-full">
                        <h2 className="text-xl sm:text-2xl font-bold text-[#1a2332] m-0">Cart Items</h2>
                        <div className="flex gap-2">
                            <button onClick={undo} disabled={past.length === 0} className="p-1.5 sm:p-2 text-[#1a2332] hover:bg-[#eef2f7] rounded-lg disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-default" title="Undo">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                                </svg>
                            </button>
                            <button onClick={redo} disabled={future.length === 0} className="p-1.5 sm:p-2 text-[#1a2332] hover:bg-[#eef2f7] rounded-lg disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-default" title="Redo">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    {cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-[#94a3b8]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-[#cbd5e1] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                            </svg>
                            <p className="text-lg font-medium">Your cart is empty</p>
                        </div>
                    ) : (
                        Object.entries(grouped).map(([category, items]) => (
                            <div key={category} className="mb-5 sm:mb-7">
                                <h3 className="text-lg sm:text-xl font-semibold text-[#1a2332] mb-3 sm:mb-4">{category}</h3>
                                <div className="flex flex-col gap-2.5 sm:gap-3">
                                    {items.map((item, idx) => {
                                        const globalIndex = cartItems.indexOf(item);
                                        return (
                                            <div key={idx} className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3.5 sm:p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
                                                <div>
                                                    <p className="font-semibold text-[#1a2332] text-sm sm:text-base">
                                                        {item.name} <span className="text-[#64748b] font-normal ml-2">x{item.quantity}</span>
                                                    </p>
                                                    <p className="text-[#f59e0b] font-medium text-xs sm:text-sm">₱0.00</p>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveItem(globalIndex)}
                                                    className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                                                    title="Remove"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
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
                </div>

                {/* Right: Customer Info Form */}
                <div className="w-full mx-auto lg:mx-0 max-w-[550px] bg-white border border-[#e2e8f0] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-col items-start" style={{padding: '28px 32px'}}>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#1a2332] mb-6 sm:mb-8">Customer Information</h2>
                    <div className="flex flex-col gap-6 w-full">
                        <div className="mycart-input-group">
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
                        <div className="mycart-input-group">
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
                        <div className="mycart-input-group">
                            <input
                                required
                                type="text"
                                name="address"
                                autoComplete="off"
                                placeholder=" "
                                value={formData.address}
                                onChange={handleInputChange}
                                className="mycart-input"
                            />
                            <label className="mycart-user-label">Address</label>
                        </div>
                        <div className="mycart-input-group">
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
                        className="fb-button type1"
                    >
                        <span className="fb-btn-txt">Proceed to Facebook</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
