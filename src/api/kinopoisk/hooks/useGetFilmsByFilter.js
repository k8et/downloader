import { useInfiniteQuery } from '@tanstack/react-query'
import { getFilmsByFilter } from '../actions'

export const useGetFilmsByFilter = (filters = {}, options = {}) => {
    return useInfiniteQuery({
        queryKey: ['filmsByFilter', filters],
        queryFn: ({ pageParam = 1 }) => getFilmsByFilter(filters, pageParam),
        getNextPageParam: (lastPage) => {
            return lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined
        },
        ...options
    })
}

