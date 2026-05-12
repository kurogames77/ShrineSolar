import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-300 flex flex-col">
      {/* Header Section */}
      <header className="w-full max-w-7xl mx-auto pt-16 px-12 flex justify-between items-start">
        {/* Logo Placeholder */}
        <div className="w-48 h-48 bg-gray-100 border-2 border-gray-400 rounded-full flex items-center justify-center text-gray-700 font-bold text-2xl shadow-sm">
          Logo
        </div>

        {/* Navigation Buttons */}
        <nav className="flex gap-8 pt-8">
          <a href="#" className="w-40 py-5 bg-gray-100 border-2 border-gray-400 text-gray-700 rounded-[40px] font-medium text-center hover:bg-white transition-colors shadow-sm">
            Home
          </a>
          <a href="#" className="w-40 py-5 bg-gray-100 border-2 border-gray-400 text-gray-700 rounded-[40px] font-medium text-center hover:bg-white transition-colors shadow-sm">
            Shop
          </a>
          <a href="#" className="w-40 py-5 bg-gray-100 border-2 border-gray-400 text-gray-700 rounded-[40px] font-medium text-center hover:bg-white transition-colors shadow-sm">
            Inquiry
          </a>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col items-center justify-center p-8">
        <p className="text-gray-600 text-lg">
          {/* Shrine Solar — Content will go here */}
          Main Content Area
        </p>
      </main>
    </div>
  )
}

export default App
