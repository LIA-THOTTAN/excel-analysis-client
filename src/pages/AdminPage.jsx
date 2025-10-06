// AdminPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Dashboard from './Dashboard';
import UploadHistory from './UploadHistory';
import { toast } from 'react-toastify';

export function AdminPage({ authData, onLogout }) {
    const [stats, setStats] = useState({
        totalUsers: 0,
        admins: 0,
        rejected: 0,
    });
    const [regularUsers, setRegularUsers] = useState([]);
    const [rejectedUsers, setRejectedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activePage, setActivePage] = useState('dashboard');
    const [activeTab, setActiveTab] = useState('users');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();

    const userEmail = authData?.email || '';

    const getAuthHeaders = () => {
        const token = localStorage.getItem('authToken');
        return {
            headers: { Authorization: `Bearer ${token}` },
        };
    };

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const headers = getAuthHeaders();
            const usersResponse = await axios.get('http://localhost:5000/api/users/all', headers);
            const allUsers = usersResponse.data;

            const regularUsersList = allUsers.filter(
                (user) => user.role === 'user' && user.adminRequestStatus !== 'rejected'
            );

            const adminsList = allUsers.filter(
                (user) => user.role === 'admin' && user.adminRequestStatus === 'accepted'
            );

            const rejectedUsersList = allUsers.filter(
                (user) => user.role === 'user' && user.adminRequestStatus === 'rejected'
            );

            setRegularUsers(regularUsersList);
            setRejectedUsers(rejectedUsersList);
            setStats({
                totalUsers: regularUsersList.length,
                admins: adminsList.length,
                rejected: rejectedUsersList.length,
            });
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
            toast.error(err.response?.data?.message || 'Failed to fetch data');
            if (err.response?.status === 403) {
                navigate('/dashboard');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authData?.role !== 'admin' && authData?.role !== 'superadmin') {
            toast.error('Access denied. You are not an admin.');
            navigate('/dashboard');
        } else {
            fetchDashboardData();
        }
    }, [authData, navigate]);

    // Reject user -> move to rejected list
    const handleRejectUser = async (userToReject) => {
        if (window.confirm('Are you sure you want to reject this user?')) {
            try {
                const headers = getAuthHeaders();
                await axios.put(
                    `http://localhost:5000/api/users/reject/${userToReject._id}`,
                    {},
                    headers
                );
                toast.success('User rejected successfully!');
                
                // Optimistic UI update: remove from regularUsers and add to rejectedUsers
                setRegularUsers(prevUsers => prevUsers.filter(user => user._id !== userToReject._id));
                setRejectedUsers(prevUsers => [...prevUsers, { ...userToReject, adminRequestStatus: 'rejected' }]);
                setStats(prevStats => ({
                    ...prevStats,
                    totalUsers: prevStats.totalUsers - 1,
                    rejected: prevStats.rejected + 1
                }));
                setActiveTab('rejected');
            } catch (err) {
                console.error('Failed to reject user:', err);
                toast.error(err.response?.data?.message || 'Failed to reject user.');
            }
        }
    };

    // Unreject user -> move back to regular users
    const handleUnrejectUser = async (userToUnreject) => {
        if (window.confirm('Are you sure you want to unreject this user?')) {
            try {
                const headers = getAuthHeaders();
                await axios.put(
                    `http://localhost:5000/api/users/unreject/${userToUnreject._id}`,
                    {},
                    headers
                );
                toast.success('User moved back to Users!');

                // Optimistic UI update: remove from rejectedUsers and add to regularUsers
                setRejectedUsers(prevUsers => prevUsers.filter(user => user._id !== userToUnreject._id));
                setRegularUsers(prevUsers => [...prevUsers, { ...userToUnreject, adminRequestStatus: null }]);
                setStats(prevStats => ({
                    ...prevStats,
                    totalUsers: prevStats.totalUsers + 1,
                    rejected: prevStats.rejected - 1
                }));
                setActiveTab('users');
            } catch (err) {
                console.error('Failed to unreject user:', err);
                toast.error(err.response?.data?.message || 'Failed to unreject user.');
            }
        }
    };

    const handleLogout = () => {
        onLogout();
        navigate('/Login');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    const renderUserTable = (users, type) => {
        return (
            <div className="overflow-x-auto">
                <table className="min-w-full text-left table-auto">
                    <thead>
                        <tr className="border-b border-[#30363d] text-[#8b949e]">
                            <th className="px-4 py-2">Name</th>
                            <th className="px-4 py-2">Email ID</th>
                            <th className="px-4 py-2">Role</th>
                            <th className="px-4 py-2">Created Date</th>
                            <th className="px-4 py-2">Last Login</th>
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr
                                key={user._id}
                                className="border-b border-[#30363d] hover:bg-[#20262d] transition-colors"
                            >
                                <td className="px-4 py-2">{user.name}</td>
                                <td className="px-4 py-2">{user.email}</td>
                                <td className="px-4 py-2">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            user.role === 'admin' ? 'bg-purple-600' : 'bg-gray-600'
                                        }`}
                                    >
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-4 py-2">{formatDate(user.createdAt)}</td>
                                <td className="px-4 py-2">{formatDate(user.lastLogin)}</td>
                                <td className="px-4 py-2 space-x-2">
                                    {type === 'users' && (
                                        <button
                                            onClick={() => handleRejectUser(user)}
                                            className="bg-red-500 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-red-600 transition-colors"
                                        >
                                            Reject
                                        </button>
                                    )}
                                    {type === 'rejected' && (
                                        <button
                                            onClick={() => handleUnrejectUser(user)}
                                            className="bg-green-500 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-green-600 transition-colors"
                                        >
                                            Unreject
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-[#0d1117] text-[#c9d1d9]">
                Loading...
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans">
            {/* header */}
            <header className="flex items-center justify-between p-4 bg-[#161b22] border-b border-[#30363d] text-[#c9d1d9]">
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <div className="relative">
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center space-x-2 focus:outline-none"
                    >
                        <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold">
                            {userEmail.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span>{userEmail || 'Admin'}</span>
                    </button>
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-[#161b22] border border-[#30363d] rounded-md shadow-lg py-1 z-10">
                            <button
                                onClick={() => navigate('/profile')}
                                className="block w-full text-left px-4 py-2 text-sm text-[#c9d1d9] hover:bg-[#30363d]"
                            >
                                Profile
                            </button>
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-[#30363d]"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* sidebar + content */}
            <div className="flex flex-1">
                <div className="w-64 bg-[#161b22] border-r border-[#30363d] p-6 flex flex-col">
                    <h1 className="text-2xl font-bold mb-8 text-[#58a6ff]">Admin Panel</h1>
                    <nav className="w-full flex-grow">
                        <ul className="space-y-4">
                            <li>
                                <button
                                    onClick={() => setActivePage('dashboard')}
                                    className={`w-full text-left py-2 px-4 rounded-lg transition-colors duration-200 ${
                                        activePage === 'dashboard'
                                            ? 'bg-[#30363d] text-white'
                                            : 'hover:bg-[#30363d] text-[#c9d1d9]'
                                    }`}
                                >
                                    📊 Admin Dashboard
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActivePage('upload')}
                                    className={`w-full text-left py-2 px-4 rounded-lg transition-colors duration-200 ${
                                        activePage === 'upload'
                                            ? 'bg-[#30363d] text-white'
                                            : 'hover:bg-[#30363d] text-[#c9d1d9]'
                                    }`}
                                >
                                    📁 File Upload
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setActivePage('history')}
                                    className={`w-full text-left py-2 px-4 rounded-lg transition-colors duration-200 ${
                                        activePage === 'history'
                                            ? 'bg-[#30363d] text-white'
                                            : 'hover:bg-[#30363d] text-[#c9d1d9]'
                                    }`}
                                >
                                    📜 Upload History
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>

                <div className="flex-1 p-8 overflow-y-auto">
                    {activePage === 'dashboard' && (
                        <div className="flex-1 p-8 overflow-y-auto">
                            <div className="w-full max-w-6xl mx-auto grid grid-cols-2 gap-8 mb-8">
                                <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 text-center shadow-lg">
                                    <h2 className="text-2xl font-bold mb-2">Total Users</h2>
                                    <p className="text-5xl font-extrabold text-purple-500">{stats.totalUsers}</p>
                                </div>
                                <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 text-center shadow-lg">
                                    <h2 className="text-2xl font-bold mb-2">Total Admins</h2>
                                    <p className="text-5xl font-extrabold text-purple-500">{stats.admins}</p>
                                </div>
                            </div>

                            <div className="w-full max-w-6xl mx-auto space-y-8">
                                <div className="flex space-x-4 mb-4">
                                    <button
                                        onClick={() => setActiveTab('users')}
                                        className={`px-4 py-2 rounded-md ${
                                            activeTab === 'users'
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-[#30363d] text-[#c9d1d9]'
                                        }`}
                                    >
                                        Users ({regularUsers.length})
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('rejected')}
                                        className={`px-4 py-2 rounded-md ${
                                            activeTab === 'rejected'
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-[#30363d] text-[#c9d1d9]'
                                        }`}
                                    >
                                        Rejected ({rejectedUsers.length})
                                    </button>
                                </div>
                                <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 shadow-lg">
                                    <h2 className="text-2xl font-bold mb-4">
                                        {activeTab === 'users' ? 'Regular Users' : 'Rejected Users'}
                                    </h2>
                                    {activeTab === 'users' && renderUserTable(regularUsers, 'users')}
                                    {activeTab === 'rejected' && renderUserTable(rejectedUsers, 'rejected')}
                                </div>
                            </div>
                        </div>
                    )}
                    {activePage === 'upload' && <Dashboard />}
                    {activePage === 'history' && <UploadHistory />}
                </div>
            </div>
        </div>
    );
}