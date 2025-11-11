import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    const signUp = async (email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        })
        return { data, error }
    }

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        return { data, error }
    }

    const signOut = async () => {
        await supabase.auth.signOut()
    }

    const signInWithGoogle = async () => {
        const redirectUrl = import.meta.env.VITE_APP_URL
            ? `${import.meta.env.VITE_APP_URL}/`
            : `${window.location.origin}/`

        console.log('OAuth redirect URL:', redirectUrl)

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUrl,
            },
        })
        return { data, error }
    }

    const value = {
        user,
        loading,
        signUp,
        signIn,
        signOut,
        signInWithGoogle,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

