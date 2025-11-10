import { Parser } from 'm3u8-parser'

async function fetchWithRetry(url, maxRetries = 5, baseDelay = 1000, returnText = false, onProgress = null) {
    let lastError = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const startTime = Date.now()
            const response = await fetch(url)
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            if (returnText) {
                return await response.text()
            }

            const reader = response.body.getReader()
            const contentLength = parseInt(response.headers.get('content-length') || '0', 10)
            const chunks = []
            let receivedLength = 0

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                chunks.push(value)
                receivedLength += value.length

                if (onProgress && contentLength > 0) {
                    const elapsed = (Date.now() - startTime) / 1000
                    const speed = elapsed > 0 ? receivedLength / elapsed : 0
                    onProgress(receivedLength, contentLength, speed)
                }
            }

            const allChunks = new Uint8Array(receivedLength)
            let position = 0
            for (const chunk of chunks) {
                allChunks.set(chunk, position)
                position += chunk.length
            }

            return allChunks.buffer
        } catch (error) {
            lastError = error

            if (attempt < maxRetries) {
                const delay = baseDelay * Math.pow(2, attempt - 1)
                await new Promise(resolve => setTimeout(resolve, delay))
            }
        }
    }

    throw lastError
}

export async function downloadHLSVideo(url, onProgress, onCancel = null) {
    const baseUrl = url.substring(0, url.lastIndexOf('/') + 1)
    let cancelled = false

    if (onCancel) {
        onCancel(() => { cancelled = true })
    }

    onProgress(0, 0, 'Загрузка манифеста...', 0, 0)

    let manifestText
    try {
        manifestText = await fetchWithRetry(url, 3, 500, true)
    } catch (error) {
        throw new Error(`Ошибка загрузки манифеста: ${error.message}`)
    }

    if (cancelled) throw new Error('Загрузка отменена')

    const segments = parseManifest(manifestText, baseUrl)

    if (segments.length === 0) {
        throw new Error('Не найдено сегментов в манифесте')
    }

    onProgress(0, segments.length, `Найдено ${segments.length} сегментов`, 0, 0)

    const segmentBuffers = []
    const failedSegments = []
    let totalDownloaded = 0
    const downloadStartTime = Date.now()
    const speedHistory = []
    const SPEED_HISTORY_SIZE = 10

    for (let i = 0; i < segments.length; i++) {
        if (cancelled) throw new Error('Загрузка отменена')

        const segmentUrl = segments[i]

        try {
            const segmentStartTime = Date.now()
            const arrayBuffer = await fetchWithRetry(segmentUrl, 5, 1000, false)

            segmentBuffers.push(arrayBuffer)
            totalDownloaded += arrayBuffer.byteLength

            const elapsed = (Date.now() - downloadStartTime) / 1000
            const currentSpeed = elapsed > 0 ? totalDownloaded / elapsed : 0

            speedHistory.push(currentSpeed)
            if (speedHistory.length > SPEED_HISTORY_SIZE) {
                speedHistory.shift()
            }
            const avgSpeed = speedHistory.reduce((a, b) => a + b, 0) / speedHistory.length

            const failedCount = failedSegments.length
            const statusMsg = failedCount > 0
                ? `Скачано ${i + 1}/${segments.length} (пропущено: ${failedCount})`
                : `Скачано ${i + 1}/${segments.length} сегментов`

            onProgress(i + 1, segments.length, statusMsg, avgSpeed, totalDownloaded)
        } catch (error) {
            failedSegments.push({ index: i + 1, url: segmentUrl, error: error.message })
            segmentBuffers.push(null)

            const failedCount = failedSegments.length
            const elapsed = (Date.now() - downloadStartTime) / 1000
            const currentSpeed = elapsed > 0 ? totalDownloaded / elapsed : 0

            speedHistory.push(currentSpeed)
            if (speedHistory.length > SPEED_HISTORY_SIZE) {
                speedHistory.shift()
            }
            const avgSpeed = speedHistory.length > 0 ? speedHistory.reduce((a, b) => a + b, 0) / speedHistory.length : 0

            onProgress(i + 1, segments.length, `Ошибка сегмента ${i + 1}, продолжение... (пропущено: ${failedCount})`, avgSpeed, totalDownloaded)
        }
    }

    if (cancelled) throw new Error('Загрузка отменена')

    const successfulSegments = segmentBuffers.filter(buf => buf !== null)

    if (successfulSegments.length === 0) {
        throw new Error('Не удалось скачать ни одного сегмента')
    }

    const elapsed = (Date.now() - downloadStartTime) / 1000
    const finalSpeed = elapsed > 0 ? totalDownloaded / elapsed : 0

    if (failedSegments.length > 0) {
        onProgress(segments.length, segments.length,
            `Объединение ${successfulSegments.length}/${segments.length} сегментов (пропущено: ${failedSegments.length})...`, finalSpeed, totalDownloaded)
    } else {
        onProgress(segments.length, segments.length, 'Объединение сегментов...', finalSpeed, totalDownloaded)
    }

    onProgress(segments.length, segments.length, 'Создание файла...', finalSpeed, totalDownloaded)

    const blob = new Blob(successfulSegments, { type: 'video/mp4' })
    const downloadUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = getFileNameFromUrl(url) || 'video.mp4'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(downloadUrl)

    if (failedSegments.length > 0) {
        console.warn('Не удалось скачать сегменты:', failedSegments)
    }
}

function parseManifest(manifestText, baseUrl) {
    const parser = new Parser()
    parser.push(manifestText)
    parser.end()

    const manifest = parser.manifest
    const segments = []

    if (manifest.playlists && manifest.playlists.length > 0) {
        throw new Error('Обнаружен master playlist. Пожалуйста, используйте URL конкретного media playlist')
    }

    if (manifest.segments && manifest.segments.length > 0) {
        for (const segment of manifest.segments) {
            let segmentUrl = segment.uri

            if (!segmentUrl.startsWith('http://') && !segmentUrl.startsWith('https://')) {
                if (segmentUrl.startsWith('/')) {
                    const urlObj = new URL(baseUrl)
                    segmentUrl = `${urlObj.protocol}//${urlObj.host}${segmentUrl}`
                } else {
                    segmentUrl = baseUrl + segmentUrl
                }
            }

            segments.push(segmentUrl)
        }
    }

    return segments
}

function getFileNameFromUrl(url) {
    try {
        const urlObj = new URL(url)
        const pathParts = urlObj.pathname.split('/')
        const fileName = pathParts[pathParts.length - 1]

        if (fileName && fileName.includes('.')) {
            return fileName.replace(/\.m3u8$/, '.mp4')
        }

        return 'video.mp4'
    } catch {
        return 'video.mp4'
    }
}


