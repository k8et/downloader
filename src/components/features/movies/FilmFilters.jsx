import { useState, useEffect } from 'react'
import { Filter, X } from 'lucide-react'
import { GENRES, COUNTRIES, SORT_OPTIONS } from '../../../api/kinopoisk/actions'
import Select from '../../ui/Select'
import Button from '../../ui/Button'

const TYPE_OPTIONS = [
    { value: '', label: 'Всё' },
    { value: '1', label: 'Фильмы' },
    { value: '2', label: 'Сериалы' }
]

const AGE_OPTIONS = [
    { value: '', label: 'Любой' },
    { value: '0', label: '0+' },
    { value: '6', label: '6+' },
    { value: '12', label: '12+' },
    { value: '16', label: '16+' },
    { value: '18', label: '18+' }
]

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: currentYear - 1890 + 1 }, (_, i) => currentYear - i)

function FilmFilters({ filters, onFiltersChange, onReset }) {
    const [localFilters, setLocalFilters] = useState({
        typeNumber: filters.typeNumber || '',
        genres: filters.genres || '',
        countries: filters.countries || '',
        yearFrom: filters.yearFrom || '',
        yearTo: filters.yearTo || '',
        ratingFrom: filters.ratingFrom ?? '',
        ratingTo: filters.ratingTo ?? '',
        ageRating: filters.ageRating || '',
        sort: filters.sort || 'rating.kp:-1'
    })

    useEffect(() => {
        setLocalFilters({
            typeNumber: filters.typeNumber || '',
            genres: filters.genres || '',
            countries: filters.countries || '',
            yearFrom: filters.yearFrom || '',
            yearTo: filters.yearTo || '',
            ratingFrom: filters.ratingFrom ?? '',
            ratingTo: filters.ratingTo ?? '',
            ageRating: filters.ageRating || '',
            sort: filters.sort || 'rating.kp:-1'
        })
    }, [filters.typeNumber, filters.genres, filters.countries, filters.yearFrom, filters.yearTo, filters.ratingFrom, filters.ratingTo, filters.ageRating, filters.sort])

    const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
        if (['typeNumber', 'genres', 'countries', 'ageRating', 'sort'].includes(key)) return value
        if (key === 'yearFrom' || key === 'yearTo') return filters.yearFrom || filters.yearTo
        if (key === 'ratingFrom' || key === 'ratingTo') return filters.ratingFrom !== undefined || filters.ratingTo !== undefined
        return false
    })

    const handleLocalChange = (key, value) => {
        setLocalFilters(prev => ({ ...prev, [key]: value }))
    }

    const handleApply = () => {
        const applied = {}
        if (localFilters.typeNumber) applied.typeNumber = localFilters.typeNumber
        if (localFilters.genres) applied.genres = localFilters.genres
        if (localFilters.countries) applied.countries = localFilters.countries
        if (localFilters.yearFrom) applied.yearFrom = parseInt(localFilters.yearFrom)
        if (localFilters.yearTo) applied.yearTo = parseInt(localFilters.yearTo)
        if (localFilters.ratingFrom !== '') applied.ratingFrom = parseFloat(localFilters.ratingFrom)
        if (localFilters.ratingTo !== '') applied.ratingTo = parseFloat(localFilters.ratingTo)
        if (localFilters.ageRating) applied.ageRating = localFilters.ageRating
        if (localFilters.sort) applied.sort = localFilters.sort
        onFiltersChange(applied)
    }

    const handleReset = () => {
        const empty = { typeNumber: '', genres: '', countries: '', yearFrom: '', yearTo: '', ratingFrom: '', ratingTo: '', ageRating: '', sort: 'rating.kp:-1' }
        setLocalFilters(empty)
        onReset()
    }

    const genreOptions = [{ value: '', label: 'Все жанры' }, ...GENRES.map(g => ({ value: g, label: g }))]
    const countryOptions = [{ value: '', label: 'Все страны' }, ...COUNTRIES.filter((v, i, a) => a.indexOf(v) === i).map(c => ({ value: c, label: c }))]
    const yearOptions = [{ value: '', label: 'Любой' }, ...YEARS.map(y => ({ value: String(y), label: String(y) }))]
    const sortOptions = SORT_OPTIONS.map(s => ({ value: s.value, label: s.label }))

    return (
        <div className="p-4 bg-zinc-800/30 border border-zinc-700/50 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-zinc-400" />
                    <h3 className="font-medium text-zinc-200">Фильтры</h3>
                    {hasActiveFilters && (
                        <span className="px-2 py-0.5 bg-blue-600/30 text-blue-400 text-xs rounded-full">
                            Активно
                        </span>
                    )}
                </div>
                {hasActiveFilters && (
                    <Button variant="secondary" size="sm" onClick={handleReset} className="sm:ml-auto">
                        <X className="w-4 h-4 mr-1" />
                        Сбросить
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                <Select
                    label="Тип"
                    options={TYPE_OPTIONS}
                    value={localFilters.typeNumber}
                    onChange={(e) => handleLocalChange('typeNumber', e.target.value)}
                />
                <Select
                    label="Жанр"
                    options={genreOptions}
                    value={localFilters.genres}
                    onChange={(e) => handleLocalChange('genres', e.target.value)}
                    searchable
                    searchPlaceholder="Поиск жанра..."
                />
                <Select
                    label="Страна"
                    options={countryOptions}
                    value={localFilters.countries}
                    onChange={(e) => handleLocalChange('countries', e.target.value)}
                    searchable
                    searchPlaceholder="Поиск страны..."
                />
                <Select
                    label="Год от"
                    options={yearOptions}
                    value={localFilters.yearFrom}
                    onChange={(e) => handleLocalChange('yearFrom', e.target.value)}
                />
                <Select
                    label="Год до"
                    options={yearOptions}
                    value={localFilters.yearTo}
                    onChange={(e) => handleLocalChange('yearTo', e.target.value)}
                />
                <Select
                    label="Рейтинг от"
                    value={localFilters.ratingFrom}
                    onChange={(e) => handleLocalChange('ratingFrom', e.target.value)}
                    options={[{ value: '', label: 'Любой' }, ...['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map(n => ({ value: n, label: n }))]}
                />
                <Select
                    label="Рейтинг до"
                    value={localFilters.ratingTo}
                    onChange={(e) => handleLocalChange('ratingTo', e.target.value)}
                    options={[{ value: '', label: 'Любой' }, ...['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map(n => ({ value: n, label: n }))]}
                />
                <Select
                    label="Возраст"
                    options={AGE_OPTIONS}
                    value={localFilters.ageRating}
                    onChange={(e) => handleLocalChange('ageRating', e.target.value)}
                />
                <Select
                    label="Сортировка"
                    options={sortOptions}
                    value={localFilters.sort}
                    onChange={(e) => handleLocalChange('sort', e.target.value)}
                />
            </div>

            <div className="mt-4">
                <Button variant="primary" size="md" onClick={handleApply}>
                    Применить фильтры
                </Button>
            </div>
        </div>
    )
}

export default FilmFilters
