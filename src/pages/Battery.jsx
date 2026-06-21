import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function Battery() {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleAddToCart = (item) => {
    const cart = JSON.parse(localStorage.getItem('shrine_cart') || '[]');
    cart.push({ name: `Product ${item}`, category: 'Battery', price: 0 });
    localStorage.setItem('shrine_cart', JSON.stringify(cart));
    Swal.fire({
      icon: 'success',
      title: 'Added to Cart!',
      text: `Product ${item} has been added to your cart successfully!`,
      confirmButtonColor: '#f59e0b',
      timer: 2000,
      timerProgressBar: true,
    });
  };

  return (
    <div className="w-full flex-grow flex flex-col pt-8 sm:pt-16 px-4 sm:px-8 pb-8 items-center">
      {/* Header */}
      <header className="w-full max-w-7xl flex justify-center items-center mb-8 sm:mb-16 px-2 sm:px-8 relative">
        <h1 className="text-3xl sm:text-5xl font-bold text-black tracking-wider text-center">Battery</h1>
        <div className="absolute right-2 sm:right-8 flex items-center gap-2">
          <button
            onClick={() => navigate('/my-cart')}
            className="text-gray-700 hover:text-black hover:bg-gray-400 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-colors"
            title="My Cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          </button>
          <button
            onClick={() => navigate('/')}
            className="text-gray-700 hover:text-black hover:bg-gray-400 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold transition-colors"
          >
            ✕
          </button>
        </div>
      </header>

      {/* Main Content Modal */}
      <div className="bg-[#a8a8a8] border-4 border-gray-600 rounded-3xl w-full max-w-7xl p-4 sm:p-10 flex-grow shadow-2xl flex items-center justify-center my-4 sm:my-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-12 w-full max-w-5xl">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="relative bg-[#909090] border-2 border-gray-500 rounded-2xl sm:rounded-3xl min-h-[200px] sm:min-h-[350px] flex flex-col items-center justify-between p-3 sm:p-6 shadow-lg hover:scale-105 transition-transform">
              {/* Cart Icon */}
              <button
                onClick={() => handleAddToCart(item)}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 bg-white/80 hover:bg-amber-400 rounded-full flex items-center justify-center shadow-md transition-colors z-10"
                title="Add to Cart"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
              </button>
              <div className="w-full flex-grow bg-gray-400/50 rounded-lg sm:rounded-xl flex items-center justify-center text-gray-700 font-medium text-sm sm:text-base mb-3 sm:mb-6">
                Product {item}
              </div>
              <button
                onClick={() => setSelectedProduct(item)}
                className="w-24 sm:w-40 py-2 sm:py-3 bg-[#a8a8a8] border-2 border-gray-600 text-black font-bold text-sm sm:text-lg rounded-full hover:bg-gray-300 transition-colors shadow-md mb-1 sm:mb-2 flex-shrink-0"
              >
                View
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white w-full h-full sm:h-[90vh] sm:max-w-4xl sm:rounded-3xl shadow-2xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <div className="relative">
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center text-xl font-bold transition-colors z-10"
              >
                ✕
              </button>
              {/* Empty Image Placeholder */}
              <div className="w-full h-64 sm:h-[400px] bg-gray-300 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 sm:w-28 sm:h-28 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            {/* Product Info */}
            <div className="p-6 sm:p-10">
              <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">Product {selectedProduct}</h2>
              <p className="text-xl sm:text-2xl font-semibold text-amber-600 mb-4">₱0.00</p>
              <p className="text-base sm:text-lg text-gray-500 mb-8">No Description Provided</p>
              {/* Add to Cart Button */}
              <button
                onClick={() => handleAddToCart(selectedProduct)}
                className="w-full py-4 sm:py-5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg sm:text-xl rounded-xl transition-colors shadow-lg flex items-center justify-center gap-3"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
