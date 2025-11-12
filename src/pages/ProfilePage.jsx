import { useState, useEffect, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { removeFromFavorites, removeFromWatchHistory } from '../lib/supabaseQueries'
import { useWatchHistory, useFavorites, usePrefetchWatchHistory, usePrefetchFavorites } from '../api/supabase/hooks'
import { useDebounce } from '../hooks/useDebounce'
import MovieCard from '../components/features/movies/MovieCard'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { History, Heart, Trash2, Loader2, Search, LogOut } from 'lucide-react'

function ProfilePage() {
    const { user, signOut } = useAuth()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [activeTab, setActiveTab] = useState('history')
    const [searchQuery, setSearchQuery] = useState('')
    const debouncedSearchQuery = useDebounce(searchQuery.trim(), 300)

    const handleSignOut = async () => {
        await signOut()
        navigate('/login')
    }

    const prefetchWatchHistory = usePrefetchWatchHistory()
    const prefetchFavorites = usePrefetchFavorites()

    const watchHistoryQuery = useWatchHistory(user?.id, {
        enabled: !!user
    })

    const favoritesQuery = useFavorites(user?.id, {
        enabled: !!user
    })

    const watchHistory = watchHistoryQuery.data || []
    const favorites = favoritesQuery.data || []
    const loading = (activeTab === 'history' ? watchHistoryQuery.isLoading : favoritesQuery.isLoading) && !watchHistoryQuery.data && !favoritesQuery.data
    const error = watchHistoryQuery.error || favoritesQuery.error

    useEffect(() => {
        if (user) {
            if (activeTab === 'history') {
                prefetchFavorites(user.id)
            } else {
                prefetchWatchHistory(user.id)
            }
        }
    }, [user, activeTab, prefetchWatchHistory, prefetchFavorites])

    useEffect(() => {
        if (user) {
            prefetchWatchHistory(user.id)
            prefetchFavorites(user.id)
        }
    }, [user, prefetchWatchHistory, prefetchFavorites])

    const handleRemoveFavorite = async (kinopoiskId) => {
        try {
            const { error } = await removeFromFavorites(user.id, kinopoiskId)
            if (error) throw error

            queryClient.setQueryData(['favorites', user.id], (oldData) => {
                return (oldData || []).filter(fav => fav.kinopoisk_id !== kinopoiskId)
            })
        } catch (err) {
            console.error('Error removing favorite:', err)
        }
    }

    const handleRemoveFromHistory = async (kinopoiskId) => {
        try {
            const { error } = await removeFromWatchHistory(user.id, kinopoiskId)
            if (error) throw error

            queryClient.setQueryData(['watchHistory', user.id], (oldData) => {
                return (oldData || []).filter(item => item.kinopoisk_id !== kinopoiskId)
            })
        } catch (err) {
            console.error('Error removing from history:', err)
        }
    }

    const filteredWatchHistory = useMemo(() => {
        if (!debouncedSearchQuery) return watchHistory

        const query = debouncedSearchQuery.toLowerCase()
        return watchHistory.filter(item => {
            const film = item.film_data || {}
            const nameRu = film.nameRu?.toLowerCase() || ''
            const nameEn = film.nameEn?.toLowerCase() || ''
            const nameOriginal = film.nameOriginal?.toLowerCase() || ''
            const description = film.description?.toLowerCase() || ''
            const shortDescription = film.shortDescription?.toLowerCase() || ''

            return nameRu.includes(query) ||
                nameEn.includes(query) ||
                nameOriginal.includes(query) ||
                description.includes(query) ||
                shortDescription.includes(query)
        })
    }, [watchHistory, debouncedSearchQuery])

    const filteredFavorites = useMemo(() => {
        if (!debouncedSearchQuery) return favorites

        const query = debouncedSearchQuery.toLowerCase()
        return favorites.filter(item => {
            const film = item.film_data || {}
            const nameRu = film.nameRu?.toLowerCase() || ''
            const nameEn = film.nameEn?.toLowerCase() || ''
            const nameOriginal = film.nameOriginal?.toLowerCase() || ''
            const description = film.description?.toLowerCase() || ''
            const shortDescription = film.shortDescription?.toLowerCase() || ''

            return nameRu.includes(query) ||
                nameEn.includes(query) ||
                nameOriginal.includes(query) ||
                description.includes(query) ||
                shortDescription.includes(query)
        })
    }, [favorites, debouncedSearchQuery])

    const tabs = [
        { id: 'history', label: 'История просмотра', icon: History },
        { id: 'favorites', label: 'Избранное', icon: Heart },
    ]

    return (
        <div className="w-full">
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-light text-zinc-100 mb-2 md:text-4xl lg:text-5xl">
                        Профиль
                    </h1>
                    <p className="text-zinc-400 text-sm">{user?.email}</p>
                </div>
                <Button
                    onClick={handleSignOut}
                    variant="secondary"
                    size="md"
                    className="flex items-center gap-2"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Выйти</span>
                </Button>
            </div>

            <div className="mb-6">
                <div className="flex gap-2 border-b border-zinc-700/50 mb-4">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id)
                                    setSearchQuery('')
                                }}
                                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-all ${isActive
                                    ? 'border-blue-500 text-blue-400'
                                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        )
                    })}
                </div>

                <Input
                    startContent={<Search className="w-5 h-5 text-zinc-500" />}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Поиск в ${activeTab === 'history' ? 'истории просмотра' : 'избранном'}...`}
                    className="max-w-md"
                />
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-950/30 border border-red-800/50 text-red-400 rounded-lg text-sm">
                    {error.message || 'Ошибка загрузки данных'}
                </div>
            )}

            {loading ? (
                <div className="text-center py-16">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 text-zinc-400 animate-spin" />
                    <p className="text-zinc-400">Загрузка...</p>
                </div>
            ) : (
                <>
                    {activeTab === 'history' && (
                        <div>
                            {watchHistory.length === 0 ? (
                                <div className="text-center py-16 text-zinc-500">
                                    <History className="w-20 h-20 mx-auto mb-4 text-zinc-700" />
                                    <p className="text-zinc-400">История просмотра пуста</p>
                                </div>
                            ) : filteredWatchHistory.length === 0 ? (
                                <div className="text-center py-16 text-zinc-500">
                                    <Search className="w-20 h-20 mx-auto mb-4 text-zinc-700" />
                                    <p className="text-zinc-400">Ничего не найдено</p>
                                    <p className="text-zinc-500 text-sm mt-2">
                                        Попробуйте изменить поисковый запрос
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {debouncedSearchQuery && (
                                        <div className="mb-4 text-sm text-zinc-400">
                                            Найдено: {filteredWatchHistory.length} из {watchHistory.length}
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                                        {filteredWatchHistory.map((item) => (
                                            <div key={item.kinopoisk_id} className="relative group">
                                                <MovieCard movie={item.film_data} />
                                                <Button
                                                    onClick={() => handleRemoveFromHistory(item.kinopoisk_id)}
                                                    variant="secondary"
                                                    size="sm"
                                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === 'favorites' && (
                        <div>
                            {favorites.length === 0 ? (
                                <div className="text-center py-16 text-zinc-500">
                                    <Heart className="w-20 h-20 mx-auto mb-4 text-zinc-700" />
                                    <p className="text-zinc-400">Избранное пусто</p>
                                </div>
                            ) : filteredFavorites.length === 0 ? (
                                <div className="text-center py-16 text-zinc-500">
                                    <Search className="w-20 h-20 mx-auto mb-4 text-zinc-700" />
                                    <p className="text-zinc-400">Ничего не найдено</p>
                                    <p className="text-zinc-500 text-sm mt-2">
                                        Попробуйте изменить поисковый запрос
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {debouncedSearchQuery && (
                                        <div className="mb-4 text-sm text-zinc-400">
                                            Найдено: {filteredFavorites.length} из {favorites.length}
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                                        {filteredFavorites.map((item) => (
                                            <div key={item.kinopoisk_id} className="relative group">
                                                <MovieCard movie={item.film_data} />
                                                <Button
                                                    onClick={() => handleRemoveFavorite(item.kinopoisk_id)}
                                                    variant="secondary"
                                                    size="sm"
                                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default ProfilePage

