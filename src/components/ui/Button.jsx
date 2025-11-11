import { forwardRef } from 'react'

const Button = forwardRef(({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    ...props
}, ref) => {
    const baseStyles = 'font-semibold cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700',
        secondary: 'bg-zinc-700 text-zinc-100 hover:bg-zinc-600 active:bg-zinc-800',
        success: 'bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700',
        danger: 'bg-red-600 text-white hover:bg-red-500 active:bg-red-700',
        info: 'bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700',
        warning: 'bg-amber-600 text-white hover:bg-amber-500 active:bg-amber-700'
    }

    const sizes = {
        sm: 'px-2 py-1 text-xs rounded',
        md: 'px-4 py-2 text-sm rounded-lg',
        lg: 'px-5 py-2.5 text-sm rounded-lg md:px-6 md:py-3 lg:px-8 lg:py-3.5 lg:text-base'
    }

    return (
        <button
            ref={ref}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} flex items-center justify-center`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    )
})

Button.displayName = 'Button'

export default Button

