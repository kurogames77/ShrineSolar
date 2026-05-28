import { useNavigate } from 'react-router-dom';

export default function Battery() {
  const navigate = useNavigate();
  return (
    <div className="w-full flex-grow flex flex-col pt-16 px-8 pb-8 items-center">
      {/* Header */}
      <header className="w-full max-w-7xl flex justify-center items-center mb-12 px-8 relative flex-shrink-0">
        <h1 className="text-5xl font-bold text-black tracking-wider text-center">Battery</h1>
        <button 
          onClick={() => navigate('/')}
          className="absolute right-8 text-gray-700 hover:text-black hover:bg-gray-400 w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold transition-colors"
        >
          ✕
        </button>
      </header>

      {/* Main Content Modal */}
      <div className="bg-[#a8a8a8] border-4 border-gray-600 rounded-3xl w-full max-w-7xl p-10 mt-8 mb-16 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-[#909090] border-2 border-gray-500 rounded-3xl min-h-[350px] flex flex-col items-center p-6 shadow-lg hover:scale-105 transition-transform">
              <div className="w-full flex-grow bg-gray-400/50 rounded-xl flex items-center justify-center text-gray-700 font-medium mb-6">
                Product {item}
              </div>
              <button className="w-40 py-3 bg-[#a8a8a8] border-2 border-gray-600 text-black font-bold text-lg rounded-full hover:bg-gray-300 transition-colors shadow-md mt-auto flex-shrink-0">
                View
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
