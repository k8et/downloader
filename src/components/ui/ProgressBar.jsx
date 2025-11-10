function ProgressBar({ progress, className = '' }) {
    return (
        <div className={`w-full h-1.5 bg-zinc-700 rounded-full overflow-hidden relative ${className}`}>
            <div
                className="h-full bg-blue-500 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
            />
        </div>
    )
}

export default ProgressBar

