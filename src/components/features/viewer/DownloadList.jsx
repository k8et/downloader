import DownloadItem from '../downloader/DownloadItem'

function DownloadList({ downloads, onCancel }) {
    if (downloads.length === 0) return null

    return (
        <div className="flex flex-col gap-2.5 mt-2 md:gap-3 lg:gap-4">
            <div className="text-sm font-semibold text-gray-800 mb-1.5 md:text-base md:mb-2 lg:text-lg">
                Активные загрузки ({downloads.length})
            </div>
            {downloads.map(download => (
                <DownloadItem
                    key={download.id}
                    download={download}
                    onCancel={onCancel}
                />
            ))}
        </div>
    )
}

export default DownloadList

