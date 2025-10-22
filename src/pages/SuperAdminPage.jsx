import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Users, UserPlus, Clock, UserCheck } from 'lucide-react';

const SuperAdminDashboard = () => {
    const [stats, setStats] = useState({
        users: 0,
        superAdmins: 0,
        admins: 0,
        pending: 0,
        rejected: 0,
    });
    const [pendingAdmins, setPendingAdmins] = useState([]);
    const [allAdmins, setAllAdmins] = useState([]);
    const [rejectedAdmins, setRejectedAdmins] = useState([]);
    const [regularUsers, setRegularUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('pending');
    const [userEmail, setUserEmail] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const [activePage, setActivePage] = useState('dashboard');

    const getAuthHeaders = () => {
        const token = localStorage.getItem('authToken');
        return {
            headers: { Authorization:  `Bearer ${token}` },
        };
    };

    const fetchDashboardData = async () => {
        try {
            const config = getAuthHeaders();
            const token = localStorage.getItem('authToken');

            if (!token) {
                toast.error('You are not authenticated. Please log in.');
                navigate('/login');
                return;
            }

            const profileRes = await axios.get('/api/users/profile', config);
            setUserEmail(profileRes.data.email);

            const allUsersRes = await axios.get('/api/users/all', config);
            const allUsersList = allUsersRes.data;

            const superAdminsList = allUsersList.filter(user => user.role === 'superadmin');
            const adminsList = allUsersList.filter(user => user.role === 'admin' && user.adminRequestStatus === 'accepted');
            const pendingAdminsList = allUsersList.filter(user => user.adminRequestStatus === 'pending');
            const rejectedAdminsList = allUsersList.filter(user => user.adminRequestStatus === 'rejected');
            const regularUsersList = allUsersList.filter(user => user.role === 'user' && user.adminRequestStatus === null);

            setStats({
                users: regularUsersList.length,
                superAdmins: superAdminsList.length,
                admins: adminsList.length,
                pending: pendingAdminsList.length,
                rejected: rejectedAdminsList.length,
            });

            setPendingAdmins(pendingAdminsList);
            setAllAdmins(adminsList);
            setRejectedAdmins(rejectedAdminsList);
            setRegularUsers(regularUsersList);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                toast.error('Session expired or access denied. Please log in again.');
                localStorage.removeItem('authToken');
                navigate('/login');
            } else {
                toast.error('Failed to fetch dashboard data. Please check your network.');
            }
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [navigate]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleApprove = async (userId) => {
        try {
            const config = getAuthHeaders();
            await axios.put(`/api/users/approve/${userId}`, {}, config);
            toast.success('Admin approved successfully!');
            fetchDashboardData();
        } catch (error) {
            console.error('Error approving admin:', error);
            toast.error('Failed to approve admin.');
        }
    };

    const handleReject = async (userId) => {
        try {
            const config = getAuthHeaders();
            await axios.put(`/api/users/reject/${userId}`, {}, config);
            toast.success('Admin request rejected!');
            fetchDashboardData();
            setActiveTab('rejected');
        } catch (error) {
            console.error('Error rejecting admin:', error);
            toast.error('Failed to reject admin.');
        }
    };

    const handleBlock = async (userId) => {
        try {
            const config = getAuthHeaders();
            const response = await axios.put(`/api/users/block/${userId}`, {}, config);
            if (response.status === 200) {
                toast.success('User blocked successfully!');
                fetchDashboardData();
                setActiveTab('rejected');
            } else {
                toast.error('Failed to block user. Server response was not 200.');
            }
        } catch (error) {
            console.error('Error blocking user:', error);
            if (error.response) {
                toast.error(`Failed to block user: ${error.response.data.message || error.response.statusText}`);
            } else {
                toast.error('Failed to block user. Please check your network connection.');
            }
        }
    };

    const handleGrantUser = async (userId) => {
        try {
            const config = getAuthHeaders();
            await axios.put(`/api/users/grant-user/${userId}`, {}, config);
            toast.success('User granted regular user role successfully!');
            fetchDashboardData();
            setActiveTab('allUsers');
        } catch (error) {
            console.error('Error granting user role:', error);
            toast.error('Failed to grant user role.');
        }
    };

    const handleGrantAdmin = async (userId) => {
        try {
            const config = getAuthHeaders();
            await axios.put(`/api/users/grant-admin/${userId}`, {}, config);
            toast.success('Admin role granted successfully!');
            fetchDashboardData();
            setActiveTab('allAdmins');
        } catch (error) {
            console.error('Error granting admin role:', error);
            toast.error('Failed to grant admin role.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
        toast.success('Logged out successfully.');
    };

    const handleProfileClick = () => {
        navigate('/profile');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const renderUserTable = (users) => {
        if (!users || users.length === 0) {
            return <p style={styles.noDataText}>No data to display.</p>;
        }

        return (
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Username</th>
                            <th style={styles.th}>Email</th>
                            <th style={styles.th}>Role</th>
                            {(activeTab === 'allAdmins' || activeTab === 'rejected' || activeTab === 'allUsers') && (
                                <>
                                    <th style={styles.th}>Created On</th>
                                    <th style={styles.th}>Last Login</th>
                                </>
                            )}
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id} style={styles.tr}>
                                <td style={styles.td}>{user.name}</td>
                                <td style={styles.td}>{user.email}</td>
                                <td style={styles.td}>{user.role}</td>
                                {(activeTab === 'allAdmins' || activeTab === 'rejected' || activeTab === 'allUsers') && (
                                    <>
                                        <td style={styles.td}>{formatDate(user.createdAt)}</td>
                                        <td style={styles.td}>{formatDate(user.lastLogin)}</td>
                                    </>
                                )}
                                <td style={styles.actionTd}>
                                    {activeTab === 'pending' && (
                                        <>
                                            <button onClick={() => handleApprove(user._id)} style={styles.approveButton}>Approve</button>
                                            <button onClick={() => handleReject(user._id)} style={styles.rejectButton}>Reject</button>
                                        </>
                                    )}
                                    {activeTab === 'allAdmins' && user.role !== 'superadmin' && (
                                        <button onClick={() => handleBlock(user._id)} style={styles.rejectButton}>Block</button>
                                    )}
                                    {activeTab === 'rejected' && (
                                        <>
                                            <button onClick={() => handleGrantAdmin(user._id)} style={styles.approveButton}>Grant Admin</button>
                                            <button onClick={() => handleGrantUser(user._id)} style={styles.unblockButton}>Grant User</button>
                                        </>
                                    )}
                                    {activeTab === 'allUsers' && (
                                        <button onClick={() => handleBlock(user._id)} style={styles.rejectButton}>Block</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'pending':
                return renderUserTable(pendingAdmins);
            case 'allAdmins':
                return renderUserTable(allAdmins);
            case 'rejected':
                return renderUserTable(rejectedAdmins);
            case 'allUsers':
                return renderUserTable(regularUsers);
            default:
                return null;
        }
    };

    const getFirstLetter = (email) => {
        return email ? email.charAt(0).toUpperCase() : '';
    };

    return (
        <div style={styles.dashboardLayout}>
            <div style={styles.mainContentArea}>
                <nav style={styles.topBar}>
                    <div style={styles.topBarTitle}>
                        {activePage === 'dashboard' && 'Super Admin Dashboard'}
                        {activePage === 'upload' && 'File Upload'}
                        {activePage === 'history' && 'Upload History'}
                    </div>
                    <div style={styles.dropdownContainer} ref={dropdownRef}>
                        <div style={styles.userInfo} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                            <div style={styles.avatar}>{getFirstLetter(userEmail)}</div>
                            <span style={styles.userEmail}>{userEmail}</span>
                        </div>
                        {isDropdownOpen && (
                            <div style={styles.dropdownMenu}>
                                <button onClick={handleProfileClick} style={styles.dropdownItem}>Profile</button>
                                <button onClick={handleLogout} style={{ ...styles.dropdownItem, color: '#dc3545' }}>Logout</button>
                            </div>
                        )}
                    </div>
                </nav>

                <div style={styles.mainContent}>
                    {activePage === 'dashboard' && (
                        <>
                            <div style={styles.statsGrid}>
                                <div style={styles.statCard}>
                                    <Users size={32} color="#fff" />
                                    <span style={styles.statLabel}>Users</span>
                                    <span style={styles.statValue}>{stats.users}</span>
                                </div>
                                <div style={styles.statCard}>
                                    <UserCheck size={32} color="#fff" />
                                    <span style={styles.statLabel}>Super Admins</span>
                                    <span style={styles.statValue}>{stats.superAdmins}</span>
                                </div>
                                <div style={styles.statCard}>
                                    <UserPlus size={32} color="#fff" />
                                    <span style={styles.statLabel}>Admins</span>
                                    <span style={styles.statValue}>{stats.admins}</span>
                                </div>
                                <div style={styles.statCard}>
                                    <Clock size={32} color="#fff" />
                                    <span style={styles.statLabel}>Pending</span>
                                    <span style={styles.statValue}>{stats.pending}</span>
                                </div>
                            </div>
                            <div style={styles.tabsContainer}>
                                <button
                                    style={activeTab === 'pending' ? styles.tabButtonActive : styles.tabButton}
                                    onClick={() => setActiveTab('pending')}
                                >
                                    Pending Requests ({pendingAdmins.length})
                                </button>
                                <button
                                    style={activeTab === 'allAdmins' ? styles.tabButtonActive : styles.tabButton}
                                    onClick={() => setActiveTab('allAdmins')}
                                >
                                    Admitted Admins ({allAdmins.length})
                                </button>
                                <button
                                    style={activeTab === 'rejected' ? styles.tabButtonActive : styles.tabButton}
                                    onClick={() => setActiveTab('rejected')}
                                >
                                    Rejected ({rejectedAdmins.length})
                                </button>
                                <button
                                    style={activeTab === 'allUsers' ? styles.tabButtonActive : styles.tabButton}
                                    onClick={() => setActiveTab('allUsers')}
                                >
                                    Regular Users ({regularUsers.length})
                                </button>
                            </div>
                            <div style={styles.userListContainer}>
                                {renderTabContent()}
                            </div>
                        </>
                    )}
                    {activePage === 'upload' && (
                        <div style={styles.placeholderContent}>File Upload Component Goes Here</div>
                    )}
                    {activePage === 'history' && (
                        <div style={styles.placeholderContent}>Upload History Component Goes Here</div>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    dashboardLayout: {
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#1c2030',
        color: '#e0e0e0',
        fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    },
    mainContentArea: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    topBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        backgroundColor: '#282d40',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
        color: '#fff',
    },
    topBarTitle: {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#00c853',
    },
    dropdownContainer: {
        position: 'relative',
        display: 'inline-block',
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
    },
    avatar: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: '#6c757d',
        color: '#e0e0e0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontWeight: 'bold',
        fontSize: '1rem',
        marginRight: '8px',
    },
    userEmail: {
        fontSize: '1rem',
        color: '#a0a0a0',
    },
    dropdownMenu: {
        position: 'absolute',
        top: '100%',
        right: '0',
        backgroundColor: '#343a4e',
        minWidth: '120px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
        borderRadius: '5px',
        zIndex: 100,
        overflow: 'hidden',
    },
    dropdownItem: {
        width: '100%',
        padding: '10px 15px',
        backgroundColor: 'transparent',
        border: 'none',
        textAlign: 'left',
        cursor: 'pointer',
        color: '#e0e0e0',
        transition: 'background-color 0.3s ease',
    },
    mainContent: {
        maxWidth: '1200px',
        margin: '2rem auto',
        padding: '0 2rem',
    },
    placeholderContent: {
        padding: '2rem',
        textAlign: 'center',
        fontSize: '1.5rem',
        color: '#a0a0a0',
        backgroundColor: '#282d40',
        borderRadius: '8px',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statsGrid: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.5rem',
        marginBottom: '2rem',
        flexWrap: 'wrap',
    },
    statCard: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#282d40',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
        transition: 'transform 0.2s ease',
        flex: 1,
        minWidth: '200px',
    },
    statLabel: {
        fontSize: '1.1rem',
        color: '#a0a0a0',
        marginTop: '0.5rem',
    },
    statValue: {
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#00c853',
    },
    tabsContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '1.5rem',
        gap: '1rem',
        flexWrap: 'wrap',
    },
    tabButton: {
        backgroundColor: '#343a4e',
        color: '#e0e0e0',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'background-color 0.3s ease',
    },
    tabButtonActive: {
        backgroundColor: '#00c853',
        color: '#1c2030',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'background-color 0.3s ease',
        boxShadow: '0 2px 8px rgba(0, 200, 83, 0.4)',
    },
    userListContainer: {
        backgroundColor: '#282d40',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    },
    tableContainer: {
        overflowX: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: '0 1rem',
    },
    th: {
        textAlign: 'left',
        padding: '1rem',
        backgroundColor: '#343a4e',
        color: '#00c853',
        fontWeight: 'bold',
    },
    td: {
        padding: '1rem',
        backgroundColor: '#343a4e',
        borderBottom: '1px solid #454d66',
        color: '#e0e0e0',
    },
    actionTd: {
        padding: '1rem',
        backgroundColor: '#343a4e',
        borderBottom: '1px solid #454d66',
        color: '#e0e0e0',
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
    },
    tr: {
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    },
    approveButton: {
        backgroundColor: '#4caf50',
        color: '#fff',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
    rejectButton: {
        backgroundColor: '#f44336',
        color: '#fff',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
    blockButton: {
        backgroundColor: '#6c757d',
        color: '#fff',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
    unblockButton: {
        backgroundColor: '#2196f3',
        color: '#fff',
        border: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
    noDataText: {
        textAlign: 'center',
        color: '#a0a0a0',
        fontStyle: 'italic',
        padding: '2rem',
    },
};

export default SuperAdminDashboard;