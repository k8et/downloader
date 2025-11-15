import { useParams } from 'react-router-dom'
import { Loader2, Calendar, Film, Star } from 'lucide-react'
import { useGetPersonById } from '../api/kinopoisk/hooks'
import MovieCard from '../components/features/movies/MovieCard'

function PersonPage() {
    const { personId } = useParams()

    const { data: personData, isLoading, error } = useGetPersonById(personId, {
        enabled: !!personId
    })

    if (isLoading) {
        return (
            <div className="w-full flex items-center justify-center py-16">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 text-zinc-400 animate-spin" />
                    <p className="text-zinc-400">Загрузка информации о персоне...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="w-full">
                <div className="mb-6 p-4 bg-red-950/30 border border-red-800/50 text-red-400 rounded-lg text-sm">
                    {error.message || 'Ошибка загрузки информации о персоне'}
                </div>
            </div>
        )
    }

    if (!personData) {
        return (
            <div className="w-full">
                <div className="mb-6 p-4 bg-zinc-800/30 border border-zinc-700/50 text-zinc-400 rounded-lg text-sm">
                    Информация о персоне не найдена
                </div>
            </div>
        )
    }

    const name = personData.nameRu || personData.nameEn || 'Без имени'
    const films = personData.films || []

    return (
        <div className="w-full space-y-8">
            <div className="flex flex-col md:flex-row gap-6">
                {personData.posterUrl ? (
                    <div className="flex-shrink-0 w-full md:w-64">
                        <div className="w-full aspect-[2/3] bg-zinc-900 rounded-lg overflow-hidden">
                            <img
                                src={personData.posterUrl}
                                alt={name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.style.display = 'none'
                                }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex-shrink-0 w-full md:w-64">
                        <div className="w-full aspect-[2/3] bg-zinc-900 rounded-lg flex items-center justify-center">
                            <Film className="w-24 h-24 text-zinc-600" />
                        </div>
                    </div>
                )}

                <div className="flex-1 space-y-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-4">
                            {name}
                        </h1>
                        {personData.profession && (
                            <p className="text-lg text-zinc-400 mb-4">
                                {personData.profession}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {personData.birthday && (
                            <div className="flex items-center gap-2 text-zinc-300">
                                <Calendar className="w-4 h-4 text-blue-500" />
                                <span>
                                    {personData.birthday}
                                    {personData.age && ` (${personData.age} лет)`}
                                </span>
                            </div>
                        )}
                        {personData.birthplace && (
                            <div className="flex items-start gap-2 text-zinc-300">
                                <span className="text-blue-500">📍</span>
                                <span>{personData.birthplace}</span>
                            </div>
                        )}
                        {personData.growth && (
                            <div className="flex items-center gap-2 text-zinc-300">
                                <span className="text-blue-500">📏</span>
                                <span>Рост: {personData.growth} см</span>
                            </div>
                        )}
                    </div>

                    {personData.facts && personData.facts.length > 0 && (
                        <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-lg p-6">
                            <h2 className="text-lg font-medium text-zinc-200 mb-3">Интересные факты</h2>
                            <ul className="space-y-2">
                                {personData.facts.map((fact, index) => (
                                    <li key={index} className="text-zinc-300 text-sm">
                                        • {fact}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {films.length > 0 && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-light text-zinc-100 flex items-center gap-2">
                        <Film className="w-6 h-6 text-blue-500" />
                        Фильмы ({films.length})
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {films.map((film) => {
                            const filmData = {
                                kinopoiskId: film.filmId,
                                filmId: film.filmId,
                                nameRu: film.nameRu,
                                nameEn: film.nameEn,
                                nameOriginal: film.nameOriginal,
                                rating: film.rating,
                                description: film.description,
                                year: null
                            }
                            return (
                                <MovieCard key={film.filmId} movie={filmData} />
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

export default PersonPage

