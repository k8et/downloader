import { useState } from 'react'
import { Search, Film } from 'lucide-react'
import { useGetPopularFilms, useSearchFilms } from '../api/kinopoisk/hooks'
import { useDebounce } from '../hooks/useDebounce'
import MovieCard from '../components/features/movies/MovieCard'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

function HomePage() {
    const [searchQuery, setSearchQuery] = useState('')
    const debouncedSearchQuery = useDebounce(searchQuery.trim(), 500)

    const popularMoviesQuery = useGetPopularFilms({
        enabled: !debouncedSearchQuery
    })

    const searchMoviesQuery = useSearchFilms(debouncedSearchQuery)

    const activeQuery = debouncedSearchQuery ? searchMoviesQuery : popularMoviesQuery

    const movies = activeQuery.data?.pages.flatMap(page => page.docs || []) || []
    const loading = activeQuery.isLoading || activeQuery.isFetchingNextPage
    const hasMore = activeQuery.hasNextPage
    const error = activeQuery.error

    const handleSearch = (e) => {
        e.preventDefault()
    }

    const handleLoadMore = () => {
        if (hasMore && !loading) {
            activeQuery.fetchNextPage()
        }
    }

    return (
        <div className="w-full ">
            <div className="bg-white rounded-lg p-4 shadow-2xl md:rounded-xl md:p-6 lg:rounded-2xl lg:p-10">
                <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center md:text-3xl lg:text-4xl">
                    Поиск фильмов
                </h1>

                <form onSubmit={handleSearch} className="mb-6">
                    <div className="flex flex-col gap-3 md:flex-row md:gap-2.5 lg:gap-3">
                        <Input
                            startContent={<Search className="w-5 h-5 text-gray-400" />}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Введите название фильма..."
                            className="flex-1 w-full"
                        />
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            disabled={loading}
                            className="whitespace-nowrap"
                        >
                            {loading ? 'Поиск...' : 'Найти'}
                        </Button>
                    </div>
                </form>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg border-l-4 border-red-600 text-sm">
                        {error.message || 'Не удалось загрузить фильмы. Проверьте API ключ.'}
                    </div>
                )}

                {!loading && movies.length === 0 && !error && (
                    <div className="text-center py-12 text-gray-500">
                        <Film className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p>Начните поиск фильмов</p>
                    </div>
                )}

                {movies.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {movies.map((movie, index) => (
                                <MovieCard
                                    key={movie.kinopoiskId || movie.filmId || index}
                                    movie={movie}
                                />
                            ))}
                        </div>

                        {hasMore && (
                            <div className="mt-6 text-center">
                                <Button
                                    onClick={handleLoadMore}
                                    variant="secondary"
                                    size="md"
                                    disabled={loading}
                                >
                                    {loading ? 'Загрузка...' : 'Загрузить еще'}
                                </Button>
                            </div>
                        )}
                    </>
                )}

                {loading && movies.length === 0 && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                        <p className="mt-4 text-gray-600">Загрузка...</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default HomePage

