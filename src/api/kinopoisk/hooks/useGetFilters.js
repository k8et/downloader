import { useQuery } from '@tanstack/react-query'
import { getFilters } from '../actions'

export const useGetFilters = (options = {}) => {
    return useQuery({
        queryKey: ['filters'],
        queryFn: getFilters,
        staleTime: 24 * 60 * 60 * 1000,
        ...options
    })
}

