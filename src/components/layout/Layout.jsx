import { Link, useLocation } from 'react-router-dom'
import { Home, Video } from 'lucide-react'

function Layout({ children }) {
    const location = useLocation()

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <Link
                                to="/"
                                className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium transition-colors ${location.pathname === '/'
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <Home className="w-5 h-5 mr-2" />
                                Главная
                            </Link>
                            <Link
                                to="/viewer"
                                className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium transition-colors ${location.pathname === '/viewer'
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <Video className="w-5 h-5 mr-2" />
                                Просмотр
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    )
}

export default Layout

