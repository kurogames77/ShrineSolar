import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-[#a8a8a8] flex flex-col">
      {/* Header Layout (No visible container) */}
      <header className="w-full max-w-7xl mx-auto px-16 pt-24 pb-8 flex justify-between items-center">

        {/* Logo */}
        <img src="/logo.png" alt="Shrine Solar Logo" className="h-14 w-auto" />

        {/* Navigation Buttons */}
        <nav className="flex gap-10">
          <a href="#" className="w-44 py-5 bg-[#909090] border-2 border-gray-500 text-black rounded-full font-medium text-center shadow-sm hover:bg-[#808080] transition-colors">
            Home
          </a>
          <a href="#" className="w-44 py-5 bg-[#909090] border-2 border-gray-500 text-black rounded-full font-medium text-center shadow-sm hover:bg-[#808080] transition-colors">
            Shop
          </a>
          <a href="#" className="w-44 py-5 bg-[#909090] border-2 border-gray-500 text-black rounded-full font-medium text-center shadow-sm hover:bg-[#808080] transition-colors">
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
