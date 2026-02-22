import { useInfiniteQuery } from '@tanstack/react-query'
import { getFilmsFromCollection } from '../actions'

export const useGetFilmsFromCollection = (collectionType = 'TOP_POPULAR_ALL', options = {}) => {
    return useInfiniteQuery({
        queryKey: ['filmsCollection', collectionType],
        queryFn: ({ pageParam = 1 }) => getFilmsFromCollection(collectionType, pageParam),
        getNextPageParam: (lastPage) => {
            return lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined
        },
        ...options
    })
}

export const useGetPopularFilms = (options = {}) =>
    useGetFilmsFromCollection('TOP_POPULAR_ALL', options)

