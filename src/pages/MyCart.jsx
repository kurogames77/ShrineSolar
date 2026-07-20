import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { supabase } from '../supabaseClient';
import { Turnstile } from '@marsidev/react-turnstile';
export default function MyCart() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
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
        <div className="w-full min-h-screen bg-[#a8a8a8] flex flex-col">
            {/* Header */}
            <header className="w-full max-w-5xl mx-auto flex justify-center items-center pt-8 sm:pt-12 pb-4 sm:pb-8 px-4 sm:px-8 relative">
                <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 sm:w-10 sm:h-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                    <h1 className="text-3xl sm:text-5xl font-bold text-black tracking-wider">My Cart</h1>
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="absolute right-4 sm:right-8 text-gray-700 hover:text-black hover:bg-gray-400 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold transition-colors"
                >
                    ✕
                </button>
            </header>

            {/* Main Content */}
            <div className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-8 pb-8 flex flex-col lg:flex-row gap-6 sm:gap-8 justify-center">
                {/* Left: Cart Items */}
                <div className="w-full lg:w-1/2 bg-[#909090] border-2 border-gray-500 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg overflow-y-auto max-h-[60vh] lg:max-h-[70vh]">
                    <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">Cart Items</h2>
                    {cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                            </svg>
                            <p className="text-lg font-medium">Your cart is empty</p>
                        </div>
                    ) : (
                        Object.entries(grouped).map(([category, items]) => (
                            <div key={category} className="mb-4 sm:mb-6">
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3 border-b-2 border-gray-500 pb-1">{category}</h3>
                                <div className="flex flex-col gap-2 sm:gap-3">
                                    {items.map((item, idx) => {
                                        const globalIndex = cartItems.indexOf(item);
                                        return (
                                            <div key={idx} className="bg-gray-400/50 rounded-xl p-3 sm:p-4 flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold text-black text-sm sm:text-base">
                                                        {item.name} <span className="text-gray-700 font-normal ml-2">x{item.quantity}</span>
                                                    </p>
                                                    <p className="text-amber-700 font-medium text-xs sm:text-sm">₱0.00</p>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveItem(globalIndex)}
                                                    className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold transition-colors flex-shrink-0"
                                                    title="Remove"
                                                >
                                                    ✕
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
                <div className="w-full lg:w-1/2 bg-[#909090] border-2 border-gray-500 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg flex flex-col">
                    <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">Customer Information</h2>
                    <div className="flex flex-col gap-3 sm:gap-4 flex-grow">
                        <input
                            type="text"
                            name="fullname"
                            placeholder="Fullname"
                            value={formData.fullname}
                            onChange={handleInputChange}
                            className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-gray-400/50 border-2 border-gray-500 rounded-full text-black font-medium text-sm sm:text-base placeholder-gray-600 focus:outline-none focus:border-amber-500 transition-colors"
                        />
                        <input
                            type="text"
                            name="contactNumber"
                            placeholder="Contact Number"
                            value={formData.contactNumber}
                            onChange={handleInputChange}
                            className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-gray-400/50 border-2 border-gray-500 rounded-full text-black font-medium text-sm sm:text-base placeholder-gray-600 focus:outline-none focus:border-amber-500 transition-colors"
                        />
                        <input
                            type="text"
                            name="address"
                            placeholder="Address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-gray-400/50 border-2 border-gray-500 rounded-full text-black font-medium text-sm sm:text-base placeholder-gray-600 focus:outline-none focus:border-amber-500 transition-colors"
                        />
                        <input
                            type="email"
                            name="gmail"
                            placeholder="Gmail (Optional)"
                            value={formData.gmail}
                            onChange={handleInputChange}
                            className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-gray-400/50 border-2 border-gray-500 rounded-full text-black font-medium text-sm sm:text-base placeholder-gray-600 focus:outline-none focus:border-amber-500 transition-colors"
                        />
                    </div>
                    {/* Cloudflare Turnstile */}
                    <div className="mt-4 flex justify-center w-full">
                        <Turnstile 
                            siteKey="0x4AAAAAAD6EPzOFjE9_pvVF" 
                            onSuccess={(token) => setTurnstileToken(token)}
                            options={{ theme: 'light' }}
                        />
                    </div>
                    {/* Proceed Button */}
                    <button
                        onClick={handleProceed}
                        className="w-full mt-6 sm:mt-8 py-4 sm:py-5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg sm:text-xl rounded-full transition-colors shadow-lg flex items-center justify-center gap-3"
                    >
                        Proceed to Facebook
                    </button>
                </div>
            </div>
        </div>
    );
}
