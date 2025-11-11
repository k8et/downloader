import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getWatchHistory } from '../../../lib/supabaseQueries'

export const useWatchHistory = (userId, options = {}) => {
    return useQuery({
        queryKey: ['watchHistory', userId],
        queryFn: () => getWatchHistory(userId),
        enabled: !!userId,
        staleTime: 30 * 1000, // 30 секунд
        ...options
    })
}

export const usePrefetchWatchHistory = () => {
    const queryClient = useQueryClient()

    return (userId) => {
        queryClient.prefetchQuery({
            queryKey: ['watchHistory', userId],
            queryFn: () => getWatchHistory(userId),
            staleTime: 30 * 1000
        })
    }
}

