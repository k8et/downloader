import { useEffect, useRef } from 'react'

export function useNetworkMonitor(setFoundM3u8Urls, iframeKey) {
    const observerRef = useRef(null)

    useEffect(() => {
        const m3u8Urls = new Set()

        const checkAllPerformanceEntries = () => {
            try {
                const allEntries = performance.getEntriesByType('resource')
                allEntries.forEach(entry => {
                    const entryUrl = entry.name
                    if (entryUrl && (entryUrl.includes('.m3u8') || entryUrl.includes('hls') || entryUrl.includes('manifest'))) {
                        if (entryUrl.includes('.m3u8') || entryUrl.includes('manifest.m3u8') || entryUrl.includes('hls.m3u8')) {
                            m3u8Urls.add(entryUrl)
                        }
                    }
                })

                const navigationEntries = performance.getEntriesByType('navigation')
                navigationEntries.forEach(entry => {
                    const entryUrl = entry.name
                    if (entryUrl && entryUrl.includes('.m3u8')) {
                        m3u8Urls.add(entryUrl)
                    }
                })

                if (m3u8Urls.size > 0) {
                    setFoundM3u8Urls(prev => {
                        const combined = [...prev, ...Array.from(m3u8Urls)]
                        return [...new Set(combined)]
                    })
                }
            } catch (e) {
                console.log('Performance check error:', e)
            }
        }

        if (observerRef.current) {
            observerRef.current.disconnect()
        }

        observerRef.current = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                const entryUrl = entry.name || entry.url || (entry.requestStart && entry.name)
                if (entryUrl && typeof entryUrl === 'string') {
                    if (entryUrl.includes('.m3u8') ||
                        entryUrl.includes('hls.m3u8') ||
                        entryUrl.includes('manifest.m3u8') ||
                        (entryUrl.includes('cloud.obrut.stream') && entryUrl.includes('m3u8'))) {
                        m3u8Urls.add(entryUrl)
                        setFoundM3u8Urls(prev => {
                            const combined = [...prev, entryUrl]
                            return [...new Set(combined)]
                        })
                    }
                }
            }
        })

        try {
            observerRef.current.observe({ entryTypes: ['resource', 'navigation', 'measure'] })
        } catch (e) {
            console.log('PerformanceObserver setup error:', e)
        }

        const interval = setInterval(checkAllPerformanceEntries, 500)

        const originalFetch = window.fetch
        window.fetch = function (...args) {
            const fetchUrl = typeof args[0] === 'string' ? args[0] : args[0]?.url || args[0]?.href
            if (fetchUrl && typeof fetchUrl === 'string') {
                if (fetchUrl.includes('.m3u8') ||
                    (fetchUrl.includes('cloud.obrut.stream') && fetchUrl.includes('m3u8'))) {
                    m3u8Urls.add(fetchUrl)
                    setFoundM3u8Urls(prev => {
                        const combined = [...prev, fetchUrl]
                        return [...new Set(combined)]
                    })
                }
            }
            return originalFetch.apply(this, args).then(response => {
                const responseUrl = response.url || response.redirected ? response.url : null
                if (responseUrl && responseUrl.includes('.m3u8')) {
                    m3u8Urls.add(responseUrl)
                    setFoundM3u8Urls(prev => {
                        const combined = [...prev, responseUrl]
                        return [...new Set(combined)]
                    })
                }
                return response
            }).catch(err => {
                return Promise.reject(err)
            })
        }

        const originalXHROpen = XMLHttpRequest.prototype.open
        const originalXHRSend = XMLHttpRequest.prototype.send

        XMLHttpRequest.prototype.open = function (method, url, ...args) {
            this._url = url
            if (typeof url === 'string' && (url.includes('.m3u8') || (url.includes('cloud.obrut.stream') && url.includes('m3u8')))) {
                m3u8Urls.add(url)
                setFoundM3u8Urls(prev => {
                    const combined = [...prev, url]
                    return [...new Set(combined)]
                })
            }
            return originalXHROpen.apply(this, [method, url, ...args])
        }

        XMLHttpRequest.prototype.send = function (...args) {
            if (this._url && typeof this._url === 'string' && this._url.includes('.m3u8')) {
                this.addEventListener('load', function () {
                    if (this.responseURL && this.responseURL.includes('.m3u8')) {
                        m3u8Urls.add(this.responseURL)
                        setFoundM3u8Urls(prev => {
                            const combined = [...prev, this.responseURL]
                            return [...new Set(combined)]
                        })
                    }
                })
            }
            return originalXHRSend.apply(this, args)
        }

        checkAllPerformanceEntries()

        return () => {
            clearInterval(interval)
            if (observerRef.current) {
                observerRef.current.disconnect()
            }
            window.fetch = originalFetch
            XMLHttpRequest.prototype.open = originalXHROpen
            XMLHttpRequest.prototype.send = originalXHRSend
        }
    }, [iframeKey, setFoundM3u8Urls])
}

