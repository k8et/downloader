import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import FilmSearch from '../features/movies/FilmSearch'

function Layout({ children }) {
    const location = useLocation()
    const navigate = useNavigate()
    const { user } = useAuth()

    return (
        <div className="min-h-screen bg-zinc-900">
            <nav className="bg-zinc-800/50 backdrop-blur-sm border-b border-zinc-700/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 gap-4">
                        <div className="flex">
                            <button
                                onClick={() => navigate('/')}
                                className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium transition-all ${location.pathname === '/'
                                    ? 'border-blue-500 text-blue-400'
                                    : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
                                    }`}
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Главная
                            </button>
                        </div>
                        <div className="flex items-center gap-4 justify-end flex-1">
                            <div className="hidden md:block max-w-md w-full">
                                <FilmSearch />
                            </div>
                            {user ? (
                                <Link
                                    to="/profile"
                                    className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium transition-all ${location.pathname === '/profile'
                                        ? 'border-blue-500 text-blue-400'
                                        : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-600'
                                        }`}
                                >
                                    <User className="w-4 h-4 mr-2" />
                                    <span className="hidden sm:inline">Профиль</span>
                                </Link>
                            ) : (
                                <Link
                                    to="/login"
                                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
                                >
                                    <User className="w-4 h-4 mr-2" />
                                    Войти
                                </Link>
                            )}
                        </div>
                    </div>
                    <div className="md:hidden w-full pb-4">
                        <FilmSearch />
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

