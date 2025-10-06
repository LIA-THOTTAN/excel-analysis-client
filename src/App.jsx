// src/App.jsx

import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import {AdminPage} from './pages/AdminPage';
import SuperAdminPage from './pages/SuperAdminPage';
import UserPage from './pages/UserPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
    const [authData, setAuthData] = useState(() => {
        const storedToken = localStorage.getItem('authToken');
        const storedRole = localStorage.getItem('userRole');
        const storedEmail = localStorage.getItem('userEmail');
        const storedName = localStorage.getItem('userName'); 
        return { token: storedToken, role: storedRole, email: storedEmail, name: storedName };
    });

    const handleLogin = (token, role, email, name) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('userRole', role);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', name); 
        setAuthData({ token, role, email, name });
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        setAuthData({ token: null, role: null, email: null, name: null });
    };
    
    // Corrected onUpdateProfile function
    const handleUpdateProfile = (updatedUser) => {
        localStorage.setItem('userName', updatedUser.name);
        localStorage.setItem('userEmail', updatedUser.email);
        setAuthData(prev => ({
            ...prev,
            name: updatedUser.name,
            email: updatedUser.email,
        }));
    };

    const ProtectedRoute = ({ children, requiredRole }) => {
        if (!authData.token) {
            return <Navigate to="/login" replace />;
        }
        if (requiredRole && authData.role !== requiredRole) {
            return <Navigate to="/unauthorized" replace />;
        }
        // Pass the onUpdateProfile function to the children
        return React.cloneElement(children, { authData, onLogout: handleLogout, onUpdateProfile: handleUpdateProfile });
    };

    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register />} />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute requiredRole="user">
                        <UserPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin"
                element={
                    <ProtectedRoute requiredRole="admin">
                        <AdminPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/superadmin"
                element={
                    <ProtectedRoute requiredRole="superadmin">
                        <SuperAdminPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}