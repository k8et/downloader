import { forwardRef } from 'react'

const Input = forwardRef(({
    startContent,
    className = '',
    ...props
}, ref) => {
    return (
        <div className="relative w-full">
            {startContent && (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    {startContent}
                </div>
            )}
            <input
                ref={ref}
                className={`flex-1 pr-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm transition-colors focus:outline-none focus:border-indigo-500 md:text-sm md:py-3 md:pr-3.5 lg:text-base lg:py-3.5 lg:pr-4 ${startContent ? 'pl-10' : 'pl-3 md:pl-3.5 lg:pl-4'} ${className}`}
                {...props}
            />
        </div>
    )
})

Input.displayName = 'Input'

export default Input

