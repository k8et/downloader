import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Film, Star, Calendar, X } from 'lucide-react'
import { useSearchFilms } from '../../../api/kinopoisk/hooks'
import { useDebounce } from '../../../hooks/useDebounce'

function FilmSearch() {
    const [query, setQuery] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [focusedIndex, setFocusedIndex] = useState(-1)
    const debouncedQuery = useDebounce(query, 300)
    const navigate = useNavigate()
    const containerRef = useRef(null)
    const inputRef = useRef(null)
    const dropdownRef = useRef(null)

    const { data, isLoading, isError } = useSearchFilms(debouncedQuery, {
        enabled: debouncedQuery.trim().length > 2
    })

    const films = data?.pages?.[0]?.docs || []
    const hasResults = films.length > 0 && debouncedQuery.trim().length > 2
    const showDropdown = isOpen && (hasResults || isLoading || isError)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false)
                setFocusedIndex(-1)
            }
        }

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false)
                setQuery('')
                setFocusedIndex(-1)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleEscape)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEscape)
        }
    }, [])

    useEffect(() => {
        if (debouncedQuery.trim().length > 2) {
            setIsOpen(true)
        }
    }, [debouncedQuery])

    const handleInputChange = (e) => {
        setQuery(e.target.value)
        setIsOpen(true)
        setFocusedIndex(-1)
    }

    const handleInputFocus = () => {
        if (debouncedQuery.trim().length > 2) {
            setIsOpen(true)
        }
    }

    const handleFilmClick = (film) => {
        const kinopoiskId = film.kinopoiskId || film.filmId
        if (kinopoiskId) {
            navigate(`/viewer/${kinopoiskId}`)
            setIsOpen(false)
            setQuery('')
            setFocusedIndex(-1)
        }
    }

    const handleKeyDown = (e) => {
        if (!showDropdown) return

        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setFocusedIndex(prev => prev < films.length - 1 ? prev + 1 : prev)
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setFocusedIndex(prev => prev > 0 ? prev - 1 : -1)
        } else if (e.key === 'Enter' && focusedIndex >= 0 && films[focusedIndex]) {
            e.preventDefault()
            handleFilmClick(films[focusedIndex])
        }
    }

    const formatFilmName = (film) => {
        return film.nameRu || film.nameEn || film.nameOriginal || 'Без названия'
    }

    const formatRating = (film) => {
        if (film.ratingKinopoisk) return film.ratingKinopoisk
        if (film.ratingImdb) return film.ratingImdb
        return null
    }

    return (
        <div ref={containerRef} className="relative w-full md:max-w-md">
            <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <Search className="w-5 h-5 text-zinc-500" />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onKeyDown={handleKeyDown}
                    placeholder="Поиск..."
                    className="w-full pl-10 pr-10 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 transition-all focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                {query && (
                    <button
                        onClick={() => {
                            setQuery('')
                            setIsOpen(false)
                            inputRef.current?.focus()
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-zinc-700 transition-colors"
                    >
                        <X className="w-4 h-4 text-zinc-400 hover:text-zinc-200" />
                    </button>
                )}
            </div>

            {showDropdown && (
                <div
                    ref={dropdownRef}
                    className="absolute top-full left-0 right-0 mt-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto"
                >
            {isLoading ? (
                <div className="p-4 text-center text-zinc-400 text-sm">
                    Поиск...
                </div>
            ) : isError ? (
                <div className="p-4 text-center text-red-400 text-sm">
                    Ошибка при поиске
                </div>
            ) : hasResults ? (
                <div className="py-2">
                    {films.slice(0, 8).map((film, index) => {
                        const kinopoiskId = film.kinopoiskId || film.filmId
                        const name = formatFilmName(film)
                        const rating = formatRating(film)
                        const year = film.year
                        const posterUrl = film.posterUrlPreview || film.posterUrl

                        return (
                            <button
                                key={kinopoiskId || index}
                                onClick={() => handleFilmClick(film)}
                                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-zinc-700/50 transition-colors text-left ${focusedIndex === index ? 'bg-zinc-700/50' : ''
                                    }`}
                                onMouseEnter={() => setFocusedIndex(index)}
                            >
                                {posterUrl ? (
                                    <div className="flex-shrink-0 w-12 h-16 bg-zinc-900 rounded overflow-hidden">
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
                                    <div className="flex-shrink-0 w-12 h-16 bg-zinc-900 rounded flex items-center justify-center">
                                        <Film className="w-6 h-6 text-zinc-600" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-zinc-100 truncate mb-1">
                                        {name}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                                        {rating && (
                                            <div className="flex items-center gap-1">
                                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                <span>{typeof rating === 'number' ? rating.toFixed(1) : rating}</span>
                                            </div>
                                        )}
                                        {year && (
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                <span>{year}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </button>
                        )
                    })}
                    {films.length > 8 && (
                        <div className="px-4 py-2 text-xs text-zinc-500 text-center border-t border-zinc-700">
                            Показано {8} из {films.length} результатов
                        </div>
                    )}
                </div>
            ) : debouncedQuery.trim().length > 2 ? (
                <div className="p-4 text-center text-zinc-400 text-sm">
                    Ничего не найдено
                </div>
            ) : null}
                </div>
            )}
        </div>
    )
}

export default FilmSearch

