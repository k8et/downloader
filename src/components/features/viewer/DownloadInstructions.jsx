import Button from '../../ui/Button'
import Input from '../../ui/Input'

function DownloadInstructions({ manualUrl, setManualUrl, onAddUrl, isOurPlayer = false }) {
    const instructions = isOurPlayer ? (
        <ol className="list-decimal list-inside space-y-2 text-xs text-blue-800 md:text-sm mb-3">
            <li>Запустите видео в плеере выше</li>
            <li>Откройте DevTools (F12) → вкладка Network</li>
            <li>В фильтре Network введите "m3u8" для поиска</li>
            <li>Найдите запрос с расширением .m3u8 (например, hls.m3u8 или 240.mp4:hls:manifest.m3u8)</li>
            <li>Правый клик на запросе → Copy → Copy URL</li>
            <li>Вставьте скопированный URL в поле ниже и нажмите "Добавить URL"</li>
            <li>Нажмите кнопку "Скачать" рядом с найденным URL</li>
        </ol>
    ) : (
        <ol className="list-decimal list-inside space-y-2 text-xs text-blue-800 md:text-sm mb-3">
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
        <div className="p-3 bg-blue-50 border border-blue-300 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-3 text-sm md:text-base">
                Инструкция по скачиванию видео:
            </h4>
            {instructions}
            <div className="flex flex-col gap-2 md:flex-row md:gap-2 mt-3">
                <Input
                    type="text"
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                    placeholder="Вставьте m3u8 URL из Network вкладки DevTools"
                    className="border-blue-300 focus:border-blue-500 flex-1 w-full"
                />
                <Button
                    onClick={onAddUrl}
                    variant="info"
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

