import { X } from 'lucide-react'
import { formatBytes, formatSpeed } from '../../../utils/formatters'
import ProgressBar from '../../ui/ProgressBar'

function DownloadItem({ download, onCancel }) {
    const { id, url, progress, status, speed, downloaded, error, isCompleted } = download

    return (
        <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4 flex flex-col gap-3 transition-all hover:border-zinc-600">
            <div className="flex justify-between items-center gap-2">
                <div
                    className="flex-1 text-xs text-zinc-400 break-all font-mono leading-snug md:text-sm"
                    title={url}
                >
                    {url.length > 60 ? url.substring(0, 60) + '...' : url}
                </div>
                {!isCompleted && !error && (
                    <button
                        className="bg-red-600/20 text-red-400 border border-red-600/30 rounded-full w-7 h-7 p-0 cursor-pointer flex items-center justify-center transition-all flex-shrink-0 hover:bg-red-600/30 hover:border-red-500 active:scale-95"
                        onClick={() => onCancel(id)}
                        title="Отменить"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {error ? (
                <div className="p-3 bg-red-950/30 border border-red-800/50 text-red-400 rounded-lg text-xs">
                    {error}
                </div>
            ) : (
                <>
                    <ProgressBar progress={progress} />
                    <div className="flex flex-col gap-2 items-start md:flex-row md:items-center md:gap-4 lg:flex-wrap">
                        <div className="font-medium text-zinc-200 text-sm min-w-[45px]">
                            {progress}%
                        </div>
                        {speed > 0 && (
                            <div className="text-xs text-blue-400 font-mono md:text-sm">
                                {formatSpeed(speed)}
                            </div>
                        )}
                        {downloaded > 0 && (
                            <div className="text-xs text-zinc-400 font-mono md:text-sm">
                                {formatBytes(downloaded)}
                            </div>
                        )}
                    </div>
                    {status && (
                        <div className="text-xs text-zinc-500 italic">
                            {status}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default DownloadItem

