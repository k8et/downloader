import { useQuery } from '@tanstack/react-query'
import { getFilmById } from '../actions'

export const useGetFilmStaff = (filmId, options = {}) => {
    return useQuery({
        queryKey: ['film', filmId],
        queryFn: () => getFilmById(filmId),
        select: (data) => data?.staff,
        enabled: !!filmId,
        ...options
    })
}

