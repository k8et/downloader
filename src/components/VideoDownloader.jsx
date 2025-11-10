import { useState } from 'react'
import { downloadHLSVideo } from '../utils/hlsDownloader'
import './VideoDownloader.css'

function formatBytes(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

function formatSpeed(bytesPerSecond) {
    return formatBytes(bytesPerSecond) + '/s'
}

function DownloadItem({ download, onCancel }) {
    const { id, url, progress, status, speed, downloaded, error, isCompleted } = download

    return (
        <div className="download-item">
            <div className="download-item-header">
                <div className="download-item-url" title={url}>
                    {url.length > 60 ? url.substring(0, 60) + '...' : url}
                </div>
                {!isCompleted && !error && (
                    <button
                        className="cancel-button"
                        onClick={() => onCancel(id)}
                        title="Отменить"
                    >
                        ×
                    </button>
                )}
            </div>

            {error ? (
                <div className="download-error">{error}</div>
            ) : (
                <>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="download-item-info">
                        <div className="download-progress-text">
                            {progress}%
                        </div>
                        {speed > 0 && (
                            <div className="download-speed">
                                {formatSpeed(speed)}
                            </div>
                        )}
                        {downloaded > 0 && (
                            <div className="download-size">
                                {formatBytes(downloaded)}
                            </div>
                        )}
                    </div>
                    {status && (
                        <div className="download-status">{status}</div>
                    )}
                </>
            )}
        </div>
    )
}

function VideoDownloader() {
    const [url, setUrl] = useState('')
    const [downloads, setDownloads] = useState([])
    const [error, setError] = useState('')

    const addDownload = (url) => {
        const id = Date.now() + Math.random()
        const newDownload = {
            id,
            url,
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

        downloadHLSVideo(url, (current, total, message, speed, downloaded) => {
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

    const handleDownload = () => {
        if (!url.trim()) {
            setError('Пожалуйста, введите URL')
            return
        }

        if (!url.includes('.m3u8')) {
            setError('URL должен содержать .m3u8 манифест')
            return
        }

        setError('')
        addDownload(url)
        setUrl('')
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

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleDownload()
        }
    }

    return (
        <div className="video-downloader">
            <div className="input-group">
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Вставьте URL .m3u8 манифеста"
                    className="url-input"
                />
                <button
                    onClick={handleDownload}
                    className="download-button"
                >
                    Добавить загрузку
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {downloads.length > 0 && (
                <div className="downloads-list">
                    <div className="downloads-header">
                        Активные загрузки ({downloads.length})
                    </div>
                    {downloads.map(download => (
                        <DownloadItem
                            key={download.id}
                            download={download}
                            onCancel={handleCancel}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default VideoDownloader
