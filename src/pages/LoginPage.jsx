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
    const { signIn, signUp } = useAuth()
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

