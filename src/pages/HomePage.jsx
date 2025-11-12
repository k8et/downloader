import { useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Film } from 'lucide-react'
import { useGetPopularFilms, useSearchFilms, useGetFilmsByFilter, useGetFilters } from '../api/kinopoisk/hooks'
import { useDebounce } from '../hooks/useDebounce'
import MovieCard from '../components/features/movies/MovieCard'
import FilmFilters from '../components/features/movies/FilmFilters'
import ContentTabs from '../components/features/movies/ContentTabs'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

function HomePage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const isUpdatingURLRef = useRef(false)
    const { data: filtersData } = useGetFilters()

    const getFiltersFromURL = () => {
        const filters = {}
        const type = searchParams.get('type')
        const order = searchParams.get('order')
        const genres = searchParams.get('genres')
        const countries = searchParams.get('countries')
        const yearFrom = searchParams.get('yearFrom')
        const yearTo = searchParams.get('yearTo')
        const ratingFrom = searchParams.get('ratingFrom')
        const ratingTo = searchParams.get('ratingTo')
        const tab = searchParams.get('tab')

        if (type) filters.type = type
        if (order) filters.order = order
        if (genres) filters.genres = parseInt(genres)
        if (countries) filters.countries = parseInt(countries)
        if (yearFrom) filters.yearFrom = parseInt(yearFrom)
        if (yearTo) filters.yearTo = parseInt(yearTo)
        if (ratingFrom) filters.ratingFrom = parseFloat(ratingFrom)
        if (ratingTo) filters.ratingTo = parseFloat(ratingTo)
        if (tab) filters.tab = tab

        return filters
    }

    const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '')
    const [filters, setFilters] = useState(() => getFiltersFromURL())
    const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'all')
    const debouncedSearchQuery = useDebounce(searchQuery.trim(), 500)

    const genres = filtersData?.genres || []
    const animeGenreId = useMemo(() => {
        const animeGenre = genres.find(g =>
            g.genre?.toLowerCase() === 'аниме' ||
            g.genre?.toLowerCase() === 'anime' ||
            g.genre?.toLowerCase() === 'мультфильм'
        )
        return animeGenre?.id
    }, [genres])

    useEffect(() => {
        if (isUpdatingURLRef.current) {
            isUpdatingURLRef.current = false
            return
        }

        const urlFilters = getFiltersFromURL()
        const urlSearch = searchParams.get('search') || ''
        const urlTab = searchParams.get('tab') || 'all'

        setFilters(urlFilters)
        setSearchQuery(urlSearch)
        setActiveTab(urlTab)
    }, [searchParams])

    const handleTabChange = (tab) => {
        setActiveTab(tab)
        const newFilters = { ...filters }

        if (tab === 'all') {
            delete newFilters.type
            delete newFilters.genres
            delete newFilters.tab
        } else if (tab === 'films') {
            newFilters.type = 'FILM'
            delete newFilters.genres
            newFilters.tab = 'films'
        } else if (tab === 'series') {
            newFilters.type = 'TV_SERIES'
            delete newFilters.genres
            newFilters.tab = 'series'
        } else if (tab === 'anime') {
            if (animeGenreId) {
                newFilters.genres = animeGenreId
            }
            delete newFilters.type
            newFilters.tab = 'anime'
        }

        setFilters(newFilters)
    }

    const hasActiveFilters = useMemo(() => {
        return Object.values(filters).some(value => {
            return value !== undefined && value !== null && value !== ''
        })
    }, [filters])

    const shouldUseFilters = hasActiveFilters
    const shouldUseSearch = !!debouncedSearchQuery && !hasActiveFilters
    const shouldUsePopular = !hasActiveFilters && !debouncedSearchQuery

    const popularMoviesQuery = useGetPopularFilms({
        enabled: !!shouldUsePopular
    })

    const searchMoviesQuery = useSearchFilms(debouncedSearchQuery, {
        enabled: !!shouldUseSearch
    })

    const filtersQuery = useGetFilmsByFilter(
        {
            ...filters,
            keyword: debouncedSearchQuery || undefined
        },
        {
            enabled: !!shouldUseFilters
        }
    )

    const activeQuery = shouldUseFilters
        ? filtersQuery
        : shouldUseSearch
            ? searchMoviesQuery
            : popularMoviesQuery

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

        if (newSearch && newSearch.trim()) {
            params.set('search', newSearch.trim())
        }

        if (newFilters.tab) {
            params.set('tab', newFilters.tab)
        }

        Object.entries(newFilters).forEach(([key, value]) => {
            if (key === 'tab') return
            if (value !== undefined && value !== null && value !== '') {
                params.set(key, String(value))
            }
        })

        setSearchParams(params, { replace: true })
    }

    useEffect(() => {
        const currentSearch = searchParams.get('search') || ''
        const currentFilters = getFiltersFromURL()

        const searchMatch = (debouncedSearchQuery || '') === (currentSearch || '')
        const filtersMatch = JSON.stringify(filters) === JSON.stringify(currentFilters)

        if (!searchMatch || !filtersMatch) {
            if (debouncedSearchQuery || Object.keys(filters).length > 0) {
                updateURL(filters, debouncedSearchQuery)
            } else {
                isUpdatingURLRef.current = true
                setSearchParams({}, { replace: true })
            }
        }
    }, [debouncedSearchQuery, filters])

    const handleSearchChange = (value) => {
        setSearchQuery(value)
    }

    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters)
    }

    const handleResetFilters = () => {
        const emptyFilters = {}
        setFilters(emptyFilters)
        setSearchQuery('')
        setSearchParams({}, { replace: true })
    }

    return (
        <div className="w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-light text-zinc-100 mb-2 md:text-4xl lg:text-5xl">
                    Поиск фильмов
                </h1>
                <p className="text-zinc-400 text-sm">Найдите, смотрите и скачивайте любимые фильмы</p>
            </div>

            <ContentTabs
                activeTab={activeTab}
                onTabChange={handleTabChange}
            />

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

