const API_BASE_URL = 'https://kinopoiskapiunofficial.tech'
const API_KEY = import.meta.env.VITE_KINOPOISK_API_KEY || ''

const getHeaders = () => {
    const headers = {}
    if (API_KEY) {
        headers['X-API-KEY'] = API_KEY
    }
    return headers
}

export const searchFilms = async (query, page = 1) => {
    if (!API_KEY) {
        throw new Error('API ключ не настроен. Создайте файл .env с VITE_KINOPOISK_API_KEY')
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/api/v2.1/films/search-by-keyword?keyword=${encodeURIComponent(query)}&page=${page}`,
            {
                headers: getHeaders()
            }
        )

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        return {
            docs: data.films || [],
            page: page,
            pages: data.pagesCount || 1,
            total: data.searchFilmsCountResult || 0
        }
    } catch (error) {
        console.error('Error searching films:', error)
        throw error
    }
}

export const getFilmById = async (id) => {
    if (!API_KEY) {
        throw new Error('API ключ не настроен. Создайте файл .env с VITE_KINOPOISK_API_KEY')
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/api/v2.2/films/${id}`,
            {
                headers: getHeaders()
            }
        )

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error('Error fetching film:', error)
        throw error
    }
}

export const getPopularFilms = async (page = 1) => {
    if (!API_KEY) {
        throw new Error('API ключ не настроен. Создайте файл .env с VITE_KINOPOISK_API_KEY')
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/api/v2.2/films/collections?type=TOP_POPULAR_ALL&page=${page}`,
            {
                headers: getHeaders()
            }
        )

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        return {
            docs: data.items || [],
            page: page,
            pages: data.totalPages || 1,
            total: data.total || 0
        }
    } catch (error) {
        console.error('Error fetching popular films:', error)
        throw error
    }
}

export const getFilmsByFilter = async (filters = {}, page = 1) => {
    if (!API_KEY) {
        throw new Error('API ключ не настроен. Создайте файл .env с VITE_KINOPOISK_API_KEY')
    }

    try {
        const params = new URLSearchParams({
            page: page.toString(),
            ...Object.fromEntries(
                Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null && value !== '')
            )
        })

        const response = await fetch(
            `${API_BASE_URL}/api/v2.2/films?${params}`,
            {
                headers: getHeaders()
            }
        )

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        return {
            docs: data.items || [],
            page: page,
            pages: data.totalPages || 1,
            total: data.total || 0
        }
    } catch (error) {
        console.error('Error fetching films by filter:', error)
        throw error
    }
}

