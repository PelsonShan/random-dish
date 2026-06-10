import { Link } from 'react-router-dom'
import { ChefHat } from 'lucide-react'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between">
          <Link to="/spaces" className="flex items-center gap-2 text-primary-600 font-bold text-base sm:text-lg">
            <ChefHat className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>今天吃啥呀</span>
          </Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {children}
      </main>
    </div>
  )
}
