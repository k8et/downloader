import { forwardRef } from 'react'

const Input = forwardRef(({
    startContent,
    className = '',
    label,
    numeric = false,
    onChange,
    onKeyDown,
    type,
    ...props
}, ref) => {
    const handleKeyDown = (e) => {
        if (numeric) {
            if (!/[0-9.,-]/.test(e.key) &&
                !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key) &&
                !(e.ctrlKey || e.metaKey) &&
                !(e.key === 'a' && (e.ctrlKey || e.metaKey))) {
                e.preventDefault()
            }
        }
        if (onKeyDown) {
            onKeyDown(e)
        }
    }

    const handleChange = (e) => {
        if (numeric) {
            const value = e.target.value
            if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
                if (onChange) {
                    onChange(e)
                }
            }
        } else {
            if (onChange) {
                onChange(e)
            }
        }
    }

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                    {label}
                </label>
            )}
            <div className="relative w-full">
                {startContent && (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        {startContent}
                    </div>
                )}
                <input
                    ref={ref}
                    type={numeric ? 'text' : (type || 'text')}
                    className={`flex-1 w-full pr-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 transition-all focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 md:text-sm md:py-3 md:pr-3.5 lg:text-base lg:py-3.5 lg:pr-4 ${startContent ? 'pl-10' : 'pl-3 md:pl-3.5 lg:pl-4'}`}
                    onKeyDown={numeric ? handleKeyDown : onKeyDown}
                    onChange={numeric ? handleChange : onChange}
                    {...props}
                />
            </div>
        </div>
    )
})

Input.displayName = 'Input'

export default Input

