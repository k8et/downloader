const API_BASE_URL = 'https://api.poiskkino.dev'
const API_TOKEN = import.meta.env.VITE_POISKKINO_TOKEN || ''

const mapFilmFromList = (item) => {
    const rating = item.rating || {}
    const poster = item.poster || {}
    return {
        kinopoiskId: item.id,
        filmId: item.id,
        nameRu: item.name || (item.names?.find(n => n.language === 'RU')?.name),
        nameEn: item.alternativeName || (item.names?.find(n => !n.language)?.name),
        nameOriginal: item.alternativeName,
        posterUrl: poster.url,
        posterUrlPreview: poster.previewUrl || poster.url,
        ratingKinopoisk: rating.kp || null,
        ratingImdb: rating.imdb || null,
        rating: rating.kp || rating.imdb,
        year: item.year,
        description: item.description,
        shortDescription: item.shortDescription,
        filmLength: item.movieLength,
        genres: (item.genres || []).map(g => ({ genre: g.name })),
        countries: (item.countries || []).map(c => ({ country: c.name }))
    }
}

const mapPerson = (p) => {
    const enProfession = (p.enProfession || '').toLowerCase()
    let professionKey = 'ACTOR'
    if (enProfession === 'director') professionKey = 'DIRECTOR'
    return {
        staffId: p.id,
        nameRu: p.name,
        nameEn: p.enName,
        posterUrl: p.photo,
        professionKey,
        professionText: p.profession
    }
}

const mapSimilarFilm = (item) => ({
    ...mapFilmFromList(item),
    kinopoiskId: item.id,
    filmId: item.id
})

export const searchFilms = async (query, page = 1) => {
    if (!API_TOKEN) {
        throw new Error('API ключ не настроен. Создайте файл .env с VITE_POISKKINO_TOKEN')
    }

    try {
        const params = new URLSearchParams({
            query: query.trim(),
            page: String(page),
            limit: '20'
        })
        params.set('token', API_TOKEN)

        const response = await fetch(
            `${API_BASE_URL}/v1.4/movie/search?${params}`
        )

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        return {
            docs: (data.docs || []).map(mapFilmFromList),
            page: data.page || page,
            pages: data.pages || 1,
            total: data.total || 0
        }
    } catch (error) {
        console.error('Error searching films:', error)
        throw error
    }
}

export const LIST_OPTIONS = [
    { value: '', label: 'По рейтингу' },
    { value: 'popular', label: 'Популярное' },
    { value: 'popular-films', label: 'Популярные фильмы' },
    { value: 'top250', label: 'Топ 250' },
    { value: 'top500', label: 'Топ 500' },
    { value: 'box-total', label: 'Кассовые сборы' },
    { value: 'box-usa-all-time', label: 'Кассовые сборы США' },
    { value: 'oscar-visual-effects', label: 'Оскар: визуальные эффекты' }
]

export const SORT_OPTIONS = [
    { value: 'rating.kp:-1', label: 'Рейтинг КП ↓' },
    { value: 'rating.imdb:-1', label: 'Рейтинг IMDb ↓' },
    { value: 'votes.kp:-1', label: 'Голоса КП ↓' },
    { value: 'year:-1', label: 'Год (сначала новые)' },
    { value: 'year:1', label: 'Год (сначала старые)' },
    { value: 'movieLength:1', label: 'Длина (короткие)' },
    { value: 'movieLength:-1', label: 'Длина (длинные)' }
]

export const getFilmsByFilter = async (filters = {}, page = 1) => {
    if (!API_TOKEN) {
        throw new Error('API ключ не настроен. Создайте файл .env с VITE_POISKKINO_TOKEN')
    }

    try {
        const params = new URLSearchParams({
            page: String(page),
            limit: '20'
        })
        params.set('token', API_TOKEN)

        if (filters.lists) {
            params.set('lists', filters.lists)
        }
        if (filters.typeNumber) {
            params.set('typeNumber', String(filters.typeNumber))
        }
        if (filters.genres) {
            params.set('genres.name', filters.genres)
        }
        if (filters.countries) {
            params.set('countries.name', filters.countries)
        }
        if (filters.yearFrom && filters.yearTo) {
            params.set('year', `${filters.yearFrom}-${filters.yearTo}`)
        } else if (filters.year) {
            params.set('year', String(filters.year))
        }
        if (filters.ratingFrom !== undefined || filters.ratingTo !== undefined) {
            const from = filters.ratingFrom ?? 0
            const to = filters.ratingTo ?? 10
            params.set('rating.kp', `${from}-${to}`)
        }
        if (filters.ageRating) {
            params.set('ageRating', String(filters.ageRating))
        }
        if (filters.sort) {
            const [sortField, sortType] = filters.sort.split(':')
            if (sortField) {
                params.set('sortField', sortField)
                params.set('sortType', sortType || '-1')
            }
        }
        if (filters.query?.trim()) {
            const searchParams = new URLSearchParams({
                query: filters.query.trim(),
                page: String(page),
                limit: '20'
            })
            searchParams.set('token', API_TOKEN)
            const response = await fetch(
                `${API_BASE_URL}/v1.4/movie/search?${searchParams}`
            )
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
            }
            const data = await response.json()
            return {
                docs: (data.docs || []).map(mapFilmFromList),
                page: data.page || page,
                pages: data.pages || 1,
                total: data.total || 0
            }
        }

        const response = await fetch(
            `${API_BASE_URL}/v1.4/movie?${params}`
        )

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        return {
            docs: (data.docs || []).map(mapFilmFromList),
            page: data.page || page,
            pages: data.pages || 1,
            total: data.total || 0
        }
    } catch (error) {
        console.error('Error fetching films by filter:', error)
        throw error
    }
}

