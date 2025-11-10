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
        <div className="w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-light text-zinc-100 mb-2 md:text-4xl lg:text-5xl">
                    Поиск фильмов
                </h1>
                <p className="text-zinc-400 text-sm">Найдите и скачайте любимые фильмы</p>
            </div>

            <form onSubmit={handleSearch} className="mb-8">
                <div className="flex flex-col gap-3 md:flex-row md:gap-3">
                    <Input
                        startContent={<Search className="w-5 h-5 text-zinc-500" />}
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
                <div className="mb-6 p-4 bg-red-950/30 border border-red-800/50 text-red-400 rounded-lg text-sm">
                    {error.message || 'Не удалось загрузить фильмы. Проверьте API ключ.'}
                </div>
            )}

            {!loading && movies.length === 0 && !error && (
                <div className="text-center py-16 text-zinc-500">
                    <Film className="w-20 h-20 mx-auto mb-4 text-zinc-700" />
                    <p className="text-zinc-400">Начните поиск фильмов</p>
                </div>
            )}

            {movies.length > 0 && (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
                        {movies.map((movie, index) => (
                            <MovieCard
                                key={movie.kinopoiskId || movie.filmId || index}
                                movie={movie}
                            />
                        ))}
                    </div>

                    {hasMore && (
                        <div className="mt-8 text-center">
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
                <div className="text-center py-16">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-zinc-700 border-t-blue-500"></div>
                    <p className="mt-4 text-zinc-400">Загрузка...</p>
                </div>
            )}
        </div>
    )
}

export default HomePage

