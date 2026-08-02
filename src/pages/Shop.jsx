import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function Shop() {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantityModal, setQuantityModal] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cartItems, setCartItems] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [imagePreview, setImagePreview] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [initialPinchDistance, setInitialPinchDistance] = useState(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedCategories, setAppliedCategories] = useState([]);
  const [tempCategories, setTempCategories] = useState([]);

  const filterCategoriesList = [
    "Inverters", "Accessories & Monitoring", "Solar Panels", 
    "Energy Storage", "Solar Portable Power Station", "Wires", 
    "PV Mounting Accessories", "Breakers & SPD's", "Rapid Shutdown Device"
  ];

  const filteredItems = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter((item) =>
    `Product ${item}`.toLowerCase().includes(searchText.toLowerCase())
  );

  useEffect(() => {
    setCartItems(JSON.parse(localStorage.getItem('shrine_cart') || '[]'));
  }, []);

  useEffect(() => {
    if (selectedProduct || quantityModal || imagePreview || isFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedProduct, quantityModal, imagePreview, isFilterOpen]);

  const openQuantityModal = (item) => {
    const existing = cartItems.find(c => c.name === `Product ${item}` && c.category === 'Shop');
    setQuantity(existing ? existing.quantity : 1);
    setQuantityModal(item);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      setInitialPinchDistance(dist);
    } else if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && initialPinchDistance !== null) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      
      if (dist > initialPinchDistance + 10) {
        setZoomLevel(prev => Math.min(3, prev + 0.1));
        setInitialPinchDistance(dist);
      } else if (dist < initialPinchDistance - 10) {
        setZoomLevel(prev => Math.max(0.5, prev - 0.1));
        setInitialPinchDistance(dist);
      }
    } else if (e.touches.length === 1 && isDragging) {
      setPan({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y });
    }
  };

  const handleTouchEnd = () => {
    setInitialPinchDistance(null);
    setIsDragging(false);
  };

  const confirmAddToCart = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to confirm this quantity?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Yes, confirm!',
    }).then((result) => {
      if (result.isConfirmed) {
        const item = quantityModal;
        const cart = JSON.parse(localStorage.getItem('shrine_cart') || '[]');
        const existingIndex = cart.findIndex(c => c.name === `Product ${item}` && c.category === 'Shop');
        if (existingIndex !== -1) {
          cart[existingIndex].quantity = quantity;
        } else {
          cart.push({ name: `Product ${item}`, category: 'Shop', price: 0, quantity });
        }
        localStorage.setItem('shrine_cart', JSON.stringify(cart));
        setCartItems(cart);
        setQuantityModal(null);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: `Product ${item} (x${quantity}) has been updated in your cart!`,
          confirmButtonColor: '#f59e0b',
          timer: 2000,
          timerProgressBar: true,
        });
      }
    });
  };

  const removeFromCart = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to remove this item from your cart?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Yes, remove it!',
    }).then((result) => {
      if (result.isConfirmed) {
        const item = quantityModal;
        let cart = JSON.parse(localStorage.getItem('shrine_cart') || '[]');
        cart = cart.filter(c => !(c.name === `Product ${item}` && c.category === 'Shop'));
        localStorage.setItem('shrine_cart', JSON.stringify(cart));
        setCartItems(cart);
        setQuantityModal(null);
        Swal.fire({
          icon: 'success',
          title: 'Removed!',
          text: `Product ${item} has been removed from your cart.`,
          confirmButtonColor: '#f59e0b',
          timer: 2000,
          timerProgressBar: true,
        });
      }
    });
  };

  const isInCart = (item) => cartItems.some(c => c.name === `Product ${item}` && c.category === 'Shop');

  return (
    <div className="w-full min-h-screen bg-[#eef2f7] flex flex-col items-center">
      <div className="w-full flex-grow flex flex-col pb-16 items-center" style={{ paddingTop: '100px', paddingLeft: '16px', paddingRight: '16px' }}>
      {/* Header with Search Bar and Filter */}
      <header className="fixed top-[56px] left-0 right-0 z-30 bg-transparent w-full flex items-center justify-center py-3 sm:py-4" style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '12px' }}>
        <div className="w-full max-w-7xl flex items-center gap-2 sm:gap-0 relative">

        {/* Back Button — left */}
        <button
            onClick={() => navigate('/')}
            className="text-[#64748b] hover:text-[#1a2332] border-2 border-[#cbd5e1] hover:border-[#94a3b8] hover:bg-white/60 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
            title="Go Back"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
        </button>

        {/* Center Group: Search Bar and Filter */}
        <div className="flex flex-1 items-center gap-2 sm:gap-3 min-w-0 w-full sm:max-w-[560px] sm:justify-center sm:absolute sm:left-1/2 sm:-translate-x-1/2">
          {/* Search Bar */}
          <div
            className="flex items-center flex-1 min-w-0 bg-white rounded-full border border-gray-300 gap-2 transition-all duration-200"
            style={{ paddingLeft: '16px', paddingRight: '6px', paddingTop: '6px', paddingBottom: '6px', minHeight: '44px' }}
          >
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="flex-1 min-w-[50px] py-2 text-base text-gray-700 bg-transparent focus:outline-none placeholder-gray-400"
              placeholder="Search..."
            />
            {/* Clear X Button */}
            {searchText && (
              <button
                onClick={() => setSearchText('')}
                className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
                title="Clear"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            {/* Circular Search Icon Button */}
            <button
              className="w-10 h-10 flex-shrink-0 rounded-full bg-yellow-400 hover:bg-yellow-500 flex items-center justify-center shadow transition-colors"
              title="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Filter Button */}
          <button
            onClick={() => { setTempCategories([...appliedCategories]); setIsFilterOpen(true); }}
            className={`relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border transition-all duration-150 ease-in-out hover:scale-105 focus:outline-none flex-shrink-0 ${appliedCategories.length > 0 ? 'bg-orange-50 border-orange-500 text-orange-600' : 'bg-white border-gray-300 text-gray-500 hover:text-yellow-500'}`}
            title="Filter"
          >
            {appliedCategories.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center border-2 border-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            )}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="w-full max-w-7xl flex-grow my-4 sm:my-8">
        {filteredItems.length === 0 ? (
          <div className="w-full flex items-center justify-center py-20">
            <p className="text-gray-500 text-lg">No products found matching "{searchText}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 w-full">
            {filteredItems.map((item) => (
              <div
                key={item}
              className="group relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-white"
              onClick={() => setSelectedProduct(item)}
            >
              {/* Product Image Area */}
              <div className="relative w-full aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>

                {/* Cart Icon & Badge — top right */}
                <div className="absolute top-2 right-2 z-10">
                  <button
                    onClick={(e) => { e.stopPropagation(); openQuantityModal(item); }}
                    className="w-8 h-8 bg-white/90 hover:bg-amber-400 rounded-full flex items-center justify-center shadow-md transition-colors"
                    title="Add to Cart"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                  </button>
                  {isInCart(item) && (
                    <div className="absolute -top-1 -right-1 bg-white rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-600" viewBox="0 0 20 20" fill="currentColor" title="Added to Cart">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Orange Hover Overlay with "View Product" */}
                <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/20 transition-all duration-300 flex items-end justify-center">
                  <div className="w-full bg-orange-500 text-white text-center py-2.5 font-semibold text-sm translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    View Product
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div style={{ padding: '8px' }}>
                <h3 className="text-sm font-medium text-gray-800 leading-tight mb-1 line-clamp-2" style={{ minHeight: '2.5em' }}>
                  Product {item}
                </h3>
                <p className="text-base font-bold text-orange-600 mb-1">₱0.00</p>
                <p className="text-xs text-gray-400">100 Stocks</p>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white w-full h-full sm:h-[95vh] sm:w-[95vw] sm:max-w-7xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex-1 overflow-y-auto">
              <div className="relative">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center text-xl font-bold transition-colors z-10"
                >
                  ✕
                </button>
                <div 
                  className="w-full h-64 sm:h-[400px] bg-gray-300 flex items-center justify-center cursor-pointer transition-opacity hover:opacity-90"
                  onClick={() => { setImagePreview(true); setZoomLevel(1); setPan({ x: 0, y: 0 }); }}
                  title="Click to zoom image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 sm:w-28 sm:h-28 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div style={{ padding: '24px', paddingLeft: '10px', paddingRight: '10px' }}>
                <div className="flex items-center gap-4 mb-2">
                  <h2 className="text-2xl sm:text-4xl font-bold text-gray-900">Product {selectedProduct}</h2>
                  {isInCart(selectedProduct) && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <p className="text-xl sm:text-2xl font-semibold text-amber-600 mb-4">₱0.00</p>
                <p className="text-base sm:text-lg text-gray-500 mb-8">
                  Discover the ultimate in renewable energy with our cutting-edge solar panels. Designed for maximum efficiency and durability, these panels harness the power of the sun to provide a sustainable and cost-effective energy solution for your home or business. Featuring advanced photovoltaic technology, they ensure optimal performance even in low-light conditions. The sleek, low-profile design seamlessly integrates with any roof type, offering both aesthetic appeal and robust weather resistance. By switching to our solar panels, you not only significantly reduce your electricity bills but also contribute to a greener planet by lowering your carbon footprint. Easy to install and backed by an industry-leading warranty, this solar solution is your step towards energy independence and a sustainable future. Upgrade today and let the sun power your life!
                </p>
              </div>
            </div>
            <div className="flex-shrink-0 bg-white" style={{ paddingLeft: '10px', paddingRight: '10px', paddingBottom: '10px', paddingTop: '10px' }}>
              <div className="w-full flex justify-center">
                <button
                  onClick={() => openQuantityModal(selectedProduct)}
                  className="w-full sm:w-[400px] h-16 bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg sm:text-xl rounded-2xl transition-colors shadow-lg flex items-center justify-center gap-3"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                  {isInCart(selectedProduct) ? 'Update Cart' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quantity Selection Modal */}
      {quantityModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4" onClick={() => setQuantityModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative" style={{ padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setQuantityModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center"
              title="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 text-center">{isInCart(quantityModal) ? 'Update Quantity' : 'Add to Cart'}</h3>

            {/* Product Image */}
            <div className="w-full aspect-square bg-gray-100 rounded-xl flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>

            {/* Product Name */}
            <p className="text-gray-700 font-medium text-center" style={{ marginBottom: '4px' }}>Product {quantityModal}</p>
            {/* Stocks */}
            <p className="text-xs text-gray-400 text-center" style={{ marginBottom: '16px' }}>100 Stocks</p>

            {/* Quantity Selector */}
            <div className="flex items-center justify-center gap-4" style={{ marginBottom: '12px' }}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-2xl font-bold text-gray-700 transition-colors"
              >
                −
              </button>
              <span className="text-3xl font-bold text-gray-900 w-16 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-2xl font-bold text-gray-700 transition-colors"
              >
                +
              </button>
            </div>

            {/* Total Line */}
            <p className="text-sm text-gray-600 text-center" style={{ marginBottom: '16px' }}>
              Total ({quantity} {quantity === 1 ? 'item' : 'items'}): <span className="font-bold text-orange-500">₱0.00</span>
            </p>

            <div className="px-4 sm:px-6 w-full pb-2 flex flex-col gap-3">
              <button
                onClick={confirmAddToCart}
                className="w-full py-3 sm:py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg rounded-xl transition-colors shadow-lg"
              >
                Confirm
              </button>
              {isInCart(quantityModal) && (
                <button
                  onClick={removeFromCart}
                  className="w-full py-3 sm:py-4 bg-red-500 hover:bg-red-600 text-white font-bold text-lg rounded-xl transition-colors shadow-lg"
                >
                  Remove Quantity
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {imagePreview && (
        <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-[70] p-4" onClick={() => setImagePreview(false)}>
          <button
            onClick={() => setImagePreview(false)}
            className="absolute top-4 right-4 w-12 h-12 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center text-2xl font-bold transition-colors z-10"
            title="Close"
          >
            ✕
          </button>
          
          <div 
            className="flex-1 w-full flex items-center justify-center overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div 
              className={`bg-gray-300 flex items-center justify-center shadow-2xl touch-none select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} ${!isDragging ? 'transition-transform duration-200' : ''}`} 
              style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`, width: '400px', height: '400px', minWidth: '400px', minHeight: '400px' }}
              onDoubleClick={() => setZoomLevel(zoomLevel === 1 ? 2 : 1)}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-40 h-40 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <div className="absolute bottom-8 flex items-center gap-6 bg-black/50 px-6 py-3 rounded-full" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))} className="w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full text-white text-2xl flex items-center justify-center transition-colors">
              −
            </button>
            <span className="text-white text-lg font-medium min-w-[4ch] text-center">{Math.round(zoomLevel * 100)}%</span>
            <button onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))} className="w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full text-white text-2xl flex items-center justify-center transition-colors">
              +
            </button>
          </div>
        </div>
      )}
      </div>

      {/* Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[80] p-4" onClick={() => setIsFilterOpen(false)}>
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col relative" style={{ padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsFilterOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center"
              title="Close"
            >
              ✕
            </button>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-8 text-center">By Category</h3>
            
            <div className="overflow-y-auto mb-8" style={{ maxHeight: '60vh' }}>
              <div className="grid grid-cols-2 gap-3">
                {filterCategoriesList.map((cat) => {
                  const isSelected = tempCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        if (isSelected) {
                          setTempCategories(tempCategories.filter(c => c !== cat));
                        } else {
                          setTempCategories([...tempCategories, cat]);
                        }
                      }}
                      className={`relative overflow-hidden flex items-center justify-center text-center px-2 py-4 rounded-md border-2 transition-all ${isSelected ? 'border-orange-500 bg-white text-orange-600 font-bold' : 'border-transparent bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      style={{ minHeight: '60px' }}
                    >
                      {isSelected && (
                        <div className="absolute top-0 left-0 w-0 h-0 border-t-[24px] border-t-orange-500 border-r-[24px] border-r-transparent">
                          <svg xmlns="http://www.w3.org/2000/svg" className="absolute -top-[22px] left-[2px] w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <span className="text-sm">{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setTempCategories([]);
                  setAppliedCategories([]);
                  setIsFilterOpen(false);
                }}
                className="flex-1 py-3 bg-white border-2 border-orange-500 text-orange-500 font-bold text-lg rounded-xl transition-colors hover:bg-orange-50"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  setAppliedCategories(tempCategories);
                  setIsFilterOpen(false);
                }}
                className="flex-1 py-3 bg-orange-500 text-white font-bold text-lg rounded-xl transition-colors hover:bg-orange-600 border-2 border-orange-500"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

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
