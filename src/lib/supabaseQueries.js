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

export const getFilmNote = async (userId, kinopoiskId) => {
    const { data, error } = await supabase
        .from('film_notes')
        .select('*')
        .eq('user_id', userId)
        .eq('kinopoisk_id', kinopoiskId)
        .maybeSingle()

    if (error && error.code !== 'PGRST116') {
        throw error
    }

    return data
}

export const saveFilmNote = async (userId, kinopoiskId, note) => {
    const { data, error } = await supabase
        .from('film_notes')
        .upsert({
            user_id: userId,
            kinopoisk_id: kinopoiskId,
            note: note.trim(),
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'user_id,kinopoisk_id'
        })
        .select()
        .single()

    if (error) {
        throw error
    }

    return data
}

export const deleteFilmNote = async (userId, kinopoiskId) => {
    const { data, error } = await supabase
        .from('film_notes')
        .delete()
        .eq('user_id', userId)
        .eq('kinopoisk_id', kinopoiskId)
        .select()

    if (error) {
        throw error
    }

    return data
}

export const getFolders = async (userId) => {
    const { data, error } = await supabase
        .from('film_folders')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

    if (error) throw error
    return data || []
}

export const createFolder = async (userId, name) => {
    const { data, error } = await supabase
        .from('film_folders')
        .insert({ user_id: userId, name: name.trim() })
        .select()
        .single()

    if (error) throw error
    return data
}

export const updateFolder = async (userId, folderId, name) => {
    const { data, error } = await supabase
        .from('film_folders')
        .update({ name: name.trim(), updated_at: new Date().toISOString() })
        .eq('id', folderId)
        .eq('user_id', userId)
        .select()
        .single()

    if (error) throw error
    return data
}

export const deleteFolder = async (userId, folderId) => {
    const { error } = await supabase
        .from('film_folders')
        .delete()
        .eq('id', folderId)
        .eq('user_id', userId)

    if (error) throw error
}

export const getFolderItems = async (userId, folderId) => {
    const { data, error } = await supabase
        .from('film_folder_items')
        .select('*')
        .eq('folder_id', folderId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
}

export const addToFolder = async (userId, folderId, filmData) => {
    const kinopoiskId = filmData.kinopoiskId || filmData.filmId
    const { data, error } = await supabase
        .from('film_folder_items')
        .upsert({
            folder_id: folderId,
            user_id: userId,
            kinopoisk_id: kinopoiskId,
            film_data: filmData
        }, {
            onConflict: 'folder_id,kinopoisk_id'
        })
        .select()

    if (error) throw error
    return data
}

export const removeFromFolder = async (userId, folderId, kinopoiskId) => {
    const { error } = await supabase
        .from('film_folder_items')
        .delete()
        .eq('folder_id', folderId)
        .eq('user_id', userId)
        .eq('kinopoisk_id', kinopoiskId)

    if (error) throw error
}

export const getFoldersContainingFilm = async (userId, kinopoiskId) => {
    const { data, error } = await supabase
        .from('film_folder_items')
        .select('folder_id')
        .eq('user_id', userId)
        .eq('kinopoisk_id', kinopoiskId)

    if (error) throw error
    return (data || []).map(item => item.folder_id)
}

