import { useQuery } from '@tanstack/react-query'
import { getFilmById } from '../actions'

export const useGetSimilarFilms = (filmId, options = {}) => {
    return useQuery({
        queryKey: ['film', filmId],
        queryFn: () => getFilmById(filmId),
        select: (data) => data?.similar,
        enabled: !!filmId,
        ...options
    })
}

