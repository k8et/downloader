import { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useFilmNote, useSaveFilmNote, useDeleteFilmNote } from '../../../api/supabase/hooks'
import Button from '../../ui/Button'
import { FileText, Save, Trash2, X } from 'lucide-react'

function FilmNote({ kinopoiskId }) {
    const { user } = useAuth()
    const { data: noteData, isLoading, refetch } = useFilmNote(user?.id, kinopoiskId)
    const saveNoteMutation = useSaveFilmNote()
    const deleteNoteMutation = useDeleteFilmNote()

    const [isEditing, setIsEditing] = useState(false)
    const [noteText, setNoteText] = useState('')

    useEffect(() => {
        if (noteData) {
            setNoteText(noteData.note || '')
        } else {
            setNoteText('')
        }
    }, [noteData])

    if (!user) {
        return null
    }

    if (!kinopoiskId) {
        return null
    }

    const handleSave = async () => {
        if (!noteText.trim()) {
            return
        }

        try {
            await saveNoteMutation.mutateAsync({
                userId: user.id,
                kinopoiskId: parseInt(kinopoiskId),
                note: noteText
            })
            await refetch()
            setIsEditing(false)
        } catch (error) {
            console.error('Error saving note:', error)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Вы уверены, что хотите удалить заметку?')) {
            return
        }

        try {
            await deleteNoteMutation.mutateAsync({
                userId: user.id,
                kinopoiskId: parseInt(kinopoiskId)
            })
            await refetch()
            setNoteText('')
            setIsEditing(false)
        } catch (error) {
            console.error('Error deleting note:', error)
        }
    }

    const handleCancel = () => {
        setNoteText(noteData?.note || '')
        setIsEditing(false)
    }

    const hasNote = noteData && noteData.note

    return (
        <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-medium text-zinc-200">Моя заметка</h2>
            </div>

            {isLoading ? (
                <div className="text-zinc-400 text-sm">Загрузка...</div>
            ) : isEditing ? (
                <div className="space-y-4">
                    <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Введите вашу заметку о фильме..."
                        className="w-full min-h-[120px] px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 resize-y transition-all focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        autoFocus
                    />
                    <div className="flex gap-2">
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleSave}
                            disabled={!noteText.trim() || saveNoteMutation.isPending}
                        >
                            <Save className="w-4 h-4 mr-1.5" />
                            Сохранить
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleCancel}
                            disabled={saveNoteMutation.isPending}
                        >
                            <X className="w-4 h-4 mr-1.5" />
                            Отмена
                        </Button>
                        {hasNote && (
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={handleDelete}
                                disabled={saveNoteMutation.isPending || deleteNoteMutation.isPending}
                            >
                                <Trash2 className="w-4 h-4 mr-1.5" />
                                Удалить
                            </Button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {hasNote ? (
                        <>
                            <p className="text-zinc-300 leading-relaxed whitespace-pre-line">
                                {noteData.note}
                            </p>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setIsEditing(true)}
                            >
                                Редактировать
                            </Button>
                        </>
                    ) : (
                        <>
                            <p className="text-zinc-400 text-sm italic">
                                У вас пока нет заметки к этому фильму
                            </p>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setIsEditing(true)}
                            >
                                Добавить заметку
                            </Button>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export default FilmNote

