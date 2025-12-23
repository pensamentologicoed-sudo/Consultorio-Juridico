import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import { AuthProvider } from './contexts/AuthContext';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/dashboard/*" element={<DashboardPage />} />
                    <Route path="/agendar" element={<LandingPage />} /> {/* Placeholder for now */}
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
