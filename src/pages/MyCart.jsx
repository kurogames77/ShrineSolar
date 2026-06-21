import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function MyCart() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
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

    // Group cart items by category
    const grouped = cartItems.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {});

    return (
        <div className="w-full min-h-screen bg-[#a8a8a8] flex flex-col">
            {/* Header */}
            <header className="w-full max-w-7xl mx-auto flex justify-center items-center pt-8 sm:pt-12 pb-4 sm:pb-8 px-4 sm:px-8 relative">
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
            <div className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-8 pb-8 flex flex-col lg:flex-row gap-6 sm:gap-8">
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
                                                    <p className="font-semibold text-black text-sm sm:text-base">{item.name}</p>
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
                    {/* Proceed Button */}
                    <button
                        className="w-full mt-6 sm:mt-8 py-4 sm:py-5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg sm:text-xl rounded-full transition-colors shadow-lg flex items-center justify-center gap-3"
                    >
                        Proceed to Facebook
                    </button>
                </div>
            </div>
        </div>
    );
}
