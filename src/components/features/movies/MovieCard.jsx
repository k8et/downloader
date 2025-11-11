import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Film, Star, Calendar, Heart } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import { addToFavorites, removeFromFavorites } from '../../../lib/supabaseQueries'
import { useIsFavorite } from '../../../api/supabase/hooks'

function MovieCard({ movie }) {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { user } = useAuth()
    const kinopoiskId = movie.kinopoiskId || movie.filmId
    const [loading, setLoading] = useState(false)

    const { data: favorite = false, isLoading: checkingFavorite } = useIsFavorite(
        user?.id,
        kinopoiskId,
        {
            enabled: !!user && !!kinopoiskId
        }
    )

    const handleClick = () => {
        if (kinopoiskId) {
            navigate(`/viewer/${kinopoiskId}`)
        }
    }

    const handleFavoriteClick = async (e) => {
        e.stopPropagation()
        if (!user) {
            navigate('/login')
            return
        }

        if (loading || checkingFavorite) return

        setLoading(true)
        const wasFavorite = favorite

        try {
            if (wasFavorite) {
                await removeFromFavorites(user.id, kinopoiskId)
                queryClient.setQueryData(['isFavorite', user.id, kinopoiskId], false)
                queryClient.invalidateQueries({ queryKey: ['favorites', user.id] })
            } else {
                await addToFavorites(user.id, movie)
                queryClient.setQueryData(['isFavorite', user.id, kinopoiskId], true)
                queryClient.invalidateQueries({ queryKey: ['favorites', user.id] })
            }
        } catch (error) {
            console.error('Error toggling favorite:', error)
            queryClient.setQueryData(['isFavorite', user.id, kinopoiskId], wasFavorite)
        } finally {
            setLoading(false)
        }
    }
    const posterUrl = movie.posterUrlPreview || movie.posterUrl || null
    const name = movie.nameRu || movie.nameEn || movie.nameOriginal || 'Без названия'

    let rating = null
    if (movie.ratingKinopoisk) {
        rating = movie.ratingKinopoisk
    } else if (movie.ratingImdb) {
        rating = movie.ratingImdb
    } else if (movie.rating) {
        const ratingStr = String(movie.rating).replace('%', '')
        const ratingNum = parseFloat(ratingStr)
        if (!isNaN(ratingNum)) {
            rating = ratingNum
        }
    }

    const year = movie.year || '—'
    const description = movie.description || movie.shortDescription || ''

    return (
        <div
            className="bg-zinc-800 rounded-lg overflow-hidden hover:bg-zinc-700/50 transition-all cursor-pointer border border-zinc-700/50 hover:border-zinc-600 group relative"
            onClick={handleClick}
        >
            {posterUrl ? (
                <div className="w-full aspect-[2/3] bg-zinc-900 overflow-hidden relative">
                    <img
                        src={posterUrl}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            e.target.style.display = 'none'
                        }}
                    />
                    {user && (
                        <button
                            onClick={handleFavoriteClick}
                            disabled={loading}
                            className={`absolute top-2 right-2 p-2 rounded-full bg-zinc-900/70 backdrop-blur-sm transition-all hover:bg-zinc-800/90 ${favorite ? 'text-red-500' : 'text-zinc-400 hover:text-red-500'
                                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Heart className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} />
                        </button>
                    )}
                </div>
            ) : (
                <div className="w-full aspect-[2/3] bg-zinc-900 flex items-center justify-center relative">
                    <Film className="w-16 h-16 text-zinc-600" />
                    {user && (
                        <button
                            onClick={handleFavoriteClick}
                            disabled={loading}
                            className={`absolute top-2 right-2 p-2 rounded-full bg-zinc-800/70 backdrop-blur-sm transition-all hover:bg-zinc-700/90 ${favorite ? 'text-red-500' : 'text-zinc-400 hover:text-red-500'
                                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Heart className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} />
                        </button>
                    )}
                </div>
            )}
            <div className="p-4">
                <h3 className="font-semibold text-base mb-2 line-clamp-2 text-zinc-100 group-hover:text-white transition-colors">
                    {name}
                </h3>
                <div className="flex items-center gap-4 text-xs text-zinc-400 mb-2">
                    {rating && (
                        <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span className="font-medium">{typeof rating === 'number' ? rating.toFixed(1) : rating}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{year}</span>
                    </div>
                </div>
                {description && (
                    <p className="text-xs text-zinc-500 line-clamp-2">
                        {description}
                    </p>
                )}
            </div>
        </div>
    )
}

export default MovieCard

