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
    return { headers: { Authorization: `Bearer ${token}` } };
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

      const superAdminsList = allUsersList.filter((u) => u.role === 'superadmin');
      const adminsList = allUsersList.filter((u) => u.role === 'admin' && u.adminRequestStatus === 'accepted');
      const pendingAdminsList = allUsersList.filter((u) => u.adminRequestStatus === 'pending');
      const rejectedAdminsList = allUsersList.filter((u) => u.adminRequestStatus === 'rejected');
      const regularUsersList = allUsersList.filter((u) => u.role === 'user' && u.adminRequestStatus === null);

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
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('authToken');
        navigate('/login');
      } else {
        toast.error('Failed to fetch dashboard data.');
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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleApprove = async (id) => {
    try {
      const config = getAuthHeaders();
      await axios.put(`/api/users/approve/${id}`, {}, config);
      toast.success('Admin approved successfully!');
      fetchDashboardData();
    } catch {
      toast.error('Failed to approve admin.');
    }
  };

  const handleReject = async (id) => {
    try {
      const config = getAuthHeaders();
      await axios.put(`/api/users/reject/${id}`, {}, config);
      toast.success('Admin request rejected!');
      fetchDashboardData();
      setActiveTab('rejected');
    } catch {
      toast.error('Failed to reject admin.');
    }
  };

  const handleBlock = async (id) => {
    try {
      const config = getAuthHeaders();
      await axios.put(`/api/users/block/${id}`, {}, config);
      toast.success('User blocked successfully!');
      fetchDashboardData();
      setActiveTab('rejected');
    } catch {
      toast.error('Failed to block user.');
    }
  };

  const handleGrantUser = async (id) => {
    try {
      const config = getAuthHeaders();
      await axios.put(`/api/users/grant-user/${id}`, {}, config);
      toast.success('User role restored.');
      fetchDashboardData();
      setActiveTab('allUsers');
    } catch {
      toast.error('Failed to grant user role.');
    }
  };

  const handleGrantAdmin = async (id) => {
    try {
      const config = getAuthHeaders();
      await axios.put(`/api/users/grant-admin/${id}`, {}, config);
      toast.success('Admin role granted successfully!');
      fetchDashboardData();
      setActiveTab('allAdmins');
    } catch {
      toast.error('Failed to grant admin role.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
    toast.success('Logged out successfully.');
  };

  const handleProfileClick = () => navigate('/profile');

  const formatDate = (d) => (d ? new Date(d).toLocaleString() : 'N/A');

  const renderUserTable = (list) => (
    list?.length ? (
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Username</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Created On</th>
              <th style={styles.th}>Last Login</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((user) => (
              <tr key={user._id} style={styles.tr}>
                <td style={styles.td}>{user.name}</td>
                <td style={styles.td}>{user.email}</td>
                <td style={styles.td}>{user.role}</td>
                <td style={styles.td}>{formatDate(user.createdAt)}</td>
                <td style={styles.td}>{formatDate(user.lastLogin)}</td>
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p style={styles.noDataText}>No data to display.</p>
    )
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'pending': return renderUserTable(pendingAdmins);
      case 'allAdmins': return renderUserTable(allAdmins);
      case 'rejected': return renderUserTable(rejectedAdmins);
      case 'allUsers': return renderUserTable(regularUsers);
      default: return null;
    }
  };

  const getFirstLetter = (email) => email?.charAt(0)?.toUpperCase() || '';

  return (
    <div style={styles.dashboardLayout}>
      <div style={styles.mainContentArea}>
        <nav style={styles.topBar}>
          <div style={styles.topBarTitle}>Super Admin Dashboard</div>
          <div style={styles.dropdownContainer} ref={dropdownRef}>
            <div style={styles.userInfo} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <div style={styles.avatar}>{getFirstLetter(userEmail)}</div>
              <span style={styles.userEmail}>{userEmail}</span>
            </div>
            {isDropdownOpen && (
              <div style={styles.dropdownMenu}>
                <button onClick={handleProfileClick} style={styles.dropdownItem}>Profile</button>
                <button onClick={handleLogout} style={{ ...styles.dropdownItem, color: '#ff5555' }}>Logout</button>
              </div>
            )}
          </div>
        </nav>

        <div style={styles.mainContent}>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}><Users size={32} color="#00e676" /><span style={styles.statLabel}>Users</span><span style={styles.statValue}>{stats.users}</span></div>
            <div style={styles.statCard}><UserCheck size={32} color="#00bcd4" /><span style={styles.statLabel}>Super Admins</span><span style={styles.statValue}>{stats.superAdmins}</span></div>
            <div style={styles.statCard}><UserPlus size={32} color="#ffb300" /><span style={styles.statLabel}>Admins</span><span style={styles.statValue}>{stats.admins}</span></div>
            <div style={styles.statCard}><Clock size={32} color="#ff7043" /><span style={styles.statLabel}>Pending</span><span style={styles.statValue}>{stats.pending}</span></div>
          </div>

          <div style={styles.tabsContainer}>
            {['pending', 'allAdmins', 'rejected', 'allUsers'].map((tab) => (
              <button
                key={tab}
                style={activeTab === tab ? styles.tabButtonActive : styles.tabButton}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'pending' && `Pending (${pendingAdmins.length})`}
                {tab === 'allAdmins' && `Admins (${allAdmins.length})`}
                {tab === 'rejected' && `Rejected (${rejectedAdmins.length})`}
                {tab === 'allUsers' && `Users (${regularUsers.length})`}
              </button>
            ))}
          </div>

          <div style={styles.userListContainer}>{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  dashboardLayout: {
    display: 'flex',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #121212, #1e1e2f)',
    color: '#e0e0e0',
    fontFamily: 'Inter, system-ui, sans-serif',
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
    backgroundColor: '#232334',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)',
  },
  topBarTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#00e676',
  },
  dropdownContainer: { position: 'relative' },
  userInfo: { display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#333',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#00e676',
    fontWeight: 'bold',
  },
  userEmail: { fontSize: '1rem', color: '#bbb' },
  dropdownMenu: {
    position: 'absolute',
    top: '110%',
    right: 0,
    background: '#2a2a3c',
    borderRadius: '6px',
    overflow: 'hidden',
    boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
    zIndex: 100,
  },
  dropdownItem: {
    width: '100%',
    padding: '10px 16px',
    background: 'transparent',
    border: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    color: '#eee',
    transition: 'background 0.2s',
  },
  mainContent: { maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: '#292940',
    borderRadius: '10px',
    padding: '1.5rem',
    textAlign: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
    transition: 'transform 0.2s ease',
  },
  statCardHover: { transform: 'scale(1.02)' },
  statLabel: { color: '#aaa', marginTop: '0.5rem', fontSize: '1rem' },
  statValue: { color: '#00e676', fontSize: '1.8rem', fontWeight: 600 },
  tabsContainer: { display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '1.5rem' },
  tabButton: {
    background: '#303050',
    color: '#ccc',
    border: '1px solid #404060',
    padding: '0.6rem 1.2rem',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  tabButtonActive: {
    background: '#00e676',
    color: '#111',
    border: '1px solid #00e676',
    padding: '0.6rem 1.2rem',
    borderRadius: '6px',
    fontWeight: 600,
  },
  userListContainer: {
    background: '#232334',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  },
  tableContainer: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '1rem' },
  th: { padding: '0.75rem', textAlign: 'left', color: '#00e676', fontWeight: 600, borderBottom: '1px solid #333' },
  td: { padding: '0.75rem', color: '#ddd', borderBottom: '1px solid #333' },
  actionTd: { display: 'flex', gap: '0.5rem' },
  approveButton: {
    background: '#4caf50',
    border: 'none',
    borderRadius: '5px',
    padding: '6px 12px',
    color: '#fff',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  rejectButton: {
    background: '#f44336',
    border: 'none',
    borderRadius: '5px',
    padding: '6px 12px',
    color: '#fff',
    cursor: 'pointer',
  },
  unblockButton: {
    background: '#2196f3',
    border: 'none',
    borderRadius: '5px',
    padding: '6px 12px',
    color: '#fff',
    cursor: 'pointer',
  },
  noDataText: { textAlign: 'center', padding: '1.5rem', color: '#888', fontStyle: 'italic' },
};

export default SuperAdminDashboard;
