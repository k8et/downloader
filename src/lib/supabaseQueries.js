import { supabase } from './supabase'

export const addToWatchHistory = async (userId, filmData) => {
    const { data, error } = await supabase
        .from('watch_history')
        .upsert({
            user_id: userId,
            kinopoisk_id: filmData.kinopoiskId || filmData.filmId,
            film_data: filmData,
            watched_at: new Date().toISOString(),
        }, {
            onConflict: 'user_id,kinopoisk_id'
        })
        .select()

    return { data, error }
}

export const getWatchHistory = async (userId) => {
    const { data, error } = await supabase
        .from('watch_history')
        .select('*')
        .eq('user_id', userId)
        .order('watched_at', { ascending: false })
        .limit(50)

    if (error) {
        throw error
    }

    return data || []
}

export const removeFromWatchHistory = async (userId, kinopoiskId) => {
    const { data, error } = await supabase
        .from('watch_history')
        .delete()
        .eq('user_id', userId)
        .eq('kinopoisk_id', kinopoiskId)
        .select()

    if (error) {
        throw error
    }

    return data
}

export const addToFavorites = async (userId, filmData) => {
    const { data, error } = await supabase
        .from('favorites')
        .upsert({
            user_id: userId,
            kinopoisk_id: filmData.kinopoiskId || filmData.filmId,
            film_data: filmData,
        }, {
            onConflict: 'user_id,kinopoisk_id'
        })
        .select()

    if (error) {
        throw error
    }

    return data
}

export const removeFromFavorites = async (userId, kinopoiskId) => {
    const { data, error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('kinopoisk_id', kinopoiskId)
        .select()

    if (error) {
        throw error
    }

    return data
}

export const getFavorites = async (userId) => {
    const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) {
        throw error
    }

    return data || []
}

export const isFavorite = async (userId, kinopoiskId) => {
    const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('kinopoisk_id', kinopoiskId)
        .maybeSingle()

    if (error && error.code !== 'PGRST116') {
        throw error
    }

    return !!data
}

