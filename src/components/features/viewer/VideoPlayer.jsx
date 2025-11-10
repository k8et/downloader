import { useRef } from 'react'
import { useIframeScript } from '../../../hooks/useIframeScript'

function VideoPlayer({ url, iframeKey, onMessage }) {
    const iframeRef = useRef(null)

    useIframeScript(iframeRef, iframeKey)

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

