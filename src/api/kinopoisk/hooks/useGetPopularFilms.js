import { useInfiniteQuery } from '@tanstack/react-query'
import { getPopularFilms } from '../actions'

export const useGetPopularFilms = (options = {}) => {
    return useInfiniteQuery({
        queryKey: ['popularFilms'],
        queryFn: ({ pageParam = 1 }) => getPopularFilms(pageParam),
        getNextPageParam: (lastPage) => {
            return lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined
        },
        ...options
    })
}

