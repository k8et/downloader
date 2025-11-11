import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { addToWatchHistory } from '../lib/supabaseQueries'

const WATCH_TIME_THRESHOLD = 60 // 1 minute in seconds

export const useWatchHistoryTimer = (filmData, kinopoiskId, playerOpened) => {
    const { user } = useAuth()
    const [timeSpent, setTimeSpent] = useState(0)
    const timerRef = useRef(null)
    const savedRef = useRef(false)
    const startTimeRef = useRef(null)

    useEffect(() => {
        if (playerOpened && !savedRef.current && user && filmData && kinopoiskId) {
            startTimeRef.current = Date.now()

            timerRef.current = setInterval(() => {
                if (!startTimeRef.current) return

                const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
                setTimeSpent(elapsed)

                if (elapsed >= WATCH_TIME_THRESHOLD && !savedRef.current) {
                    savedRef.current = true

                    addToWatchHistory(user.id, filmData)
                        .catch((error) => {
                            console.error('Error saving watch history:', error)
                            savedRef.current = false
                        })

                    if (timerRef.current) {
                        clearInterval(timerRef.current)
                        timerRef.current = null
                    }
                }
            }, 1000)
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }

            if (!playerOpened) {
                setTimeSpent(0)
                startTimeRef.current = null
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
        }
    }, [playerOpened, user, filmData, kinopoiskId])

    useEffect(() => {
        if (!kinopoiskId) {
            setTimeSpent(0)
            savedRef.current = false
            startTimeRef.current = null
            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
        } else {
            savedRef.current = false
            setTimeSpent(0)
            startTimeRef.current = null
            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
        }
    }, [kinopoiskId])

    return { timeSpent, saved: savedRef.current }
}

