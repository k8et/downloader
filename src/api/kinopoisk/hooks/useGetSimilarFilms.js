import { useQuery } from '@tanstack/react-query'
import { getSimilarFilms } from '../actions'

export const useGetSimilarFilms = (filmId, options = {}) => {
    return useQuery({
        queryKey: ['similarFilms', filmId],
        queryFn: () => getSimilarFilms(filmId),
        enabled: !!filmId,
        ...options
    })
}

