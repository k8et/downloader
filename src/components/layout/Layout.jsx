import { Link, useLocation } from 'react-router-dom'
import { Home, Video } from 'lucide-react'

function Layout({ children }) {
    const location = useLocation()

    return (
        <div className="min-h-screen bg-zinc-900">
            <nav className="bg-zinc-800/50 backdrop-blur-sm border-b border-zinc-700/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <Link
                                to="/"
                                className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium transition-all ${
                                    location.pathname === '/'
                                        ? 'border-blue-500 text-blue-400'
                                        : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
                                }`}
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Главная
                            </Link>
                            <Link
                                to="/viewer"
                                className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium transition-all ${
                                    location.pathname.startsWith('/viewer')
                                        ? 'border-blue-500 text-blue-400'
                                        : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
                                }`}
                            >
                                <Video className="w-4 h-4 mr-2" />
                                Просмотр
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                {children}
            </main>
        </div>
    )
}

export default Layout

