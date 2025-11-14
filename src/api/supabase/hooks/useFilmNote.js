import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getFilmNote, saveFilmNote, deleteFilmNote } from '../../../lib/supabaseQueries'

export const useFilmNote = (userId, kinopoiskId, options = {}) => {
    return useQuery({
        queryKey: ['filmNote', userId, kinopoiskId],
        queryFn: () => getFilmNote(userId, kinopoiskId),
        enabled: !!userId && !!kinopoiskId,
        staleTime: 30 * 1000,
        ...options
    })
}

export const useSaveFilmNote = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ userId, kinopoiskId, note }) => saveFilmNote(userId, kinopoiskId, note),
        onSuccess: (data, variables) => {
            queryClient.setQueryData(['filmNote', variables.userId, variables.kinopoiskId], data)
            queryClient.invalidateQueries({ queryKey: ['filmNote', variables.userId, variables.kinopoiskId] })
        }
    })
}

export const useDeleteFilmNote = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ userId, kinopoiskId }) => deleteFilmNote(userId, kinopoiskId),
        onSuccess: (data, variables) => {
            queryClient.setQueryData(['filmNote', variables.userId, variables.kinopoiskId], null)
            queryClient.invalidateQueries({ queryKey: ['filmNote', variables.userId, variables.kinopoiskId] })
        }
    })
}

