// src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [requestAdmin, setRequestAdmin] = useState(false);
  const navigate = useNavigate();

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          requestAdmin,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed.');
      }

      alert('Registration successful! Please log in to continue.');
      if (requestAdmin) {
        alert('Your admin request has been submitted for review.');
      }
      navigate('/login');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0d1117] font-sans">
      <div className="w-full max-w-md p-8 bg-[#161b22] border border-[#30363d] rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-[#c9d1d9] mb-6">Register</h2>
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#c9d1d9] mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#c9d1d9] focus:outline-none focus:ring-2 focus:ring-[#58a6ff]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#c9d1d9] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#c9d1d9] focus:outline-none focus:ring-2 focus:ring-[#58a6ff]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#c9d1d9] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#c9d1d9] focus:outline-none focus:ring-2 focus:ring-[#58a6ff]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#c9d1d9] mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-[#c9d1d9] focus:outline-none focus:ring-2 focus:ring-[#58a6ff]"
              required
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="requestAdmin"
              checked={requestAdmin}
              onChange={(e) => setRequestAdmin(e.target.checked)}
              className="h-4 w-4 text-[#58a6ff] focus:ring-[#58a6ff] border-[#30363d] rounded"
            />
            <label htmlFor="requestAdmin" className="ml-2 block text-sm text-[#c9d1d9]">
              Request admin privileges
            </label>
          </div>
          <button
            type="submit"
            className="w-full bg-[#2ea043] text-white py-2 rounded-md font-semibold transition-colors hover:bg-[#238636]"
          >
            Register
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-[#8b949e]">
          Already have an account?
          <Link to="/login" className="text-[#58a6ff] ml-1 hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}