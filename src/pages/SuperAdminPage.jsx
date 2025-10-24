import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
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
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("dashboard");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return { headers: { Authorization: `Bearer ${token}` } };
  };


  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Please log in again.");
        navigate("/login");
        return;
      }

      const config = getAuthHeaders();


      const profileRes = await axios.get("/api/users/profile", config);
      setUserEmail(profileRes.data.email);


      const [allUsersRes, allAdminsRes, pendingRes, rejectedRes] = await Promise.all([
        axios.get("/api/users/all", config),
        axios.get("/api/users/all-admins", config),
        axios.get("/api/users/pending-admins", config),
        axios.get("/api/users/rejected-admins", config),
      ]);

      const allUsers = allUsersRes.data;
      const superAdmins = allUsers.filter((u) => u.role === "superadmin");
      const admins = allAdminsRes.data;
      const pending = pendingRes.data;
      const rejected = rejectedRes.data;
      const regular = allUsers.filter((u) => u.role === "user");

      setStats({
        users: regular.length,
        superAdmins: superAdmins.length,
        admins: admins.length,
        pending: pending.length,
        rejected: rejected.length,
      });

      setPendingAdmins(pending);
      setAllAdmins(admins);
      setRejectedAdmins(rejected);
      setRegularUsers(regular);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data. Please log in again.");
      localStorage.removeItem("authToken");
      navigate("/login");
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const handleApprove = async (userId) => {
    try {
      await axios.put(`/api/users/approve/${userId}`, {}, getAuthHeaders());
      toast.success("Admin approved successfully!");
      fetchDashboardData();
    } catch {
      toast.error("Failed to approve admin.");
    }
  };

  const handleReject = async (userId) => {
    try {
      await axios.put(`/api/users/reject-admin/${userId}`, {}, getAuthHeaders());
      toast.success("Admin request rejected!");
      fetchDashboardData();
    } catch {
      toast.error("Failed to reject admin.");
    }
  };

  const handleBlock = async (userId) => {
    try {
      await axios.put(`/api/users/block/${userId}`, {}, getAuthHeaders());
      toast.success("User blocked successfully!");
      fetchDashboardData();
    } catch {
      toast.error("Failed to block user.");
    }
  };

  const handleUnblock = async (userId) => {
    try {
      await axios.put(`/api/users/unblock/${userId}`, {}, getAuthHeaders());
      toast.success("User unblocked successfully!");
      fetchDashboardData();
    } catch {
      toast.error("Failed to unblock user.");
    }
  };

  const handleGrantUser = async (userId) => {
    try {
      await axios.put(`/api/users/grant-user/${userId}`, {}, getAuthHeaders());
      toast.success("Granted user role successfully!");
      fetchDashboardData();
    } catch {
      toast.error("Failed to grant user role.");
    }
  };

  const handleGrantAdmin = async (userId) => {
    try {
      await axios.put(`/api/users/grant-admin/${userId}`, {}, getAuthHeaders());
      toast.success("Granted admin role successfully!");
      fetchDashboardData();
    } catch {
      toast.error("Failed to grant admin role.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
    toast.success("Logged out successfully.");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };


  const renderUserTable = (users) => {
    if (!users || users.length === 0)
      return <p style={styles.noDataText}>No records found.</p>;

    return (
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Created</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td style={styles.td}>{user.name}</td>
                <td style={styles.td}>{user.email}</td>
                <td style={styles.td}>{user.role}</td>
                <td style={styles.td}>{formatDate(user.createdAt)}</td>
                <td style={styles.actionTd}>
                  {activeTab === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(user._id)}
                        style={styles.approveButton}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(user._id)}
                        style={styles.rejectButton}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {activeTab === "allAdmins" && (
                    <button
                      onClick={() => handleBlock(user._id)}
                      style={styles.rejectButton}
                    >
                      Block
                    </button>
                  )}
                  {activeTab === "rejected" && (
                    <>
                      <button
                        onClick={() => handleGrantAdmin(user._id)}
                        style={styles.approveButton}
                      >
                        Grant Admin
                      </button>
                      <button
                        onClick={() => handleGrantUser(user._id)}
                        style={styles.unblockButton}
                      >
                        Grant User
                      </button>
                    </>
                  )}
                  {activeTab === "allUsers" && (
                    <>
                      <button
                        onClick={() => handleBlock(user._id)}
                        style={styles.rejectButton}
                      >
                        Block
                      </button>
                      <button
                        onClick={() => handleGrantAdmin(user._id)}
                        style={styles.approveButton}
                      >
                        Make Admin
                      </button>
                    </>
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
      case "pending":
        return renderUserTable(pendingAdmins);
      case "allAdmins":
        return renderUserTable(allAdmins);
      case "rejected":
        return renderUserTable(rejectedAdmins);
      case "allUsers":
        return renderUserTable(regularUsers);
      default:
        return null;
    }
  };

  const getFirstLetter = (email) => email?.charAt(0)?.toUpperCase() || "";

  return (
    <div style={styles.dashboardLayout}>
      <div style={styles.mainContentArea}>
        
        <nav style={styles.topBar}>
          <div style={styles.topBarTitle}>Super Admin Dashboard</div>
          <div style={styles.dropdownContainer} ref={dropdownRef}>
            <div
              style={styles.userInfo}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div style={styles.avatar}>{getFirstLetter(userEmail)}</div>
              <span style={styles.userEmail}>{userEmail}</span>
            </div>
            {isDropdownOpen && (
              <div style={styles.dropdownMenu}>
                <button
                  onClick={() => navigate("/profile")}
                  style={styles.dropdownItem}
                >
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  style={{ ...styles.dropdownItem, color: "#dc3545" }}
                >
                  Logout
                </button>
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
            <button
              style={
                activeTab === "pending"
                  ? styles.tabButtonActive
                  : styles.tabButton
              }
              onClick={() => setActiveTab("pending")}
            >
              Pending ({pendingAdmins.length})
            </button>
            <button
              style={
                activeTab === "allAdmins"
                  ? styles.tabButtonActive
                  : styles.tabButton
              }
              onClick={() => setActiveTab("allAdmins")}
            >
              Admins ({allAdmins.length})
            </button>
            <button
              style={
                activeTab === "rejected"
                  ? styles.tabButtonActive
                  : styles.tabButton
              }
              onClick={() => setActiveTab("rejected")}
            >
              Rejected ({rejectedAdmins.length})
            </button>
            <button
              style={
                activeTab === "allUsers"
                  ? styles.tabButtonActive
                  : styles.tabButton
              }
              onClick={() => setActiveTab("allUsers")}
            >
              Users ({regularUsers.length})
            </button>
          </div>

        \
          <div style={styles.userListContainer}>{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  dashboardLayout: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#1c2030",
    color: "#e0e0e0",
    fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  mainContentArea: { flex: 1, display: "flex", flexDirection: "column" },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 2rem",
    backgroundColor: "#282d40",
  },
  topBarTitle: { fontSize: "1.5rem", fontWeight: "700", color: "#00c853" },
  dropdownContainer: { position: "relative" },
  userInfo: { display: "flex", alignItems: "center", cursor: "pointer" },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "#6c757d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "8px",
  },
  dropdownMenu: {
    position: "absolute",
    top: "100%",
    right: 0,
    backgroundColor: "#343a4e",
    borderRadius: "5px",
    zIndex: 100,
  },
  dropdownItem: {
    padding: "10px 15px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    width: "100%",
    textAlign: "left",
    color: "#e0e0e0",
  },
  mainContent: { padding: "2rem", maxWidth: "1200px", margin: "auto" },
  statsGrid: {
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
    flexWrap: "wrap",
    marginBottom: "2rem",
  },
  statCard: {
    backgroundColor: "#282d40",
    padding: "1.5rem",
    borderRadius: "8px",
    flex: 1,
    textAlign: "center",
  },
  statLabel: { color: "#aaa", marginTop: "0.5rem" },
  statValue: { fontSize: "2rem", fontWeight: "bold", color: "#00c853" },
  tabsContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
    flexWrap: "wrap",
    marginBottom: "1.5rem",
  },
  tabButton: {
    backgroundColor: "#343a4e",
    color: "#e0e0e0",
    border: "none",
    padding: "0.75rem 1.5rem",
    borderRadius: "5px",
    cursor: "pointer",
  },
  tabButtonActive: {
    backgroundColor: "#00c853",
    color: "#1c2030",
    border: "none",
    padding: "0.75rem 1.5rem",
    borderRadius: "5px",
  },
  userListContainer: {
    backgroundColor: "#282d40",
    padding: "1.5rem",
    borderRadius: "8px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "1rem",
    backgroundColor: "#343a4e",
    color: "#00c853",
  },
  td: { padding: "1rem", borderBottom: "1px solid #444" },
  actionTd: {
    padding: "1rem",
    display: "flex",
    gap: "0.5rem",
  },
  approveButton: {
    backgroundColor: "#4caf50",
    color: "#fff",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "5px",
    cursor: "pointer",
  },
  rejectButton: {
    backgroundColor: "#f44336",
    color: "#fff",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "5px",
    cursor: "pointer",
  },
  unblockButton: {
    backgroundColor: "#2196f3",
    color: "#fff",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "5px",
    cursor: "pointer",
  },
  noDataText: {
    textAlign: "center",
    color: "#aaa",
    padding: "2rem",
  },
};

export default SuperAdminDashboard;
