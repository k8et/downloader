import { useState } from 'react'
import VideoDownloader from './components/VideoDownloader'
import './App.css'

function App() {
    return (
        <div className="app">
            <div className="app-container">
                <h1 className="app-title">HLS Video Downloader</h1>
                <VideoDownloader />
            </div>
        </div>
    )
}

export default App

