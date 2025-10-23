// src/pages/Login.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "../axiosConfig";

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // ✅ Use axios instance directly (baseURL is already set)
            const response = await axios.post("/api/users/login", { email, password });

            const { token, role, email: userEmail, name } = response.data;

            localStorage.setItem('authToken', token);
            localStorage.setItem('userRole', role);
            localStorage.setItem('userEmail', userEmail);
            localStorage.setItem('userName', name);

            onLogin(token, role, userEmail, name);

            if (role === 'user') navigate('/dashboard');
            else if (role === 'admin') navigate('/admin');
            else if (role === 'superadmin') navigate('/superadmin');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#0d1117] text-[#c9d1d9]">
            <div className="w-full max-w-md p-8 space-y-6 bg-[#161b22] border border-[#30363d] rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-center text-[#c9d1d9]">Login</h1>
                {error && <div className="p-3 text-red-400 bg-red-900/30 border border-red-500 rounded-md">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[#c9d1d9]">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 mt-1 bg-[#0d1117] border border-[#30363d] rounded-md focus:outline-none focus:ring focus:ring-[#58a6ff]"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#c9d1d9]">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 mt-1 bg-[#0d1117] border border-[#30363d] rounded-md focus:outline-none focus:ring focus:ring-[#58a6ff]"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full px-4 py-2 text-white bg-[#0370a7] rounded-md hover:bg-[#2083ba] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#58a6ff] disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <p className="text-center text-sm text-[#8b949e]">
                    Don't have an account?{' '}
                    <a href="/register" className="text-[#58a6ff] hover:underline">
                        Register
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Login;
