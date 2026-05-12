import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      {/* Floating Header Section */}
      <header className="w-[90%] max-w-6xl mx-auto mt-12 bg-white rounded-[60px] px-10 py-6 flex justify-between items-center shadow-lg border border-gray-200">
        
        {/* Logo Placeholder */}
        <div className="w-24 h-24 bg-gray-200 border-2 border-gray-400 rounded-full flex items-center justify-center text-gray-700 font-bold text-xl shadow-inner shrink-0">
          Logo
        </div>

        {/* Navigation Buttons */}
        <nav className="flex gap-4 sm:gap-6">
          <a href="#" className="px-8 py-4 sm:px-10 sm:py-4 bg-gray-200 border-2 border-gray-400 text-gray-700 rounded-full font-medium text-center hover:bg-white transition-colors shadow-sm">
            Home
          </a>
          <a href="#" className="px-8 py-4 sm:px-10 sm:py-4 bg-gray-200 border-2 border-gray-400 text-gray-700 rounded-full font-medium text-center hover:bg-white transition-colors shadow-sm">
            Shop
          </a>
          <a href="#" className="px-8 py-4 sm:px-10 sm:py-4 bg-gray-200 border-2 border-gray-400 text-gray-700 rounded-full font-medium text-center hover:bg-white transition-colors shadow-sm">
            Inquiry
          </a>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col items-center justify-center p-8 w-full">
        <p className="text-gray-500 text-lg">
          {/* Shrine Solar — Content will go here */}
          Main Content Area
        </p>
      </main>
    </div>
  )
}

export default App
