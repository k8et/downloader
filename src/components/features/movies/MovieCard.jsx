import { useNavigate } from 'react-router-dom'
import { Film, Star, Calendar } from 'lucide-react'

function MovieCard({ movie }) {
    const navigate = useNavigate()
    const kinopoiskId = movie.kinopoiskId || movie.filmId

    const handleClick = () => {
        if (kinopoiskId) {
            navigate(`/viewer/${kinopoiskId}`)
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
            className="bg-zinc-800 rounded-lg overflow-hidden hover:bg-zinc-700/50 transition-all cursor-pointer border border-zinc-700/50 hover:border-zinc-600 group"
            onClick={handleClick}
        >
            {posterUrl ? (
                <div className="w-full aspect-[2/3] bg-zinc-900 overflow-hidden">
                    <img
                        src={posterUrl}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            e.target.style.display = 'none'
                        }}
                    />
                </div>
            ) : (
                <div className="w-full aspect-[2/3] bg-zinc-900 flex items-center justify-center">
                    <Film className="w-16 h-16 text-zinc-600" />
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

