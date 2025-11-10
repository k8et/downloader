import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import ViewerPage from './pages/ViewerPage'

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/viewer/:kinopoiskId?" element={<ViewerPage />} />
                </Routes>
            </Layout>
        </Router>
    )
}

export default App
