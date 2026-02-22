import { useState, useEffect } from 'react'
import { useWatchHistoryTimer } from '../../../hooks/useWatchHistoryTimer'
import VideoPlayer from './VideoPlayer'
import M3u8UrlList from './M3u8UrlList'

function VideoViewer({ filmData, kinopoiskId }) {
    const [viewerUrl, setViewerUrl] = useState('')
    const [foundM3u8Urls, setFoundM3u8Urls] = useState([])
    const [iframeKey, setIframeKey] = useState(0)
    const [playerLoaded, setPlayerLoaded] = useState(false)

    const playerOpened = !!kinopoiskId && playerLoaded
    useWatchHistoryTimer(filmData, kinopoiskId, playerOpened)

    useEffect(() => {
        if (kinopoiskId) {
            setViewerUrl(`https://iframe.cloud/iframe/${kinopoiskId}`)
            setFoundM3u8Urls([])
            setIframeKey(prev => prev + 1)
            setPlayerLoaded(false)
        } else {
            setViewerUrl('')
            setPlayerLoaded(false)
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

    return (
        <div className="flex flex-col gap-4">
            {viewerUrl && (
                <VideoPlayer
                    url={viewerUrl}
                    iframeKey={iframeKey}
                    onPlayerLoaded={setPlayerLoaded}
                />
            )}

            <M3u8UrlList urls={foundM3u8Urls} />
        </div>
    )
}

export default VideoViewer
