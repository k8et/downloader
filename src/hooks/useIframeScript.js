import { useEffect } from 'react'

export function useIframeScript(iframeRef, iframeKey) {
    useEffect(() => {
        if (!iframeRef.current) return

        const iframe = iframeRef.current
        let checkInterval

        const tryInjectScript = () => {
            try {
                if (iframe.contentWindow && iframe.contentDocument) {
                    const script = iframe.contentDocument.createElement('script')
                    script.textContent = `
                        (function() {
                            const m3u8Urls = new Set();
                            
                            function sendUrls() {
                                if (m3u8Urls.size > 0) {
                                    window.parent.postMessage({
                                        type: 'VIDEO_URLS_FOUND',
                                        m3u8Urls: Array.from(m3u8Urls)
                                    }, '*');
                                }
                            }
                            
                            const originalFetch = window.fetch;
                            window.fetch = function(...args) {
                                const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
                                if (url && (url.includes('.m3u8') || (url.includes('cloud.obrut.stream') && url.includes('m3u8')))) {
                                    m3u8Urls.add(url);
                                    sendUrls();
                                }
                                return originalFetch.apply(this, args).then(response => {
                                    if (response.url && response.url.includes('.m3u8')) {
                                        m3u8Urls.add(response.url);
                                        sendUrls();
                                    }
                                    return response;
                                });
                            };
                            
                            const originalXHROpen = XMLHttpRequest.prototype.open;
                            const originalXHRSend = XMLHttpRequest.prototype.send;
                            
                            XMLHttpRequest.prototype.open = function(method, url, ...args) {
                                this._url = url;
                                if (typeof url === 'string' && (url.includes('.m3u8') || (url.includes('cloud.obrut.stream') && url.includes('m3u8')))) {
                                    m3u8Urls.add(url);
                                    sendUrls();
                                }
                                return originalXHROpen.apply(this, [method, url, ...args]);
                            };
                            
                            XMLHttpRequest.prototype.send = function(...args) {
                                if (this._url && this._url.includes('.m3u8')) {
                                    this.addEventListener('load', function() {
                                        if (this.responseURL && this.responseURL.includes('.m3u8')) {
                                            m3u8Urls.add(this.responseURL);
                                            sendUrls();
                                        }
                                    });
                                }
                                return originalXHRSend.apply(this, args);
                            };
                            
                            function searchInScripts() {
                                const scripts = document.querySelectorAll('script');
                                scripts.forEach(script => {
                                    const content = script.textContent || script.innerHTML;
                                    const patterns = [
                                        /https?:\\/\\/[^\\s"']+\\.m3u8[^\\s"']*/gi,
                                        /https?:\\/\\/[^\\s"']*hls\\.m3u8[^\\s"']*/gi,
                                        /https?:\\/\\/[^\\s"']*manifest\\.m3u8[^\\s"']*/gi,
                                        /https?:\\/\\/[^\\s"']*cloud\\.obrut\\.stream[^\\s"']*m3u8[^\\s"']*/gi,
                                        /[^\\s"']*240\\.mp4:hls:manifest\\.m3u8[^\\s"']*/gi,
                                        /[^\\s"']*\\d+\\.mp4:hls:manifest\\.m3u8[^\\s"']*/gi
                                    ];
                                    patterns.forEach(pattern => {
                                        const matches = content.matchAll(pattern);
                                        for (const match of matches) {
                                            const url = match[0].replace(/['"]/g, '').trim();
                                            if (url.includes('.m3u8') || url.includes('manifest.m3u8')) {
                                                m3u8Urls.add(url);
                                            }
                                        }
                                    });
                                });
                                sendUrls();
                            }
                            
                            if (document.readyState === 'loading') {
                                document.addEventListener('DOMContentLoaded', searchInScripts);
                            } else {
                                searchInScripts();
                            }
                            
                            setTimeout(searchInScripts, 2000);
                            setTimeout(searchInScripts, 5000);
                            
                            const observer = new MutationObserver(searchInScripts);
                            observer.observe(document.body, { childList: true, subtree: true });
                        })();
                    `
                    iframe.contentDocument.head.appendChild(script)
                }
            } catch (e) {
                console.log('Cannot inject script (CORS):', e)
            }
        }

        const onLoad = () => {
            setTimeout(tryInjectScript, 1000)
            setTimeout(tryInjectScript, 3000)

            checkInterval = setInterval(() => {
                tryInjectScript()
            }, 5000)
        }

        iframe.addEventListener('load', onLoad)
        if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
            onLoad()
        }

        return () => {
            if (iframe) {
                iframe.removeEventListener('load', onLoad)
            }
            if (checkInterval) {
                clearInterval(checkInterval)
            }
        }
    }, [iframeRef, iframeKey])
}

