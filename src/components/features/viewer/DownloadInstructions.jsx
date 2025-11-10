import Button from '../../ui/Button'
import Input from '../../ui/Input'

function DownloadInstructions({ manualUrl, setManualUrl, onAddUrl, isOurPlayer = false }) {
    const instructions = isOurPlayer ? (
        <ol className="list-decimal list-inside space-y-1.5">
            <li>Запустите видео в плеере выше</li>
            <li>Откройте DevTools (F12) → вкладка Network</li>
            <li>В фильтре Network введите "m3u8" для поиска</li>
            <li>Найдите запрос с расширением .m3u8 (например, hls.m3u8 или 240.mp4:hls:manifest.m3u8)</li>
            <li>Правый клик на запросе → Copy → Copy URL</li>
            <li>Вставьте скопированный URL в поле ниже и нажмите "Добавить URL"</li>
            <li>Нажмите кнопку "Скачать" рядом с найденным URL</li>
        </ol>
    ) : (
        <ol className="list-decimal list-inside space-y-1.5">
            <li>Откройте сайт с видео в браузере</li>
            <li>Запустите воспроизведение видео</li>
            <li>Откройте DevTools (F12) → вкладка Network</li>
            <li>В фильтре Network введите "m3u8" для поиска</li>
            <li>Найдите запрос с расширением .m3u8 (например, hls.m3u8 или manifest.m3u8)</li>
            <li>Правый клик на запросе → Copy → Copy URL</li>
            <li>Вставьте скопированный URL в поле ниже и нажмите "Добавить URL"</li>
            <li>Нажмите кнопку "Скачать" рядом с найденным URL</li>
        </ol>
    )

    return (
        <div className="p-4 bg-zinc-800/50 border border-zinc-700/50 rounded-lg">
            <h4 className="font-medium text-zinc-200 mb-3 text-sm md:text-base">
                Инструкция по скачиванию видео:
            </h4>
            <div className="text-xs text-zinc-400 md:text-sm mb-4">
                {instructions}
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:gap-2">
                <Input
                    type="text"
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                    placeholder="Вставьте m3u8 URL из Network вкладки DevTools"
                    className="flex-1 w-full"
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            onAddUrl()
                        }
                    }}
                />
                <Button
                    onClick={onAddUrl}
                    variant="primary"
                    size="md"
                    className="whitespace-nowrap"
                >
                    Добавить URL
                </Button>
            </div>
        </div>
    )
}

export default DownloadInstructions

