import { useRef, useEffect } from 'react'
import { useIframeScript } from '../../../hooks/useIframeScript'

function VideoPlayer({ url, iframeKey, onPlayerLoaded }) {
    const iframeRef = useRef(null)

    useIframeScript(iframeRef, iframeKey)

    useEffect(() => {
        const iframe = iframeRef.current
        if (!iframe) return

        console.log('[VideoPlayer] Setting up load listener for iframe')

        const handleLoad = () => {
            console.log('[VideoPlayer] Iframe loaded successfully')
            if (onPlayerLoaded) {
                onPlayerLoaded(true)
            }
        }

        const handleError = () => {
            console.error('[VideoPlayer] Iframe load error')
            if (onPlayerLoaded) {
                onPlayerLoaded(false)
            }
        }

        iframe.addEventListener('load', handleLoad)
        iframe.addEventListener('error', handleError)

        return () => {
            console.log('[VideoPlayer] Cleaning up iframe listeners')
            iframe.removeEventListener('load', handleLoad)
            iframe.removeEventListener('error', handleError)
            if (onPlayerLoaded) {
                onPlayerLoaded(false)
            }
        }
    }, [iframeKey, url, onPlayerLoaded])

    return (
        <div className="border border-zinc-700/50 rounded-lg overflow-hidden bg-zinc-900">
            <iframe
                ref={iframeRef}
                key={iframeKey}
                src={url}
                className="w-full h-96 md:h-[500px] lg:h-[600px]"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        </div>
    )
}

export default VideoPlayer

