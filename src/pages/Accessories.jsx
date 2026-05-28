import { useNavigate } from 'react-router-dom';

export default function Accessories() {
  const navigate = useNavigate();
  return (
    <div className="w-full flex-grow flex flex-col pt-8 sm:pt-16 px-4 sm:px-8 pb-8 items-center">
      {/* Header */}
      <header className="w-full max-w-7xl flex justify-center items-center mb-8 sm:mb-16 px-2 sm:px-8 relative">
        <h1 className="text-3xl sm:text-5xl font-bold text-black tracking-wider text-center">Accessories</h1>
        <button 
          onClick={() => navigate('/')}
          className="absolute right-2 sm:right-8 text-gray-700 hover:text-black hover:bg-gray-400 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold transition-colors"
        >
          ✕
        </button>
      </header>

      {/* Main Content Modal */}
      <div className="bg-[#a8a8a8] border-4 border-gray-600 rounded-3xl w-full max-w-7xl p-4 sm:p-10 flex-grow shadow-2xl flex justify-center my-4 sm:my-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-12 w-full max-w-5xl h-fit">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-[#909090] border-2 border-gray-500 rounded-2xl sm:rounded-3xl min-h-[200px] sm:min-h-[350px] flex flex-col items-center justify-between p-3 sm:p-6 shadow-lg hover:scale-105 transition-transform">
              <div className="w-full flex-grow bg-gray-400/50 rounded-lg sm:rounded-xl flex items-center justify-center text-gray-700 font-medium text-sm sm:text-base mb-3 sm:mb-6">
                Product {item}
              </div>
              <button className="w-24 sm:w-40 py-2 sm:py-3 bg-[#a8a8a8] border-2 border-gray-600 text-black font-bold text-sm sm:text-lg rounded-full hover:bg-gray-300 transition-colors shadow-md mb-1 sm:mb-2 flex-shrink-0">
                View
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
