import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Film } from 'lucide-react'
import { useGetPopularFilms, useGetFilmsByFilter } from '../api/kinopoisk/hooks'
import { useDebounce } from '../hooks/useDebounce'
import { LIST_OPTIONS } from '../api/kinopoisk/actions'
import MovieCard from '../components/features/movies/MovieCard'
import FilmFilters from '../components/features/movies/FilmFilters'
import ListTabs from '../components/features/movies/ListTabs'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

function HomePage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const isUpdatingURLRef = useRef(false)

    const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '')
    const [filters, setFilters] = useState(() => {
        const f = {}
        const type = searchParams.get('type')
        const genres = searchParams.get('genres')
        const countries = searchParams.get('countries')
        const yearFrom = searchParams.get('yearFrom')
        const yearTo = searchParams.get('yearTo')
        const ratingFrom = searchParams.get('ratingFrom')
        const ratingTo = searchParams.get('ratingTo')
        const ageRating = searchParams.get('ageRating')
        const sort = searchParams.get('sort')
        const list = searchParams.get('list')
        if (type) f.typeNumber = type
        if (genres) f.genres = genres
        if (countries) f.countries = countries
        if (list) f.lists = list
        if (yearFrom) f.yearFrom = parseInt(yearFrom)
        if (yearTo) f.yearTo = parseInt(yearTo)
        if (ratingFrom) f.ratingFrom = parseFloat(ratingFrom)
        if (ratingTo) f.ratingTo = parseFloat(ratingTo)
        if (ageRating) f.ageRating = ageRating
        if (sort) f.sort = sort
        return f
    })

    const debouncedSearchQuery = useDebounce(searchQuery.trim(), 500)

    useEffect(() => {
        if (isUpdatingURLRef.current) {
            isUpdatingURLRef.current = false
            return
        }
        setSearchQuery(searchParams.get('search') || '')
        const f = {}
        const type = searchParams.get('type')
        const genres = searchParams.get('genres')
        const countries = searchParams.get('countries')
        const yearFrom = searchParams.get('yearFrom')
        const yearTo = searchParams.get('yearTo')
        const ratingFrom = searchParams.get('ratingFrom')
        const ratingTo = searchParams.get('ratingTo')
        const ageRating = searchParams.get('ageRating')
        const sort = searchParams.get('sort')
        const list = searchParams.get('list')
        if (type) f.typeNumber = type
        if (genres) f.genres = genres
        if (countries) f.countries = countries
        if (list) f.lists = list
        if (yearFrom) f.yearFrom = parseInt(yearFrom)
        if (yearTo) f.yearTo = parseInt(yearTo)
        if (ratingFrom) f.ratingFrom = parseFloat(ratingFrom)
        if (ratingTo) f.ratingTo = parseFloat(ratingTo)
        if (ageRating) f.ageRating = ageRating
        if (sort) f.sort = sort
        setFilters(f)
    }, [searchParams])

    const hasActiveFilters = Object.keys(filters).filter(k => k !== 'lists').length > 0
    const activeList = filters.lists || ''
    const filterParams = {
        ...filters,
        query: debouncedSearchQuery || undefined
    }
    const shouldUseFilters = hasActiveFilters || !!debouncedSearchQuery || !!activeList
    const shouldUsePopular = !shouldUseFilters

    const popularMoviesQuery = useGetPopularFilms({
        enabled: !!shouldUsePopular
    })

    const filtersQuery = useGetFilmsByFilter(filterParams, {
        enabled: !!shouldUseFilters
    })

    const activeQuery = shouldUseFilters ? filtersQuery : popularMoviesQuery

    const movies = activeQuery.data?.pages.flatMap(page => page.docs || page.items || page.films || []) || []
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

    const updateURL = (newFilters, newSearch) => {
        isUpdatingURLRef.current = true
        const params = new URLSearchParams()
        if (newSearch?.trim()) params.set('search', newSearch.trim())
        if (newFilters.typeNumber) params.set('type', newFilters.typeNumber)
        if (newFilters.genres) params.set('genres', newFilters.genres)
        if (newFilters.countries) params.set('countries', newFilters.countries)
        if (newFilters.yearFrom) params.set('yearFrom', String(newFilters.yearFrom))
        if (newFilters.yearTo) params.set('yearTo', String(newFilters.yearTo))
        if (newFilters.ratingFrom !== undefined) params.set('ratingFrom', String(newFilters.ratingFrom))
        if (newFilters.ratingTo !== undefined) params.set('ratingTo', String(newFilters.ratingTo))
        if (newFilters.ageRating) params.set('ageRating', newFilters.ageRating)
        if (newFilters.sort) params.set('sort', newFilters.sort)
        if (newFilters.lists) params.set('list', newFilters.lists)
        setSearchParams(params, { replace: true })
    }

    useEffect(() => {
        const currentSearch = searchParams.get('search') || ''
        const urlFilters = {}
        const type = searchParams.get('type')
        const genres = searchParams.get('genres')
        const countries = searchParams.get('countries')
        const yearFrom = searchParams.get('yearFrom')
        const yearTo = searchParams.get('yearTo')
        const ratingFrom = searchParams.get('ratingFrom')
        const ratingTo = searchParams.get('ratingTo')
        const ageRating = searchParams.get('ageRating')
        const sort = searchParams.get('sort')
        if (type) urlFilters.typeNumber = type
        if (genres) urlFilters.genres = genres
        if (countries) urlFilters.countries = countries
        if (yearFrom) urlFilters.yearFrom = parseInt(yearFrom)
        if (yearTo) urlFilters.yearTo = parseInt(yearTo)
        if (ratingFrom) urlFilters.ratingFrom = parseFloat(ratingFrom)
        if (ratingTo) urlFilters.ratingTo = parseFloat(ratingTo)
        if (ageRating) urlFilters.ageRating = ageRating
        if (sort) urlFilters.sort = sort
        const list = searchParams.get('list')
        if (list) urlFilters.lists = list

        const searchMatch = (debouncedSearchQuery || '') === (currentSearch || '')
        const filtersMatch = JSON.stringify(filters) === JSON.stringify(urlFilters)

        if (!searchMatch || !filtersMatch) {
            isUpdatingURLRef.current = true
            updateURL(filters, debouncedSearchQuery)
        }
    }, [debouncedSearchQuery, filters])

    const handleSearchChange = (value) => {
        setSearchQuery(value)
    }

    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters)
    }

    const handleResetFilters = () => {
        setFilters({})
        setSearchQuery('')
        setSearchParams({}, { replace: true })
    }

    const handleListChange = (listValue) => {
        setFilters(prev => ({ ...prev, lists: listValue }))
    }

    return (
        <div className="w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-light text-zinc-100 mb-2 md:text-4xl lg:text-5xl">
                    Поиск фильмов
                </h1>
                <p className="text-zinc-400 text-sm">Найдите и смотрите любимые фильмы</p>
            </div>

            <form onSubmit={handleSearch} className="mb-6">
                <div className="flex flex-col gap-3 md:flex-row md:gap-3">
                    <Input
                        startContent={<Search className="w-5 h-5 text-zinc-500" />}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
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

            <ListTabs
                lists={LIST_OPTIONS}
                activeList={activeList}
                onListChange={handleListChange}
            />

            <div className="mb-6">
                <FilmFilters
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onReset={handleResetFilters}
                />
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-950/30 border border-red-800/50 text-red-400 rounded-lg text-sm">
                    {error.message || 'Не удалось загрузить фильмы. Проверьте API ключ.'}
                </div>
            )}

            {!loading && movies.length === 0 && !error && (
                <div className="text-center py-16 text-zinc-500">
                    <Film className="w-20 h-20 mx-auto mb-4 text-zinc-700" />
                    <p className="text-zinc-400">{shouldUseFilters ? 'Ничего не найдено' : 'Популярные фильмы загрузятся здесь'}</p>
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
