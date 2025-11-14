import { useParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useGetFilmById, useGetFilmStaff, useGetSimilarFilms } from '../api/kinopoisk/hooks'
import VideoViewer from '../components/features/viewer/VideoViewer'
import FilmDescription from '../components/features/viewer/FilmDescription'
import FilmActors from '../components/features/viewer/FilmActors'
import SimilarFilms from '../components/features/viewer/SimilarFilms'
import FilmNote from '../components/features/viewer/FilmNote'

function ViewerPage() {
    const { kinopoiskId } = useParams()

    const { data: filmData, isLoading: filmLoading, error: filmError } = useGetFilmById(kinopoiskId, {
        enabled: !!kinopoiskId
    })

    const { data: staffData } = useGetFilmStaff(kinopoiskId, {
        enabled: !!kinopoiskId
    })

    const { data: similarFilms } = useGetSimilarFilms(kinopoiskId, {
        enabled: !!kinopoiskId
    })

    if (!kinopoiskId) {
        return (
            <div className="w-full">
                <VideoViewer filmData={null} kinopoiskId={null} />
            </div>
        )
    }

    if (filmLoading) {
        return (
            <div className="w-full flex items-center justify-center py-16">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 text-zinc-400 animate-spin" />
                    <p className="text-zinc-400">Загрузка информации о фильме...</p>
                </div>
            </div>
        )
    }

    if (filmError) {
        return (
            <div className="w-full">
                <div className="mb-6 p-4 bg-red-950/30 border border-red-800/50 text-red-400 rounded-lg text-sm">
                    {filmError.message || 'Ошибка загрузки информации о фильме'}
                </div>
                <VideoViewer filmData={null} kinopoiskId={kinopoiskId} />
            </div>
        )
    }

    return (
        <div className="w-full space-y-8">
            {filmData && (
                <>
                    <FilmDescription film={filmData} />
                    <FilmNote kinopoiskId={kinopoiskId} />
                    <VideoViewer filmData={filmData} kinopoiskId={kinopoiskId} />
                    {staffData && <FilmActors staff={staffData} />}
                    {similarFilms && similarFilms.length > 0 && <SimilarFilms films={similarFilms} />}
                </>
            )}
        </div>
    )
}

export default ViewerPage

