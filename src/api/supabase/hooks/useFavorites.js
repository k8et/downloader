import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getFavorites } from '../../../lib/supabaseQueries'

export const useFavorites = (userId, options = {}) => {
    return useQuery({
        queryKey: ['favorites', userId],
        queryFn: () => getFavorites(userId),
        enabled: !!userId,
        staleTime: 30 * 1000, // 30 секунд
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

