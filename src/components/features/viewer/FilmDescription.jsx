import { Star, Calendar, Clock, Film as FilmIcon } from 'lucide-react'

function FilmDescription({ film }) {
    if (!film) return null

    const name = film.nameRu || film.nameEn || film.nameOriginal || 'Без названия'
    const description = film.description || film.shortDescription || ''
    const year = film.year || null
    const rating = film.ratingKinopoisk || film.ratingImdb || null
    const filmLength = film.filmLength || null
    const genres = film.genres || []
    const countries = film.countries || []

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-4">
                    {name}
                </h1>
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

