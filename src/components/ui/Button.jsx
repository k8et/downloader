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
        primary: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0',
        secondary: 'bg-gray-500 text-white hover:bg-gray-600',
        success: 'bg-green-500 text-white hover:bg-green-600',
        danger: 'bg-red-500 text-white hover:bg-red-600',
        info: 'bg-blue-500 text-white hover:bg-blue-600',
        warning: 'bg-yellow-500 text-white hover:bg-yellow-600'
    }

    const sizes = {
        sm: 'px-2 py-1 text-xs rounded',
        md: 'px-4 py-2 text-sm rounded-lg',
        lg: 'px-5 py-2.5 text-sm rounded-lg md:px-6 md:py-3 lg:px-8 lg:py-3.5 lg:text-base'
    }

    return (
        <button
            ref={ref}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    )
})

Button.displayName = 'Button'

export default Button

