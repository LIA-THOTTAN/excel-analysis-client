import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header className="bg-[#161b22] text-[#c9d1d9] p-4 border-b border-[#30363d] shadow-lg fixed top-0 w-full z-10">
            <div className="container mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link to="/" className="text-3xl font-extrabold text-[#58a6ff] hover:text-[#79c0ff] transition-colors">
                        Excelvision
                    </Link>
                </div>
                <nav>
                    <ul className="flex space-x-4">
                        <li>
                            <Link to="/login" className="text-white hover:text-[#58a6ff] transition-colors">
                                Login
                            </Link>
                        </li>
                        <li>
                            <Link to="/register" className="text-white hover:text-[#58a6ff] transition-colors">
                                Register
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default function HomePage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#0d1117] font-sans text-[#c9d1d9]">
            <Header />
            <div className="flex-grow flex items-center justify-center text-center p-8 py-32 mt-16">
                <div>
                    
                    <h1 className="text-6xl md:text-7xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 drop-shadow-lg">
                        Excelvision
                    </h1>
                    
                    <h2 className="text-5xl font-bold mb-4">Unlock Insights Hidden in Your Spreadsheets</h2>
                    <p className="text-lg mb-8">Upload your file and start visualizing now</p>
                    <Link to="/register" className="bg-blue-600 text-white py-3 px-8 rounded-md font-semibold text-lg transition-colors hover:bg-blue-700">
                        Get Started
                    </Link>
                </div>
            </div>

            <div className="bg-[#0d1117] py-24">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-12">Our Key Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 transform transition-transform duration-300 hover:scale-105">
                            <h3 className="text-2xl font-semibold mb-2">📊 Visualize Your Data</h3>
                            <p className="text-[#8b949e]">
                                Turn raw data from your Excel files into stunning and interactive charts and graphs. Understand complex data at a glance.
                            </p>
                        </div>
                        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 transform transition-transform duration-300 hover:scale-105">
                            <h3 className="text-2xl font-semibold mb-2">☁️ Secure Cloud Storage</h3>
                            <p className="text-[#8b949e]">
                                All your uploaded files are securely stored in the cloud. Access your data and visualizations from anywhere, anytime.
                            </p>
                        </div>
                        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 transform transition-transform duration-300 hover:scale-105">
                            <h3 className="text-2xl font-semibold mb-2">⚙️ Intuitive Dashboard</h3>
                            <p className="text-[#8b949e]">
                                Manage your files and view your analytics from a simple, clean, and easy-to-use dashboard designed for a great user experience.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            
            <div className="bg-[#0d1117] py-24">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-12">How It Works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
                            <div className="flex items-center justify-center mb-4">
                                <span className="text-3xl font-bold text-[#58a6ff] mr-2">1.</span>
                                <h3 className="text-xl font-semibold">Upload Your Excel File</h3>
                            </div>
                            <p className="text-[#8b949e]">
                                Drag and drop or select your Excel file to begin the process.
                            </p>
                        </div>
                        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
                            <div className="flex items-center justify-center mb-4">
                                <span className="text-3xl font-bold text-[#58a6ff] mr-2">2.</span>
                                <h3 className="text-xl font-semibold">Select Data Columns</h3>
                            </div>
                            <p className="text-[#8b949e]">
                                Choose the columns you want to visualize from your spreadsheet.
                            </p>
                        </div>
                        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
                            <div className="flex items-center justify-center mb-4">
                                <span className="text-3xl font-bold text-[#58a6ff] mr-2">3.</span>
                                <h3 className="text-xl font-semibold">Generate Chart</h3>
                            </div>
                            <p className="text-[#8b949e]">
                                Our platform automatically creates a beautiful chart from your selected data.
                            </p>
                        </div>
                        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
                            <div className="flex items-center justify-center mb-4">
                                <span className="text-3xl font-bold text-[#58a6ff] mr-2">4.</span>
                                <h3 className="text-xl font-semibold">Download & Share</h3>
                            </div>
                            <p className="text-[#8b949e]">
                                Download your chart as an image or PDF, and share your insights.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="bg-[#0d1117] py-24 text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Data?</h2>
                    <p className="text-xl mb-8 text-[#8b949e]">
                        Join us today and unlock the power of your spreadsheets.
                    </p>
                    <Link to="/register" className="bg-[#58a6ff] text-white py-3 px-8 rounded-md font-semibold text-lg transition-colors hover:bg-[#2083ba]">
                        Register Now
                    </Link>
                </div>
            </div>

            <footer className="bg-[#161b22] text-[#8b949e] p-4 text-center border-t border-[#30363d]">
                <p>&copy; 2024 Excelvision. All rights reserved.</p>
            </footer>
        </div>
    );
}