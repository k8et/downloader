import { Star, Calendar, Clock, Film as FilmIcon, Heart } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import { useIsFavorite, useAddToFavorites, useRemoveFromFavorites } from '../../../api/supabase/hooks'

function FilmDescription({ film }) {
    if (!film) return null

    const { user } = useAuth()
    const kinopoiskId = film.kinopoiskId || film.filmId
    const { data: isFavoriteData } = useIsFavorite(user?.id, kinopoiskId ? parseInt(kinopoiskId) : null)
    const addToFavoritesMutation = useAddToFavorites()
    const removeFromFavoritesMutation = useRemoveFromFavorites()

    const name = film.nameRu || film.nameEn || film.nameOriginal || 'Без названия'
    const description = film.description || film.shortDescription || ''
    const year = film.year || null
    const rating = film.ratingKinopoisk || film.ratingImdb || null
    const filmLength = film.filmLength || null
    const genres = film.genres || []
    const countries = film.countries || []
    const isFavorite = isFavoriteData || false

    const handleFavoriteToggle = async () => {
        if (!user || !kinopoiskId) return

        const filmKinopoiskId = parseInt(kinopoiskId)

        try {
            if (isFavorite) {
                await removeFromFavoritesMutation.mutateAsync({
                    userId: user.id,
                    kinopoiskId: filmKinopoiskId
                })
            } else {
                await addToFavoritesMutation.mutateAsync({
                    userId: user.id,
                    filmData: film
                })
            }
        } catch (error) {
            console.error('Error toggling favorite:', error)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 flex-1">
                        {name}
                    </h1>
                    {user && (
                        <button
                            onClick={handleFavoriteToggle}
                            disabled={addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending}
                            className={`flex-shrink-0 p-3 rounded-lg transition-all ${isFavorite
                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50'
                                : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50 border border-zinc-700/50 hover:text-zinc-300'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                        >
                            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                        </button>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400 mb-4">
                    {rating && (
                        <div className="flex items-center gap-1.5">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span className="font-medium text-zinc-300">{rating}</span>
                        </div>
                    )}
                    {year && (
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <span>{year}</span>
                        </div>
                    )}
                    {filmLength && (
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            <span>{filmLength} мин</span>
                        </div>
                    )}
                </div>
                {(genres.length > 0 || countries.length > 0) && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {genres.map((genre, idx) => (
                            <span
                                key={idx}
                                className="px-3 py-1 bg-zinc-800/50 border border-zinc-700/50 rounded-full text-xs text-zinc-300"
                            >
                                {genre.genre.charAt(0).toUpperCase() + genre.genre.slice(1)}
                            </span>
                        ))}
                        {countries.map((country, idx) => (
                            <span
                                key={idx}
                                className="px-3 py-1 bg-zinc-800/50 border border-zinc-700/50 rounded-full text-xs text-zinc-300"
                            >
                                {country.country}
                            </span>
                        ))}
                    </div>
                )}
            </div>
            {description && (
                <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-lg p-6">
                    <h2 className="text-lg font-medium text-zinc-200 mb-3 flex items-center gap-2">
                        <FilmIcon className="w-5 h-5 text-blue-500" />
                        Описание
                    </h2>
                    <p className="text-zinc-300 leading-relaxed whitespace-pre-line">
                        {description}
                    </p>
                </div>
            )}
        </div>
    )
}

export default FilmDescription

