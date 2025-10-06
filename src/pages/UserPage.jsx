import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import UploadHistory from './UploadHistory';
import UserProfile from './ProfilePage'; 

const UserPage = ({ authData, onLogout }) => {
    const [activePage, setActivePage] = useState('upload');
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const userEmail = authData?.email || 'User';

    const handleLogout = () => {
        onLogout();
        navigate('/Login');
    };

    const toggleDropdown = () => {
        setShowDropdown(prevState => !prevState);
    };

    const handlePageChange = (page) => {
        setActivePage(page);
        setShowDropdown(false); 
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans">
            <header className="flex items-center justify-between p-4 bg-[#161b22] border-b border-[#30363d] relative">
                <h1 className="text-xl font-bold">Dashboard Overview</h1>
                <div className="relative" ref={dropdownRef}>
                    <div
                        onClick={toggleDropdown}
                        className="flex items-center space-x-2 cursor-pointer"
                    >
                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold">
                            {userEmail.charAt(0).toUpperCase()}
                        </div>
                        <span>{userEmail}</span>
                    </div>

                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-[#161b22] border border-[#30363d] rounded-md shadow-lg py-1 z-10">
                            <button
                                onClick={() => handlePageChange('profile')}
                                className="w-full text-left px-4 py-2 text-[#c9d1d9] hover:bg-[#30363d]"
                            >
                                 Profile
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 text-red-400 hover:bg-[#30363d]"
                            >
                                 Logout
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <div className="flex flex-1">
                <div className="w-64 bg-[#161b22] border-r border-[#30363d] p-6 flex flex-col">
                    <h2 className="text-2xl font-bold mb-8 text-[#58a6ff]">User Dashboard</h2>
                    <nav className="w-full">
                        <ul className="space-y-4">
                            <li>
                                <button
                                    onClick={() => handlePageChange('upload')}
                                    className={`w-full text-left py-2 px-4 rounded-lg transition-colors duration-200 ${
                                        activePage === 'upload' ? 'bg-[#30363d] text-white' : 'hover:bg-[#30363d] text-[#c9d1d9]'
                                    }`}
                                >
                                    📁 Upload Files
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => handlePageChange('history')}
                                    className={`w-full text-left py-2 px-4 rounded-lg transition-colors duration-200 ${
                                        activePage === 'history' ? 'bg-[#30363d] text-white' : 'hover:bg-[#30363d] text-[#c9d1d9]'
                                    }`}
                                >
                                    📜 Upload History
                                </button>
                            </li>
                            <li>
                                
                            </li>
                        </ul>
                    </nav>
                </div>

                <main className="flex-1 p-8 overflow-y-auto">
                    {activePage === 'upload' && <Dashboard />}
                    {activePage === 'history' && <UploadHistory />}
                    {activePage === 'profile' && <UserProfile authData={authData} />}
                </main>
            </div>
        </div>
    );
};

export default UserPage;