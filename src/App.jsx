import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header Section */}
      <header className="w-full bg-gray-200 p-6 flex justify-between items-center shadow-sm">
        {/* Logo Placeholder */}
        <div className="w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
          Logo
        </div>

        {/* Navigation Buttons */}
        <nav className="flex gap-6 pr-8">
          <a href="#" className="px-8 py-3 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors shadow-sm">
            Home
          </a>
          <a href="#" className="px-8 py-3 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors shadow-sm">
            Shop
          </a>
          <a href="#" className="px-8 py-3 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors shadow-sm">
            Inquiry
          </a>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col items-center justify-center p-8 bg-gray-300">
        <p className="text-gray-600 text-lg">
          {/* Shrine Solar — Content will go here */}
          Main Content Area
        </p>
      </main>
    </div>
  )
}

export default App
