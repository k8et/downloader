function ProgressBar({ progress, className = '' }) {
    return (
        <div className={`w-full h-4 bg-gray-200 rounded-md overflow-hidden relative md:h-5 md:rounded-lg ${className}`}>
            <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 rounded-md md:rounded-lg"
                style={{ width: `${progress}%` }}
            />
        </div>
    )
}

export default ProgressBar

