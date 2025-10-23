// src/pages/SuperAdminPage.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "../axiosConfig"; // ✅ use the configured axios instance
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Users, UserPlus, Clock, UserCheck } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState("pending");
  const [userEmail, setUserEmail] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return {
      headers: { Authorization: `Bearer ${token}` },
    };
  };

  const fetchDashboardData = async () => {
    try {
      const config = getAuthHeaders();
      const token = localStorage.getItem("authToken");

      if (!token) {
        toast.error("You are not authenticated. Please log in.");
        navigate("/login");
        return;
      }

      const profileRes = await axios.get("/api/users/profile", config);
      setUserEmail(profileRes.data.email);

      const allUsersRes = await axios.get("/api/users/all", config);
      const allUsersList = allUsersRes.data || [];

      const superAdminsList = allUsersList.filter(
        (user) => user.role === "superadmin"
      );
      const adminsList = allUsersList.filter(
        (user) =>
          user.role === "admin" && user.adminRequestStatus === "accepted"
      );
      const pendingAdminsList = allUsersList.filter(
        (user) => user.adminRequestStatus === "pending"
      );
      const rejectedAdminsList = allUsersList.filter(
        (user) => user.adminRequestStatus === "rejected"
      );
      const regularUsersList = allUsersList.filter(
        (user) =>
          user.role === "user" && (!user.adminRequestStatus || user.adminRequestStatus === null)
      );

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
      console.error("Error fetching dashboard data:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error("Session expired or access denied. Please log in again.");
        localStorage.removeItem("authToken");
        navigate("/login");
      } else {
        toast.error("Failed to fetch dashboard data. Please check your network.");
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleApprove = async (userId) => {
    try {
      const config = getAuthHeaders();
      await axios.put(`/api/users/approve/${userId}`, {}, config);
      toast.success("Admin approved successfully!");
      fetchDashboardData();
    } catch (error) {
      console.error("Error approving admin:", error);
      toast.error("Failed to approve admin.");
    }
  };

  const handleReject = async (userId) => {
    try {
      const config = getAuthHeaders();
      await axios.put(`/api/users/reject/${userId}`, {}, config);
      toast.success("Admin request rejected!");
      fetchDashboardData();
      setActiveTab("rejected");
    } catch (error) {
      console.error("Error rejecting admin:", error);
      toast.error("Failed to reject admin.");
    }
  };

  const handleBlock = async (userId) => {
    try {
      const config = getAuthHeaders();
      await axios.put(`/api/users/block/${userId}`, {}, config);
      toast.success("User blocked successfully!");
      fetchDashboardData();
      setActiveTab("rejected");
    } catch (error) {
      console.error("Error blocking user:", error);
      toast.error("Failed to block user.");
    }
  };

  const handleGrantUser = async (userId) => {
    try {
      const config = getAuthHeaders();
      await axios.put(`/api/users/grant-user/${userId}`, {}, config);
      toast.success("User granted regular user role successfully!");
      fetchDashboardData();
      setActiveTab("allUsers");
    } catch (error) {
      console.error("Error granting user role:", error);
      toast.error("Failed to grant user role.");
    }
  };

  const handleGrantAdmin = async (userId) => {
    try {
      const config = getAuthHeaders();
      await axios.put(`/api/users/grant-admin/${userId}`, {}, config);
      toast.success("Admin role granted successfully!");
      fetchDashboardData();
      setActiveTab("allAdmins");
    } catch (error) {
      console.error("Error granting admin role:", error);
      toast.error("Failed to grant admin role.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
    toast.success("Logged out successfully.");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
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
              <th style={styles.th}>Created On</th>
              <th style={styles.th}>Last Login</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} style={styles.tr}>
                <td style={styles.td}>{user.name}</td>
                <td style={styles.td}>{user.email}</td>
                <td style={styles.td}>{user.role}</td>
                <td style={styles.td}>{formatDate(user.createdAt)}</td>
                <td style={styles.td}>{formatDate(user.lastLogin)}</td>
                <td style={styles.actionTd}>
                  {activeTab === "pending" && (
                    <>
                      <button onClick={() => handleApprove(user._id)} style={styles.approveButton}>Approve</button>
                      <button onClick={() => handleReject(user._id)} style={styles.rejectButton}>Reject</button>
                    </>
                  )}
                  {activeTab === "allAdmins" && user.role !== "superadmin" && (
                    <button onClick={() => handleBlock(user._id)} style={styles.rejectButton}>Block</button>
                  )}
                  {activeTab === "rejected" && (
                    <>
                      <button onClick={() => handleGrantAdmin(user._id)} style={styles.approveButton}>Grant Admin</button>
                      <button onClick={() => handleGrantUser(user._id)} style={styles.unblockButton}>Grant User</button>
                    </>
                  )}
                  {activeTab === "allUsers" && (
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
      case "pending": return renderUserTable(pendingAdmins);
      case "allAdmins": return renderUserTable(allAdmins);
      case "rejected": return renderUserTable(rejectedAdmins);
      case "allUsers": return renderUserTable(regularUsers);
      default: return null;
    }
  };

  const getFirstLetter = (email) => (email ? email.charAt(0).toUpperCase() : "");

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
                <button onClick={handleLogout} style={{ ...styles.dropdownItem, color: "#dc3545" }}>Logout</button>
              </div>
            )}
          </div>
        </nav>

        <div style={styles.mainContent}>
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
            <button style={activeTab === "pending" ? styles.tabButtonActive : styles.tabButton} onClick={() => setActiveTab("pending")}>Pending ({pendingAdmins.length})</button>
            <button style={activeTab === "allAdmins" ? styles.tabButtonActive : styles.tabButton} onClick={() => setActiveTab("allAdmins")}>Admins ({allAdmins.length})</button>
            <button style={activeTab === "rejected" ? styles.tabButtonActive : styles.tabButton} onClick={() => setActiveTab("rejected")}>Rejected ({rejectedAdmins.length})</button>
            <button style={activeTab === "allUsers" ? styles.tabButtonActive : styles.tabButton} onClick={() => setActiveTab("allUsers")}>Users ({regularUsers.length})</button>
          </div>

          <div style={styles.userListContainer}>{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
};

// ✅ Add this styles object (previously missing)
const styles = {
  dashboardLayout: {
    minHeight: "100vh",
    backgroundColor: "#0d1117",
    color: "#c9d1d9",
    display: "flex",
    flexDirection: "column",
  },
  mainContentArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  topBar: {
    backgroundColor: "#161b22",
    borderBottom: "1px solid #30363d",
    padding: "1rem 2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topBarTitle: { fontSize: "1.5rem", fontWeight: "bold" },
  dropdownContainer: { position: "relative" },
  userInfo: { display: "flex", alignItems: "center", cursor: "pointer" },
  avatar: {
    backgroundColor: "#0370a7",
    borderRadius: "50%",
    color: "#fff",
    width: "32px",
    height: "32px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: "0.5rem",
  },
  dropdownMenu: {
    position: "absolute",
    top: "2.5rem",
    right: 0,
    backgroundColor: "#161b22",
    border: "1px solid #30363d",
    borderRadius: "8px",
    overflow: "hidden",
    zIndex: 10,
  },
  dropdownItem: {
    padding: "0.5rem 1rem",
    textAlign: "left",
    background: "none",
    border: "none",
    color: "#c9d1d9",
    width: "100%",
    cursor: "pointer",
  },
  mainContent: { padding: "2rem" },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
  },
  statCard: {
    backgroundColor: "#161b22",
    border: "1px solid #30363d",
    padding: "1rem",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  statLabel: { fontSize: "1rem" },
  statValue: { fontSize: "1.5rem", fontWeight: "bold" },
  tabsContainer: {
    display: "flex",
    gap: "1rem",
    marginTop: "2rem",
    flexWrap: "wrap",
  },
  tabButton: {
    backgroundColor: "#161b22",
    color: "#c9d1d9",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    border: "1px solid #30363d",
    cursor: "pointer",
  },
  tabButtonActive: {
    backgroundColor: "#0370a7",
    color: "#fff",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    border: "1px solid #0370a7",
  },
  tableContainer: { marginTop: "1rem", overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    borderBottom: "1px solid #30363d",
    padding: "0.75rem",
    textAlign: "left",
  },
  tr: { borderBottom: "1px solid #30363d" },
  td: { padding: "0.75rem" },
  actionTd: { display: "flex", gap: "0.5rem" },
  approveButton: {
    backgroundColor: "#0370a7",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "0.4rem 0.8rem",
    cursor: "pointer",
  },
  rejectButton: {
    backgroundColor: "#d73a49",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "0.4rem 0.8rem",
    cursor: "pointer",
  },
  unblockButton: {
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "0.4rem 0.8rem",
    cursor: "pointer",
  },
  noDataText: { textAlign: "center", marginTop: "1rem", color: "#8b949e" },
};

export default SuperAdminDashboard;
