import { useQuery } from '@tanstack/react-query'
import { getFilmById } from '../actions'

export const useGetFilmById = (id, options = {}) => {
    return useQuery({
        queryKey: ['film', id],
        queryFn: () => getFilmById(id),
        enabled: !!id,
        ...options
    })
}

