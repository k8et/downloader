import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

function LoginPage() {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const { signIn, signUp, signInWithGoogle } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            let result
            if (isLogin) {
                result = await signIn(email, password)
            } else {
                result = await signUp(email, password)
            }

            if (result.error) {
                setError(result.error.message)
            } else {
                navigate('/')
            }
        } catch (err) {
            setError('Произошла ошибка. Попробуйте еще раз.')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        setError('')
        setGoogleLoading(true)

        try {
            const { error } = await signInWithGoogle()
            if (error) {
                setError(error.message)
                setGoogleLoading(false)
            }
        } catch (err) {
            setError('Произошла ошибка при входе через Google.')
            setGoogleLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-900 px-4">
            <div className="w-full max-w-md">
                <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-light text-zinc-100 mb-2">
                            {isLogin ? 'Вход' : 'Регистрация'}
                        </h1>
                        <p className="text-zinc-400 text-sm">
                            {isLogin
                                ? 'Войдите в свой аккаунт'
                                : 'Создайте новый аккаунт'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            startContent={<Mail className="w-5 h-5 text-zinc-500" />}
                            required
                        />

                        <Input
                            label="Пароль"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            startContent={<Lock className="w-5 h-5 text-zinc-500" />}
                            required
                            minLength={6}
                        />

                        {error && (
                            <div className="p-3 bg-red-950/30 border border-red-800/50 text-red-400 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? (
                                'Загрузка...'
                            ) : (
                                <>
                                    {isLogin ? (
                                        <>
                                            <LogIn className="w-4 h-4 mr-2" />
                                            Войти
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-4 h-4 mr-2" />
                                            Зарегистрироваться
                                        </>
                                    )}
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-zinc-700/50"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 text-zinc-400 mb-[2px]">или</span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="secondary"
                            size="lg"
                            disabled={loading || googleLoading}
                            onClick={handleGoogleSignIn}
                            className="w-full"
                        >
                            {googleLoading ? (
                                'Загрузка...'
                            ) : (
                                <>
                                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                        <path
                                            fill="currentColor"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    Войти через Google
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin)
                                setError('')
                            }}
                            className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
                        >
                            {isLogin
                                ? 'Нет аккаунта? Зарегистрироваться'
                                : 'Уже есть аккаунт? Войти'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginPage

