import React, { useState, useEffect, useRef } from "react";
import axios from "../axiosConfig";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Users,
  UserCheck,
  Clock,
  LayoutDashboard,
} from "lucide-react";

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
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return { headers: { Authorization: `Bearer ${token}` } };
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

      const superAdminsList = allUsersList.filter((u) => u.role === "superadmin");
      const adminsList = allUsersList.filter(
        (u) => u.role === "admin" && u.adminRequestStatus === "accepted"
      );
      const pendingAdminsList = allUsersList.filter((u) => u.adminRequestStatus === "pending");
      const rejectedAdminsList = allUsersList.filter((u) => u.adminRequestStatus === "rejected");
      const regularUsersList = allUsersList.filter(
        (u) => u.role === "user" && (!u.adminRequestStatus || u.adminRequestStatus === null)
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
      toast.error("Failed to fetch dashboard data.");
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("authToken");
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApprove = async (id) => {
    try {
      const config = getAuthHeaders();
      await axios.put(`/api/users/approve/${id}`, {}, config);
      toast.success("Admin approved successfully!");
      fetchDashboardData();
    } catch {
      toast.error("Failed to approve admin.");
    }
  };

  const handleReject = async (id) => {
    try {
      const config = getAuthHeaders();
      await axios.put(`/api/users/reject/${id}`, {}, config);
      toast.success("Rejected successfully!");
      fetchDashboardData();
    } catch {
      toast.error("Failed to reject user.");
    }
  };

  const handleGrantAdmin = async (id) => {
    try {
      const config = getAuthHeaders();
      await axios.put(`/api/users/grant-admin/${id}`, {}, config);
      toast.success("Granted as Admin successfully!");
      fetchDashboardData();
    } catch {
      toast.error("Failed to grant admin role.");
    }
  };

  const handleGrantUser = async (id) => {
    try {
      const config = getAuthHeaders();
      await axios.put(`/api/users/grant-user/${id}`, {}, config);
      toast.success("Granted as User successfully!");
      fetchDashboardData();
    } catch {
      toast.error("Failed to grant user role.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const renderUserTable = (users) => {
    if (!users.length)
      return <p style={{ textAlign: "center", color: "#9ca3af", marginTop: "1rem" }}>No records found.</p>;

    return (
      <div style={{ overflowX: "auto", marginTop: "1rem" }}>
        <table style={{ width: "100%", background: "#161b22", borderCollapse: "collapse", border: "1px solid #30363d", borderRadius: "8px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #30363d", color: "#d1d5db" }}>
              <th style={{ padding: "12px", textAlign: "left" }}>Name</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Email</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Role</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Created</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Last Login</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} style={{ borderBottom: "1px solid #30363d", color: "#fff" }}>
                <td style={{ padding: "12px" }}>{user.name}</td>
                <td style={{ padding: "12px" }}>{user.email}</td>
                <td style={{ padding: "12px" }}>
                  <span style={{ background: "#374151", padding: "4px 8px", borderRadius: "4px", fontSize: "12px" }}>{user.role}</span>
                </td>
                <td style={{ padding: "12px" }}>{formatDate(user.createdAt)}</td>
                <td style={{ padding: "12px" }}>{formatDate(user.lastLogin)}</td>
                <td style={{ padding: "12px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {/* Pending Tab Actions */}
                  {activeTab === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(user._id)}
                        style={{
                          background: "#16a34a",
                          color: "#fff",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(user._id)}
                        style={{
                          background: "#dc2626",
                          color: "#fff",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {/* Admins & Users Tab Reject Button */}
                  {(activeTab === "allAdmins" || activeTab === "allUsers") && (
                    <button
                      onClick={() => handleReject(user._id)}
                      style={{
                        background: "#dc2626",
                        color: "#fff",
                        padding: "6px 12px",
                        borderRadius: "4px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Reject
                    </button>
                  )}

                  {/* Rejected Tab Buttons */}
                  {activeTab === "rejected" && (
                    <>
                      <button
                        onClick={() => handleGrantUser(user._id)}
                        style={{
                          background: "#2563eb",
                          color: "#fff",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Grant User
                      </button>
                      <button
                        onClick={() => handleGrantAdmin(user._id)}
                        style={{
                          background: "#9333ea",
                          color: "#fff",
                          padding: "6px 12px",
                          borderRadius: "4px",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        Grant Admin
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

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0d1117", color: "#e5e7eb" }}>
      {/* Sidebar */}
      <aside style={{ width: "250px", background: "#161b22", borderRight: "1px solid #30363d", padding: "24px", display: "flex", flexDirection: "column" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "24px", color: "#60a5fa" }}>Super Admin Panel</h2>
        <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button onClick={() => setActiveTab("pending")} style={{ background: activeTab === "pending" ? "#2563eb" : "transparent", color: activeTab === "pending" ? "#fff" : "#9ca3af", padding: "10px", borderRadius: "6px", border: "none", cursor: "pointer", textAlign: "left" }}>
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button onClick={() => setActiveTab("allAdmins")} style={{ background: activeTab === "allAdmins" ? "#2563eb" : "transparent", color: activeTab === "allAdmins" ? "#fff" : "#9ca3af", padding: "10px", borderRadius: "6px", border: "none", cursor: "pointer", textAlign: "left" }}>
            <UserCheck size={18} /> Admins
          </button>
          <button onClick={() => setActiveTab("rejected")} style={{ background: activeTab === "rejected" ? "#2563eb" : "transparent", color: activeTab === "rejected" ? "#fff" : "#9ca3af", padding: "10px", borderRadius: "6px", border: "none", cursor: "pointer", textAlign: "left" }}>
            <Clock size={18} /> Rejected
          </button>
          <button onClick={() => setActiveTab("allUsers")} style={{ background: activeTab === "allUsers" ? "#2563eb" : "transparent", color: activeTab === "allUsers" ? "#fff" : "#9ca3af", padding: "10px", borderRadius: "6px", border: "none", cursor: "pointer", textAlign: "left" }}>
            <Users size={18} /> Users
          </button>
        </nav>
        <div style={{ marginTop: "auto", paddingTop: "16px", borderTop: "1px solid #30363d" }}>
          <button onClick={handleLogout} style={{ width: "100%", background: "#dc2626", color: "#fff", padding: "10px", borderRadius: "6px", border: "none", cursor: "pointer" }}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>Super Admin Dashboard</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#161b22", padding: "8px 16px", borderRadius: "8px" }}>
            <div style={{ background: "#2563eb", color: "#fff", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <span>{userEmail}</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "8px", padding: "16px", textAlign: "center" }}>
            <p style={{ color: "#9ca3af" }}>Total Users</p>
            <h2 style={{ color: "#a78bfa", fontSize: "20px", fontWeight: "bold" }}>{stats.users}</h2>
          </div>
          <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "8px", padding: "16px", textAlign: "center" }}>
            <p style={{ color: "#9ca3af" }}>Total Admins</p>
            <h2 style={{ color: "#a78bfa", fontSize: "20px", fontWeight: "bold" }}>{stats.admins}</h2>
          </div>
          <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "8px", padding: "16px", textAlign: "center" }}>
            <p style={{ color: "#9ca3af" }}>Super Admins</p>
            <h2 style={{ color: "#a78bfa", fontSize: "20px", fontWeight: "bold" }}>{stats.superAdmins}</h2>
          </div>
          <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: "8px", padding: "16px", textAlign: "center" }}>
            <p style={{ color: "#9ca3af" }}>Pending</p>
            <h2 style={{ color: "#a78bfa", fontSize: "20px", fontWeight: "bold" }}>{stats.pending}</h2>
          </div>
        </div>

        {/* Tabs */}
        {renderTabContent()}
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
