import { useState, useRef, useEffect, useMemo } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'

const Select = ({
    startContent,
    className = '',
    placeholder = 'Выберите...',
    value,
    onChange,
    searchable = false,
    searchPlaceholder = 'Поиск...',
    children,
    options: optionsProp,
    disabled = false,
    label,
    ...props
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const containerRef = useRef(null)
    const searchInputRef = useRef(null)
    const optionsRef = useRef(null)

    const options = useMemo(() => {
        if (optionsProp && Array.isArray(optionsProp)) {
            return optionsProp.map(opt => ({
                value: opt.value ?? opt.id,
                label: opt.label ?? opt.name ?? opt.genre ?? opt.country ?? String(opt.value ?? opt.id),
                disabled: opt.disabled || false
            }))
        }

        const opts = []
        if (children) {
            if (Array.isArray(children)) {
                children.forEach(child => {
                    if (child && child.props) {
                        opts.push({
                            value: child.props.value,
                            label: child.props.children || child.props.value,
                            disabled: child.props.disabled
                        })
                    }
                })
            } else if (children.props) {
                opts.push({
                    value: children.props.value,
                    label: children.props.children || children.props.value,
                    disabled: children.props.disabled
                })
            }
        }
        return opts
    }, [children, optionsProp])

    const filteredOptions = useMemo(() => {
        if (!searchable || !searchQuery) return options
        const query = searchQuery.toLowerCase()
        return options.filter(opt =>
            String(opt.label).toLowerCase().includes(query) ||
            String(opt.value).toLowerCase().includes(query)
        )
    }, [options, searchQuery, searchable])

    const selectedOption = useMemo(() => {
        return options.find(opt => String(opt.value) === String(value)) || null
    }, [options, value])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false)
                setSearchQuery('')
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            if (searchable && searchInputRef.current) {
                setTimeout(() => searchInputRef.current?.focus(), 100)
            }
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen, searchable])

    useEffect(() => {
        if (isOpen && optionsRef.current) {
            const selectedElement = optionsRef.current.querySelector('[data-selected="true"]')
            if (selectedElement) {
                selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
            }
        }
    }, [isOpen, value])

    const handleSelect = (optionValue) => {
        if (onChange) {
            const event = {
                target: { value: optionValue }
            }
            onChange(event)
        }
        setIsOpen(false)
        setSearchQuery('')
    }

    const handleToggle = () => {
        if (!disabled) {
            setIsOpen(!isOpen)
            if (!isOpen) {
                setSearchQuery('')
            }
        }
    }

    const handleKeyDown = (e) => {
        if (disabled) return

        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleToggle()
        } else if (e.key === 'Escape') {
            setIsOpen(false)
            setSearchQuery('')
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault()
            if (!isOpen) {
                setIsOpen(true)
            } else {
                const currentIndex = filteredOptions.findIndex(opt => String(opt.value) === String(value))
                let nextIndex = currentIndex

                if (e.key === 'ArrowDown') {
                    nextIndex = currentIndex < filteredOptions.length - 1 ? currentIndex + 1 : 0
                } else {
                    nextIndex = currentIndex > 0 ? currentIndex - 1 : filteredOptions.length - 1
                }

                if (filteredOptions[nextIndex] && !filteredOptions[nextIndex].disabled) {
                    handleSelect(filteredOptions[nextIndex].value)
                }
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
            <div ref={containerRef} className="relative w-full">
                <button
                    type="button"
                    onClick={handleToggle}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    className={`w-full flex items-center justify-between pr-10 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 transition-all focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed md:text-sm md:py-3 lg:text-base lg:py-3.5 ${startContent ? 'pl-10' : 'pl-3 md:pl-3.5 lg:pl-4'
                        } ${isOpen ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}
                    {...props}
                >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        {startContent && (
                            <div className="flex-shrink-0">
                                {startContent}
                            </div>
                        )}
                        <span className={`flex-1 text-left truncate ${!selectedOption ? 'text-zinc-500' : ''}`}>
                            {selectedOption ? selectedOption.label : placeholder}
                        </span>
                    </div>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                </button>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl max-h-60 overflow-hidden flex flex-col">
                        {searchable && (
                            <div className="p-2 border-b border-zinc-700">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={searchPlaceholder}
                                        className="w-full pl-10 pr-8 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setSearchQuery('')
                                                searchInputRef.current?.focus()
                                            }}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-zinc-700 rounded transition-colors"
                                        >
                                            <X className="w-3 h-3 text-zinc-400" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        <div
                            ref={optionsRef}
                            className="overflow-y-auto max-h-64"
                        >
                            {filteredOptions.length === 0 ? (
                                <div className="px-4 py-3 text-sm text-zinc-400 text-center">
                                    Ничего не найдено
                                </div>
                            ) : (
                                filteredOptions.map((option) => {
                                    const isSelected = String(option.value) === String(value)
                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => !option.disabled && handleSelect(option.value)}
                                            disabled={option.disabled}
                                            data-selected={isSelected}
                                            className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${isSelected
                                                ? 'bg-blue-600/20 text-blue-400'
                                                : 'text-zinc-100 hover:bg-zinc-700'
                                                } ${option.disabled
                                                    ? 'opacity-50 cursor-not-allowed'
                                                    : 'cursor-pointer'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    )
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

Select.displayName = 'Select'

export default Select
