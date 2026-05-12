import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-[#a8a8a8] flex flex-col">
      {/* Header Layout (No visible container) */}
      <header className="w-full px-16 pt-16 pb-8 flex justify-between items-center">
        
        {/* Logo Placeholder */}
        <div className="w-48 h-48 bg-[#909090] border-2 border-gray-500 rounded-full flex items-center justify-center text-black font-medium text-xl shadow-sm">
          Logo
        </div>

        {/* Navigation Buttons */}
        <nav className="flex gap-8">
          <a href="#" className="w-40 py-4 bg-[#909090] border-2 border-gray-500 text-black rounded-[40px] font-medium text-center shadow-sm hover:bg-[#808080] transition-colors">
            Home
          </a>
          <a href="#" className="w-40 py-4 bg-[#909090] border-2 border-gray-500 text-black rounded-[40px] font-medium text-center shadow-sm hover:bg-[#808080] transition-colors">
            Shop
          </a>
          <a href="#" className="w-40 py-4 bg-[#909090] border-2 border-gray-500 text-black rounded-[40px] font-medium text-center shadow-sm hover:bg-[#808080] transition-colors">
            Inquiry
          </a>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col items-center justify-center p-8 w-full">
        <p className="text-gray-600 text-lg">
          {/* Shrine Solar — Content will go here */}
        </p>
      </main>
    </div>
  )
}

export default App
