import { useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Film, TrendingUp, Award, Tv } from 'lucide-react'
import { useGetFilmsFromCollection, useSearchFilms, useGetFilmsByFilter, useGetFilters } from '../api/kinopoisk/hooks'
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
        const excludeRussia = searchParams.get('excludeRussia')

        if (type) filters.type = type
        if (order) filters.order = order
        if (genres) filters.genres = parseInt(genres)
        if (countries) filters.countries = parseInt(countries)
        if (yearFrom) filters.yearFrom = parseInt(yearFrom)
        if (yearTo) filters.yearTo = parseInt(yearTo)
        if (ratingFrom) filters.ratingFrom = parseFloat(ratingFrom)
        if (ratingTo) filters.ratingTo = parseFloat(ratingTo)
        if (tab) filters.tab = tab
        const showRussian = searchParams.get('showRussian') === '1'
        filters.excludeRussia = showRussian ? false : (excludeRussia !== '0' && excludeRussia !== 'false')

        return filters
    }

    const isRussianFilm = (movie) => {
        const countries = movie.countries || []
        const russianLabels = ['россия', 'russia', 'ссср', 'ussr', 'советский']
        return countries.some(c => {
            const name = (c.country || '').toLowerCase()
            return russianLabels.some(label => name.includes(label))
        })
    }

    const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '')
    const [filters, setFilters] = useState(() => getFiltersFromURL())
    const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'all')
    const [listMode, setListMode] = useState(() => searchParams.get('mode') || 'popular')
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
        const urlMode = searchParams.get('mode') || 'popular'

        setFilters(urlFilters)
        setSearchQuery(urlSearch)
        setActiveTab(urlTab)
        setListMode(urlMode)
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
        return Object.entries(filters).some(([key, value]) => {
            if (key === 'excludeRussia') return false
            return value !== undefined && value !== null && value !== ''
        })
    }, [filters])

    const shouldUseFilters = hasActiveFilters
    const shouldUseSearch = !!debouncedSearchQuery && !hasActiveFilters
    const shouldUseCollection = !hasActiveFilters && !debouncedSearchQuery

    const collectionTypeMap = {
        popular: 'TOP_POPULAR_ALL',
        top250: 'TOP_250_MOVIES',
        top250tv: 'TOP_250_TV_SHOWS'
    }
    const collectionType = collectionTypeMap[listMode] || 'TOP_POPULAR_ALL'
    const collectionQuery = useGetFilmsFromCollection(collectionType, {
        enabled: !!shouldUseCollection
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
            : collectionQuery

    const rawMovies = activeQuery.data?.pages.flatMap(page => page.docs || page.items || page.films || []) || []
    const movies = useMemo(() => {
        const seen = new Set()
        let result = rawMovies.filter(m => {
            const id = m.kinopoiskId ?? m.filmId
            if (id && seen.has(id)) return false
            if (id) seen.add(id)
            return true
        })
        if (filters.excludeRussia === false) return result
        return result.filter(m => !isRussianFilm(m))
    }, [rawMovies, filters.excludeRussia])
    const loading = activeQuery.isLoading || activeQuery.isFetchingNextPage
    const hasMore = activeQuery.hasNextPage
    const error = activeQuery.error

    const handleSearch = (e) => {
        e.preventDefault()
    }

    const loadMoreRef = useRef(null)
    const fetchNextPageRef = useRef(activeQuery.fetchNextPage)
    fetchNextPageRef.current = activeQuery.fetchNextPage

    useEffect(() => {
        if (!hasMore || loading) return

        const el = loadMoreRef.current
        if (!el) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (!entries[0]?.isIntersecting) return
                if (!fetchNextPageRef.current) return
                fetchNextPageRef.current()
            },
            { rootMargin: '200px' }
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [hasMore, loading])

    const updateURL = (newFilters, newSearch) => {
        isUpdatingURLRef.current = true
        const params = new URLSearchParams()

        if (newSearch && newSearch.trim()) {
            params.set('search', newSearch.trim())
        }

        if (newFilters.tab) {
            params.set('tab', newFilters.tab)
        }

        if (listMode !== 'popular') {
            params.set('mode', listMode)
        }

        if (searchParams.get('showRussian') === '1') {
            params.set('showRussian', '1')
        }

        Object.entries(newFilters).forEach(([key, value]) => {
            if (key === 'tab' || key === 'excludeRussia') return
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

        const modeMatch = listMode === (searchParams.get('mode') || 'popular')
        if (!searchMatch || !filtersMatch || !modeMatch) {
            if (debouncedSearchQuery || Object.keys(filters).length > 0 || listMode !== 'popular') {
                updateURL(filters, debouncedSearchQuery)
            } else {
                isUpdatingURLRef.current = true
                setSearchParams({}, { replace: true })
            }
        }
    }, [debouncedSearchQuery, filters, listMode])

    const handleSearchChange = (value) => {
        setSearchQuery(value)
    }

    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters)
    }

    const handleResetFilters = () => {
        const emptyFilters = { excludeRussia: false }
        setFilters(emptyFilters)
        setSearchQuery('')
        setSearchParams({}, { replace: true })
    }

    const handleListModeChange = (mode) => {
        setListMode(mode)
        isUpdatingURLRef.current = true
        const params = new URLSearchParams(searchParams)
        if (mode === 'popular') {
            params.delete('mode')
        } else {
            params.set('mode', mode)
        }
        setSearchParams(params, { replace: true })
    }

    return (
        <div className="w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-light text-zinc-100 mb-2 md:text-4xl lg:text-5xl">
                    Поиск фильмов
                </h1>
                <p className="text-zinc-400 text-sm">Найдите и смотрите любимые фильмы</p>
            </div>

            <ContentTabs
                activeTab={activeTab}
                onTabChange={handleTabChange}
            />

            {shouldUseCollection && (
                <div className="mb-6 flex gap-2">
                    <button
                        onClick={() => handleListModeChange('popular')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${listMode === 'popular'
                            ? 'bg-blue-600 text-white'
                            : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-200'
                            }`}
                    >
                        <TrendingUp className="w-4 h-4" />
                        Популярное
                    </button>
                    <button
                        onClick={() => handleListModeChange('top250')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${listMode === 'top250'
                            ? 'bg-blue-600 text-white'
                            : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-200'
                            }`}
                    >
                        <Award className="w-4 h-4" />
                        Топ 250
                    </button>
                    <button
                        onClick={() => handleListModeChange('top250tv')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${listMode === 'top250tv'
                            ? 'bg-blue-600 text-white'
                            : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-200'
                            }`}
                    >
                        <Tv className="w-4 h-4" />
                        Топ 250 сериалов
                    </button>
                </div>
            )}

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

                    {hasMore && <div ref={loadMoreRef} className="h-1" />}

                    {loading && movies.length > 0 && (
                        <div className="mt-6 flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-zinc-700 border-t-blue-500" />
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

