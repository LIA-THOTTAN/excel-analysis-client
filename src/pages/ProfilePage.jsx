// src/pages/ProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "../axiosConfig";

const ProfilePage = ({ authData, onLogout }) => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            if (!authData.token) {
                navigate('/login');
                return;
            }

           try {
  const config = {
    headers: {
      Authorization: `Bearer ${authData.token}`,
    },
  };

  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL}/api/users/profile`,
    config
  );

  setProfile(response.data);
} catch (err) {
  console.error('Failed to fetch profile:', err.response?.data?.message || err.message);
  setError('Failed to load profile data.');
} finally {
  setLoading(false);
}

        };

        fetchProfile();
    }, [authData.token, navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0d1117] text-[#c9d1d9]">
                <p>Loading profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0d1117] text-[#c9d1d9]">
                <p className="text-red-400">{error}</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0d1117] text-[#c9d1d9]">
                <p>No profile data available.</p>
            </div>
        );
    }

    // Function to format date and time
    const formatDate = (dateString) => {
        // Check if the date string is valid
        if (!dateString || isNaN(new Date(dateString))) {
            return 'Not available';
        }
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0d1117] text-[#c9d1d9] p-4">
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-8 space-y-6 w-full max-w-md shadow-lg">
                <h1 className="text-3xl font-bold text-center">User Profile</h1>

                <div className="space-y-4">
                    <div className="bg-[#0d1117] border border-[#30363d] rounded-md p-4">
                        <label className="block text-sm font-medium text-[#8b949e]">Username</label>
                        <p className="mt-1 text-lg font-semibold">{profile.name}</p>
                    </div>

                    <div className="bg-[#0d1117] border border-[#30363d] rounded-md p-4">
                        <label className="block text-sm font-medium text-[#8b949e]">Email ID</label>
                        <p className="mt-1 text-lg font-semibold">{profile.email}</p>
                    </div>

                    <div className="bg-[#0d1117] border border-[#30363d] rounded-md p-4">
                        <label className="block text-sm font-medium text-[#8b949e]">Role</label>
                        <p className="mt-1 text-lg font-semibold">{profile.role}</p>
                    </div>

                    <div className="bg-[#0d1117] border border-[#30363d] rounded-md p-4">
                        <label className="block text-sm font-medium text-[#8b949e]">Last Login</label>
                        <p className="mt-1 text-lg font-semibold">
                            {formatDate(profile.lastLogin)}
                        </p>
                    </div>
                    
                    <div className="bg-[#0d1117] border border-[#30363d] rounded-md p-4">
                        <label className="block text-sm font-medium text-[#8b949e]">Created Date</label>
                        <p className="mt-1 text-lg font-semibold">
                            {formatDate(profile.createdAt)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;