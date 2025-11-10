import DownloadItem from '../downloader/DownloadItem'

function DownloadList({ downloads, onCancel }) {
    if (downloads.length === 0) return null

    return (
        <div className="flex flex-col gap-3">
            <div className="text-sm font-medium text-zinc-300 mb-1 md:text-base">
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

