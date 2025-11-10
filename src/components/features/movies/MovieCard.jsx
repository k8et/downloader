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
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={handleClick}
        >
            {posterUrl ? (
                <div className="w-full aspect-[2/3] bg-gray-200 overflow-hidden">
                    <img
                        src={posterUrl}
                        alt={name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.style.display = 'none'
                        }}
                    />
                </div>
            ) : (
                <div className="w-full aspect-[2/3] bg-gray-200 flex items-center justify-center">
                    <Film className="w-16 h-16 text-gray-400" />
                </div>
            )}
            <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {name}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    {rating && (
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span>{typeof rating === 'number' ? rating.toFixed(1) : rating}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{year}</span>
                    </div>
                </div>
                {description && (
                    <p className="text-sm text-gray-600 line-clamp-3">
                        {description}
                    </p>
                )}
            </div>
        </div>
    )
}

export default MovieCard

