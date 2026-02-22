import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useFolders, useFoldersContainingFilm, useAddToFolder, useRemoveFromFolder, useCreateFolder } from '../../../api/supabase/hooks'
import { FolderPlus, Plus } from 'lucide-react'
import Modal from '../../ui/Modal'
import Button from '../../ui/Button'
import Input from '../../ui/Input'

function AddToFolderDropdown({ film, onClose, className = '' }) {
    const { user } = useAuth()
    const [newFolderName, setNewFolderName] = useState('')
    const [showModal, setShowModal] = useState(false)
    const dropdownRef = useRef(null)
    const inputRef = useRef(null)

    const kinopoiskId = film?.kinopoiskId || film?.filmId
    const { data: folders = [] } = useFolders(user?.id, { enabled: !!user })
    const { data: foldersContainingFilm = [] } = useFoldersContainingFilm(user?.id, kinopoiskId, { enabled: !!user && !!kinopoiskId })
    const addMutation = useAddToFolder()
    const removeMutation = useRemoveFromFolder()
    const createMutation = useCreateFolder()

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showModal) return
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                onClose?.()
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [onClose, showModal])

    useEffect(() => {
        if (showModal) {
            const t = setTimeout(() => inputRef.current?.focus(), 100)
            return () => clearTimeout(t)
        }
    }, [showModal])

    const handleToggleFolder = async (folderId) => {
        if (!user || !film || !kinopoiskId) return
        const isInFolder = foldersContainingFilm.includes(folderId)
        try {
            if (isInFolder) {
                await removeMutation.mutateAsync({ userId: user.id, folderId, kinopoiskId })
            } else {
                await addMutation.mutateAsync({ userId: user.id, folderId, filmData: film })
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleCreateAndAdd = async () => {
        if (!user || !film || !newFolderName.trim()) return
        try {
            const folder = await createMutation.mutateAsync({ userId: user.id, name: newFolderName.trim() })
            await addMutation.mutateAsync({ userId: user.id, folderId: folder.id, filmData: film })
            setNewFolderName('')
            setShowModal(false)
            onClose?.()
        } catch (e) {
            console.error(e)
        }
    }

    if (!user) return null

    const stopProp = (e) => {
        e.stopPropagation()
        e.preventDefault()
    }

    return (
        <div ref={dropdownRef} onClick={stopProp} onMouseDown={stopProp} className={`absolute right-0 top-full mt-1 py-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50 min-w-[200px] ${className}`}>
            <div className="px-3 py-1.5 text-xs text-zinc-500 border-b border-zinc-700/50 mb-2">
                Сохранить в папку
            </div>
            {folders.map((folder) => {
                const isInFolder = foldersContainingFilm.includes(folder.id)
                const isPending = addMutation.isPending || removeMutation.isPending
                return (
                    <button
                        key={folder.id}
                        type="button"
                        onClick={(e) => { stopProp(e); handleToggleFolder(folder.id) }}
                        disabled={isPending}
                        className={`w-full px-3 py-2 flex items-center gap-2 text-left text-sm disabled:opacity-50 ${isInFolder ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30' : 'text-zinc-200 hover:bg-zinc-700/50'}`}
                    >
                        <FolderPlus className={`w-4 h-4 flex-shrink-0 ${isInFolder ? 'text-blue-400' : 'text-zinc-400'}`} />
                        {folder.name}
                    </button>
                )
            })}
            <button
                type="button"
                onClick={(e) => { stopProp(e); setShowModal(true) }}
                className="w-full px-3 py-2 flex items-center gap-2 text-left text-sm text-blue-400 hover:bg-zinc-700/50 border-t border-zinc-700/50 mt-1"
            >
                <Plus className="w-4 h-4" />
                Новая папка
            </button>

            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setNewFolderName('') }}
                title="Новая папка"
            >
                <div className="space-y-4">
                    <Input
                        ref={inputRef}
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCreateAndAdd()
                        }}
                        placeholder="Введите название папки"
                        className="w-full"
                        autoFocus
                    />
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => { setShowModal(false); setNewFolderName('') }}
                        >
                            Отмена
                        </Button>
                        <Button
                            onClick={handleCreateAndAdd}
                            disabled={!newFolderName.trim() || createMutation.isPending}
                        >
                            {createMutation.isPending ? 'Создание...' : 'Создать'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default AddToFolderDropdown
