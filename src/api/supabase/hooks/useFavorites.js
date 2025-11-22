import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { getFavorites, addToFavorites, removeFromFavorites } from '../../../lib/supabaseQueries'

export const useFavorites = (userId, options = {}) => {
    return useQuery({
        queryKey: ['favorites', userId],
        queryFn: () => getFavorites(userId),
        enabled: !!userId,
        staleTime: 30 * 1000,
        ...options
    })
}

export const usePrefetchFavorites = () => {
    const queryClient = useQueryClient()

    return (userId) => {
        queryClient.prefetchQuery({
            queryKey: ['favorites', userId],
            queryFn: () => getFavorites(userId),
            staleTime: 30 * 1000
        })
    }
}

export const useAddToFavorites = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ userId, filmData }) => addToFavorites(userId, filmData),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['favorites', variables.userId] })
            queryClient.invalidateQueries({ queryKey: ['isFavorite', variables.userId, variables.filmData.kinopoiskId || variables.filmData.filmId] })
        }
    })
}

export const useRemoveFromFavorites = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ userId, kinopoiskId }) => removeFromFavorites(userId, kinopoiskId),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['favorites', variables.userId] })
            queryClient.invalidateQueries({ queryKey: ['isFavorite', variables.userId, variables.kinopoiskId] })
        }
    })
}

