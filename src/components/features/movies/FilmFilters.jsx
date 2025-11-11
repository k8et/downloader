import { useState, useEffect, useMemo } from 'react'
import { Filter, X, ChevronDown, ChevronUp, Check } from 'lucide-react'
import { useGetFilters } from '../../../api/kinopoisk/hooks'
import Button from '../../ui/Button'
import Input from '../../ui/Input'
import Select from '../../ui/Select'

const FILM_TYPES = [
    { value: 'ALL', label: 'Все' },
    { value: 'FILM', label: 'Фильмы' },
    { value: 'TV_SERIES', label: 'Сериалы' },
    { value: 'MINI_SERIES', label: 'Мини-сериалы' },
    { value: 'TV_SHOW', label: 'ТВ-шоу' }
]

const SORT_OPTIONS = [
    { value: 'RATING', label: 'По рейтингу' },
    { value: 'NUM_VOTE', label: 'По количеству оценок' },
    { value: 'YEAR', label: 'По году' }
]

function FilmFilters({ filters, onFiltersChange, onReset }) {
    const [isExpanded, setIsExpanded] = useState(false)
    const { data: filtersData, isLoading } = useGetFilters()

    const [localFilters, setLocalFilters] = useState({
        type: filters.type,
        order: filters.order,
        genres: filters.genres,
        countries: filters.countries,
        yearFrom: filters.yearFrom,
        yearTo: filters.yearTo,
        ratingFrom: filters.ratingFrom,
        ratingTo: filters.ratingTo
    })

    const genres = filtersData?.genres || []
    const countries = filtersData?.countries || []

    const hasActiveFilters = Object.values(filters).some(value => {
        return value !== undefined && value !== null && value !== ''
    })

    useEffect(() => {
        setLocalFilters({
            type: filters.type,
            order: filters.order,
            genres: filters.genres,
            countries: filters.countries,
            yearFrom: filters.yearFrom,
            yearTo: filters.yearTo,
            ratingFrom: filters.ratingFrom,
            ratingTo: filters.ratingTo
        })
    }, [filters])

    const handleLocalFilterChange = (key, value) => {
        setLocalFilters(prev => ({
            ...prev,
            [key]: value
        }))
    }

    const handleApplyFilters = () => {
        const appliedFilters = {
            type: localFilters.type === 'ALL' ? undefined : localFilters.type,
            order: localFilters.order === 'RATING' ? undefined : localFilters.order,
            genres: localFilters.genres,
            countries: localFilters.countries,
            yearFrom: localFilters.yearFrom ? parseInt(localFilters.yearFrom) : undefined,
            yearTo: localFilters.yearTo ? parseInt(localFilters.yearTo) : undefined,
            ratingFrom: localFilters.ratingFrom ? parseFloat(localFilters.ratingFrom) : undefined,
            ratingTo: localFilters.ratingTo ? parseFloat(localFilters.ratingTo) : undefined
        }

        Object.keys(appliedFilters).forEach(key => {
            if (appliedFilters[key] === undefined || appliedFilters[key] === null || appliedFilters[key] === '') {
                delete appliedFilters[key]
            }
        })

        onFiltersChange(appliedFilters)
    }

    const handleReset = () => {
        const emptyFilters = {
            type: undefined,
            order: undefined,
            genres: undefined,
            countries: undefined,
            yearFrom: undefined,
            yearTo: undefined,
            ratingFrom: undefined,
            ratingTo: undefined
        }
        setLocalFilters(emptyFilters)
        onReset()
    }

    const hasLocalChanges = useMemo(() => {
        const currentFilters = {
            type: filters.type,
            order: filters.order,
            genres: filters.genres,
            countries: filters.countries,
            yearFrom: filters.yearFrom,
            yearTo: filters.yearTo,
            ratingFrom: filters.ratingFrom,
            ratingTo: filters.ratingTo
        }

        const normalizedLocal = {
            type: localFilters.type === 'ALL' ? undefined : localFilters.type,
            order: localFilters.order === 'RATING' ? undefined : localFilters.order,
            genres: localFilters.genres,
            countries: localFilters.countries,
            yearFrom: localFilters.yearFrom ? parseInt(localFilters.yearFrom) : undefined,
            yearTo: localFilters.yearTo ? parseInt(localFilters.yearTo) : undefined,
            ratingFrom: localFilters.ratingFrom ? parseFloat(localFilters.ratingFrom) : undefined,
            ratingTo: localFilters.ratingTo ? parseFloat(localFilters.ratingTo) : undefined
        }

        return JSON.stringify(currentFilters) !== JSON.stringify(normalizedLocal)
    }, [localFilters, filters])

    return (
        <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-zinc-700/30 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-zinc-400" />
                    <span className="font-medium text-zinc-200">Фильтры</span>
                    {hasActiveFilters && (
                        <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                            Активно
                        </span>
                    )}
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-zinc-400" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-zinc-400" />
                )}
            </button>

            {isExpanded && (
                <div className="p-4 border-t border-zinc-700/50 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Тип"
                            value={localFilters.type || 'ALL'}
                            onChange={(e) => handleLocalFilterChange('type', e.target.value)}
                        >
                            {FILM_TYPES.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </Select>

                        <Select
                            label="Сортировка"
                            value={localFilters.order || 'RATING'}
                            onChange={(e) => handleLocalFilterChange('order', e.target.value)}
                        >
                            {SORT_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {!isLoading && genres.length > 0 && (
                            <Select
                                label="Жанр"
                                value={localFilters.genres || ''}
                                onChange={(e) => handleLocalFilterChange('genres', e.target.value ? parseInt(e.target.value) : undefined)}
                                placeholder="Выберите жанр"
                                searchable={true}
                                searchPlaceholder="Поиск жанра..."
                                options={genres.map(genre => ({
                                    value: genre.id,
                                    label: genre.genre.charAt(0).toUpperCase() + genre.genre.slice(1)
                                }))}
                            />
                        )}

                        {!isLoading && countries.length > 0 && (
                            <Select
                                label="Страна"
                                value={localFilters.countries || ''}
                                onChange={(e) => handleLocalFilterChange('countries', e.target.value ? parseInt(e.target.value) : undefined)}
                                placeholder="Выберите страну"
                                searchable={true}
                                searchPlaceholder="Поиск страны..."
                                options={countries.map(country => ({
                                    value: country.id,
                                    label: country.country.charAt(0).toUpperCase() + country.country.slice(1)
                                }))}
                            />
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Год от"
                            numeric={true}
                            value={localFilters.yearFrom || ''}
                            onChange={(e) => handleLocalFilterChange('yearFrom', e.target.value)}
                            placeholder="1900"
                        />

                        <Input
                            label="Год до"
                            numeric={true}
                            value={localFilters.yearTo || ''}
                            onChange={(e) => handleLocalFilterChange('yearTo', e.target.value)}
                            placeholder="2024"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Рейтинг от"
                            numeric={true}
                            value={localFilters.ratingFrom || ''}
                            onChange={(e) => handleLocalFilterChange('ratingFrom', e.target.value)}
                            placeholder="0"
                        />

                        <Input
                            label="Рейтинг до"
                            numeric={true}
                            value={localFilters.ratingTo || ''}
                            onChange={(e) => handleLocalFilterChange('ratingTo', e.target.value)}
                            placeholder="10"
                        />
                    </div>



                    <div className="flex justify-end gap-2 pt-4 border-t border-zinc-700/50">
                        {hasActiveFilters && (
                            <Button
                                className="flex h-10 items-center"
                                onClick={handleReset}
                                variant="secondary"
                                size="sm"
                            >
                                <X className="w-4 h-4 mr-1" />
                                Сбросить
                            </Button>
                        )}
                        {hasLocalChanges && (
                            <Button
                                className="flex h-10 items-center"
                                onClick={handleApplyFilters}
                                variant="primary"
                                size="sm"
                            >
                                <Check className="w-4 h-4 mr-1" />
                                Применить
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default FilmFilters

