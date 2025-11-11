import { useQuery } from '@tanstack/react-query'
import { isFavorite } from '../../../lib/supabaseQueries'

export const useIsFavorite = (userId, kinopoiskId, options = {}) => {
    return useQuery({
        queryKey: ['isFavorite', userId, kinopoiskId],
        queryFn: () => isFavorite(userId, kinopoiskId),
        enabled: !!userId && !!kinopoiskId,
        staleTime: 5 * 60 * 1000, // 5 минут
        ...options
    })
}

