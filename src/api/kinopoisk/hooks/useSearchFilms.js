import { useInfiniteQuery } from '@tanstack/react-query'
import { searchFilms } from '../actions'

export const useSearchFilms = (query, options = {}) => {
    return useInfiniteQuery({
        queryKey: ['searchFilms', query],
        queryFn: ({ pageParam = 1 }) => searchFilms(query, pageParam),
        getNextPageParam: (lastPage) => {
            return lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined
        },
        enabled: !!query && query.trim().length > 0,
        ...options
    })
}

