import VideoViewer from '../components/features/viewer/VideoViewer'

function ViewerPage() {
    return (
        <div className="w-full">
            <div className="bg-white rounded-lg p-4 shadow-2xl md:rounded-xl md:p-6 lg:rounded-2xl lg:p-10">
                <VideoViewer />
            </div>
        </div>
    )
}

export default ViewerPage

