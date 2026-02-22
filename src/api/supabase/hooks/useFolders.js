import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import {
    getFolders,
    createFolder,
    updateFolder,
    deleteFolder,
    getFolderItems,
    addToFolder,
    removeFromFolder,
    getFoldersContainingFilm
} from '../../../lib/supabaseQueries'

export const useFolders = (userId, options = {}) => {
    return useQuery({
        queryKey: ['folders', userId],
        queryFn: () => getFolders(userId),
        enabled: !!userId,
        ...options
    })
}

export const useFoldersContainingFilm = (userId, kinopoiskId, options = {}) => {
    return useQuery({
        queryKey: ['foldersContainingFilm', userId, kinopoiskId],
        queryFn: () => getFoldersContainingFilm(userId, kinopoiskId),
        enabled: !!userId && !!kinopoiskId,
        ...options
    })
}

export const useFolderItems = (userId, folderId, options = {}) => {
    return useQuery({
        queryKey: ['folderItems', folderId],
        queryFn: () => getFolderItems(userId, folderId),
        enabled: !!userId && !!folderId,
        ...options
    })
}

export const useCreateFolder = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ userId, name }) => createFolder(userId, name),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['folders', variables.userId] })
        }
    })
}

export const useUpdateFolder = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ userId, folderId, name }) => updateFolder(userId, folderId, name),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['folders', variables.userId] })
            queryClient.invalidateQueries({ queryKey: ['folderItems', variables.folderId] })
        }
    })
}

export const useDeleteFolder = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ userId, folderId }) => deleteFolder(userId, folderId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['folders', variables.userId] })
            queryClient.invalidateQueries({ queryKey: ['folderItems', variables.folderId] })
        }
    })
}

export const useAddToFolder = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ userId, folderId, filmData }) => addToFolder(userId, folderId, filmData),
        onSuccess: (_, variables) => {
            const kinopoiskId = variables.filmData?.kinopoiskId || variables.filmData?.filmId
            queryClient.invalidateQueries({ queryKey: ['folderItems', variables.folderId] })
            if (kinopoiskId) {
                queryClient.invalidateQueries({ queryKey: ['foldersContainingFilm', variables.userId, kinopoiskId] })
            }
        }
    })
}

export const useRemoveFromFolder = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ userId, folderId, kinopoiskId }) => removeFromFolder(userId, folderId, kinopoiskId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['folderItems', variables.folderId] })
            queryClient.invalidateQueries({ queryKey: ['foldersContainingFilm', variables.userId, variables.kinopoiskId] })
        }
    })
}
