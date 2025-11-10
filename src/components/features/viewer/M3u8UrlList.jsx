import { Copy, ExternalLink, Download } from 'lucide-react'
import Button from '../../ui/Button'

function M3u8UrlList({ urls, onDownload }) {
    if (urls.length === 0) return null

    const handleCopy = async (url) => {
        try {
            await navigator.clipboard.writeText(url)
            alert('URL скопирован!')
        } catch (e) {
            console.error('Failed to copy:', e)
        }
    }

    return (
        <div className="p-4 bg-zinc-800/50 border border-emerald-500/30 rounded-lg">
            <h4 className="font-medium text-emerald-400 mb-3 text-sm md:text-base">
                Найдено {urls.length} .m3u8 манифест(ов):
            </h4>
            <div className="space-y-2">
                {urls.map((m3u8Url, index) => (
                    <div key={index} className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-700/50">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                            <code className="flex-1 text-xs text-zinc-300 break-all font-mono md:text-sm">
                                {m3u8Url}
                            </code>
                            <div className="flex gap-2 flex-shrink-0">
                                <Button
                                    onClick={() => handleCopy(m3u8Url)}
                                    variant="secondary"
                                    size="sm"
                                    title="Копировать"
                                >
                                    <Copy className="w-3 h-3" />
                                </Button>
                                <Button
                                    onClick={() => window.open(m3u8Url, '_blank')}
                                    variant="info"
                                    size="sm"
                                    title="Открыть"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                </Button>
                                <Button
                                    onClick={() => onDownload(m3u8Url)}
                                    variant="success"
                                    size="sm"
                                    title="Скачать"
                                >
                                    <Download className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default M3u8UrlList

