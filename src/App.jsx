import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import ViewerPage from './pages/ViewerPage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import PersonPage from './pages/PersonPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { useAuth } from './contexts/AuthContext'

function AppRoutes() {
    const { user } = useAuth()

    return (
        <Routes>
            <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
            <Route
                path="/"
                element={
                    <Layout>
                        <HomePage />
                    </Layout>
                }
            />
            <Route
                path="/viewer/:kinopoiskId?"
                element={
                    <Layout>
                        <ViewerPage />
                    </Layout>
                }
            />
            <Route
                path="/person/:personId"
                element={
                    <Layout>
                        <PersonPage />
                    </Layout>
                }
            />
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <Layout>
                            <ProfilePage />
                        </Layout>
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

function App() {
    return (
        <Router>
            <AppRoutes />
        </Router>
    )
}

export default App
