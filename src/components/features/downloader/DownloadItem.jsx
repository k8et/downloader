import { X } from 'lucide-react'
import { formatBytes, formatSpeed } from '../../../utils/formatters'
import ProgressBar from '../../ui/ProgressBar'

function DownloadItem({ download, onCancel }) {
    const { id, url, progress, status, speed, downloaded, error, isCompleted } = download

    return (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-2.5 flex flex-col gap-2 transition-shadow hover:shadow-md md:rounded-lg md:p-3 md:gap-2.5 lg:rounded-xl lg:p-4 lg:gap-3">
            <div className="flex justify-between items-center gap-2 md:gap-2 lg:gap-3">
                <div
                    className="flex-1 text-xs text-gray-600 break-all font-mono leading-snug md:text-sm lg:text-sm"
                    title={url}
                >
                    {url.length > 60 ? url.substring(0, 60) + '...' : url}
                </div>
                {!isCompleted && !error && (
                    <button
                        className="bg-red-500 text-white border-none rounded-full w-6 h-6 p-0 cursor-pointer flex items-center justify-center transition-all flex-shrink-0 hover:bg-red-700 hover:scale-110 active:scale-95 lg:w-7 lg:h-7"
                        onClick={() => onCancel(id)}
                        title="Отменить"
                    >
                        <X className="w-4 h-4 lg:w-5 lg:h-5" />
                    </button>
                )}
            </div>

            {error ? (
                <div className="p-2 px-3 bg-red-50 text-red-600 rounded-md text-xs border-l-3 border-red-600 md:p-2.5 md:px-3">
                    {error}
                </div>
            ) : (
                <>
                    <ProgressBar progress={progress} />
                    <div className="flex flex-col gap-2 items-start md:flex-row md:items-center md:gap-3 lg:gap-4 lg:flex-wrap">
                        <div className="font-semibold text-gray-800 text-sm min-w-0 md:text-base md:min-w-[45px] lg:min-w-[50px]">
                            {progress}%
                        </div>
                        {speed > 0 && (
                            <div className="text-xs text-indigo-500 font-medium font-mono md:text-sm">
                                {formatSpeed(speed)}
                            </div>
                        )}
                        {downloaded > 0 && (
                            <div className="text-xs text-gray-600 font-mono md:text-sm">
                                {formatBytes(downloaded)}
                            </div>
                        )}
                    </div>
                    {status && (
                        <div className="text-xs text-gray-600 italic">
                            {status}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default DownloadItem

