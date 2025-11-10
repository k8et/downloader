import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { downloadHLSVideo } from '../../../utils/hlsDownloader'
import Button from '../../ui/Button'
import Input from '../../ui/Input'
import VideoPlayer from './VideoPlayer'
import M3u8UrlList from './M3u8UrlList'
import DownloadList from './DownloadList'
import DownloadInstructions from './DownloadInstructions'
function VideoViewer() {
    const { kinopoiskId } = useParams()
    const [viewerUrl, setViewerUrl] = useState('')
    const [foundM3u8Urls, setFoundM3u8Urls] = useState([])
    const [iframeKey, setIframeKey] = useState(0)
    const [manualUrl, setManualUrl] = useState('')
    const [downloads, setDownloads] = useState([])

    useEffect(() => {
        if (kinopoiskId) {
            setViewerUrl(`https://iframe.cloud/iframe/${kinopoiskId}`)
            setFoundM3u8Urls([])
            setIframeKey(prev => prev + 1)
        } else {
            setViewerUrl('')
        }
    }, [kinopoiskId])

    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data && event.data.type === 'VIDEO_URLS_FOUND') {
                if (event.data.m3u8Urls && event.data.m3u8Urls.length > 0) {
                    setFoundM3u8Urls(prev => {
                        const combined = [...prev, ...event.data.m3u8Urls]
                        return [...new Set(combined)]
                    })
                }
            }
        }

        window.addEventListener('message', handleMessage)
        return () => {
            window.removeEventListener('message', handleMessage)
        }
    }, [])

    const reloadIframe = () => {
        setFoundM3u8Urls([])
        setIframeKey(prev => prev + 1)
    }

    const handleAddManualUrl = () => {
        if (manualUrl.trim() && (manualUrl.includes('.m3u8') || manualUrl.includes('m3u8'))) {
            setFoundM3u8Urls(prev => {
                const combined = [...prev, manualUrl.trim()]
                return [...new Set(combined)]
            })
            setManualUrl('')
        } else {
            alert('Пожалуйста, введите корректный m3u8 URL')
        }
    }

    const addDownload = (m3u8Url) => {
        const id = Date.now() + Math.random()
        const newDownload = {
            id,
            url: m3u8Url,
            progress: 0,
            status: 'Инициализация...',
            speed: 0,
            downloaded: 0,
            error: null,
            isCompleted: false,
            cancel: null
        }

        setDownloads(prev => [...prev, newDownload])

        const cancelCallback = (cancelFn) => {
            setDownloads(prev => prev.map(d =>
                d.id === id ? { ...d, cancel: cancelFn } : d
            ))
        }

        downloadHLSVideo(m3u8Url, (current, total, message, speed, downloaded) => {
            const percent = total > 0 ? Math.round((current / total) * 100) : 0
            setDownloads(prev => prev.map(d =>
                d.id === id
                    ? { ...d, progress: percent, status: message, speed: speed || 0, downloaded: downloaded || 0 }
                    : d
            ))
        }, cancelCallback)
            .then(() => {
                setDownloads(prev => prev.map(d =>
                    d.id === id
                        ? { ...d, progress: 100, status: 'Загрузка завершена!', isCompleted: true }
                        : d
                ))
            })
            .catch((err) => {
                setDownloads(prev => prev.map(d =>
                    d.id === id
                        ? { ...d, error: err.message || 'Ошибка при скачивании видео', status: '' }
                        : d
                ))
            })
    }

    const handleCancel = (id) => {
        setDownloads(prev => {
            const download = prev.find(d => d.id === id)
            if (download && download.cancel) {
                download.cancel()
            }
            return prev.filter(d => d.id !== id)
        })
    }

    return (
        <div className="flex flex-col gap-4">
            {viewerUrl && (
                <VideoPlayer
                    url={viewerUrl}
                    iframeKey={iframeKey}
                />
            )}

            <DownloadInstructions
                manualUrl={manualUrl}
                setManualUrl={setManualUrl}
                onAddUrl={handleAddManualUrl}
                isOurPlayer={!!kinopoiskId}
            />

            <M3u8UrlList
                urls={foundM3u8Urls}
                onDownload={addDownload}
            />

            <DownloadList
                downloads={downloads}
                onCancel={handleCancel}
            />
        </div>
    )
}

export default VideoViewer