export const GENRES = [
    'драма', 'комедия', 'фантастика', 'боевик', 'триллер', 'ужасы', 'мелодрама',
    'детектив', 'документальный', 'мультфильм', 'криминал', 'приключения', 'семейный',
    'биография', 'военный', 'короткометражка', 'музыка', 'концерт', 'фэнтези', 'детский',
    'история', 'спорт', 'аниме', 'вестерн', 'мюзикл'
]

export const COUNTRIES = [
    'США', 'Россия', 'Франция', 'Великобритания', 'Германия', 'Китай', 'Япония',
    'Корея Южная', 'Индия', 'Испания', 'Италия', 'Канада', 'Австралия',
    'СССР', 'Украина', 'Бразилия', 'Мексика', 'Аргентина', 'Польша', 'Швеция',
    'Нидерланды', 'Бельгия', 'Турция', 'Гонконг', 'Таиланд', 'Финляндия', 'Норвегия'
]

export const getPopularFilms = async (page = 1) => {
    if (!API_TOKEN) {
        throw new Error('API ключ не настроен. Создайте файл .env с VITE_POISKKINO_TOKEN')
    }

    try {
        const params = new URLSearchParams({
            sortField: 'rating.kp',
            sortType: '-1',
            page: String(page),
            limit: '20'
        })
        params.set('token', API_TOKEN)

        const response = await fetch(
            `${API_BASE_URL}/v1.4/movie?${params}`
        )

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        return {
            docs: (data.docs || []).map(mapFilmFromList),
            page: data.page || page,
            pages: data.pages || 1,
            total: data.total || 0
        }
    } catch (error) {
        console.error('Error fetching popular films:', error)
        throw error
    }
}

export const getFilmById = async (id) => {
    if (!API_TOKEN) {
        throw new Error('API ключ не настроен. Создайте файл .env с VITE_POISKKINO_TOKEN')
    }

    try {
        const params = new URLSearchParams({ token: API_TOKEN })
        const response = await fetch(
            `${API_BASE_URL}/v1.4/movie/${id}?${params}`
        )

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        const rating = data.rating || {}
        const poster = data.poster || {}

        const film = {
            kinopoiskId: data.id,
            filmId: data.id,
            nameRu: data.name || (data.names?.find(n => n.language === 'RU')?.name),
            nameEn: data.alternativeName || (data.names?.find(n => !n.language)?.name),
            nameOriginal: data.alternativeName,
            posterUrl: poster.url,
            posterUrlPreview: poster.previewUrl || poster.url,
            ratingKinopoisk: rating.kp ?? null,
            ratingImdb: rating.imdb ?? null,
            rating: rating.kp || rating.imdb,
            year: data.year,
            description: data.description,
            shortDescription: data.shortDescription,
            filmLength: data.movieLength,
            genres: (data.genres || []).map(g => ({ genre: g.name })),
            countries: (data.countries || []).map(c => ({ country: c.name }))
        }

        const persons = data.persons || []
        const staff = persons
            .filter(p => ['actor', 'director'].includes((p.enProfession || '').toLowerCase()))
            .map(mapPerson)

        const similar = (data.similarMovies || []).map(mapSimilarFilm)

        return { film, staff, similar }
    } catch (error) {
        console.error('Error fetching film:', error)
        throw error
    }
}

export const getPersonById = async (personId) => {
    if (!API_TOKEN) {
        throw new Error('API ключ не настроен. Создайте файл .env с VITE_POISKKINO_TOKEN')
    }

    try {
        const params = new URLSearchParams({ token: API_TOKEN })
        const response = await fetch(
            `${API_BASE_URL}/v1.4/person/${personId}?${params}`
        )

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        const birthPlace = data.birthPlace
        const birthPlaceStr = Array.isArray(birthPlace)
            ? birthPlace.map(p => p.value || p.name).filter(Boolean).join(', ')
            : birthPlace?.value || birthPlace?.name || ''

        const facts = (data.facts || []).map(f => (typeof f === 'string' ? f : f.value || f.text))

        const profession = Array.isArray(data.profession)
            ? data.profession.map(p => p.value || p).join(', ')
            : data.profession?.value || data.profession || ''

        const birthday = data.birthday
            ? new Date(data.birthday).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
            : null

        const films = (data.movies || []).map(m => ({
            filmId: m.id,
            nameRu: m.name,
            nameEn: m.alternativeName,
            nameOriginal: m.alternativeName,
            rating: m.rating,
            description: m.description
        }))

        return {
            nameRu: data.name,
            nameEn: data.enName,
            posterUrl: data.photo,
            profession,
            birthday,
            age: data.age,
            birthplace: birthPlaceStr,
            growth: data.growth,
            facts,
            films
        }
    } catch (error) {
        console.error('Error fetching person:', error)
        throw error
    }
}
