import { useQuery } from '@tanstack/react-query'
import { getFilmStaff } from '../actions'

export const useGetFilmStaff = (filmId, options = {}) => {
    return useQuery({
        queryKey: ['filmStaff', filmId],
        queryFn: () => getFilmStaff(filmId),
        enabled: !!filmId,
        ...options
    })
}

