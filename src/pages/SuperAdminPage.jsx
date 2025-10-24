import React, { useState, useEffect } from "react";
import axios from "../axiosConfig";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Users, Clock, UserCheck, LayoutDashboard } from "lucide-react";

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
      const pendingAdminsList = allUsersList.filter(
        (u) => u.adminRequestStatus === "pending"
      );
      const rejectedAdminsList = allUsersList.filter(
        (u) => u.adminRequestStatus === "rejected"
      );
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
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("authToken");
        navigate("/login");
      } else {
        toast.error("Failed to fetch dashboard data.");
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
      await axios.put(`/api/users/reject-admin/${id}`, {}, config);
      toast.success("Rejected successfully!");
      fetchDashboardData();
    } catch {
      toast.error("Failed to reject user/admin.");
    }
  };

  const handleGrantAdmin = async (id) => {
    try {
      const config = getAuthHeaders();
      await axios.put(`/api/users/grant-admin/${id}`, {}, config);
      toast.success("Granted Admin role successfully!");
      fetchDashboardData();
    } catch {
      toast.error("Failed to grant admin role.");
    }
  };

  const handleGrantUser = async (id) => {
    try {
      const config = getAuthHeaders();
      await axios.put(`/api/users/grant-user/${id}`, {}, config);
      toast.success("Granted User role successfully!");
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

  const buttonStyle = {
    padding: "6px 10px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
  };

  const renderUserTable = (users) => {
    if (!users.length)
      return (
        <p style={{ textAlign: "center", color: "#aaa", marginTop: "10px" }}>
          No records found.
        </p>
      );

    return (
      <div style={{ overflowX: "auto", marginTop: "15px" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "#161b22",
            color: "#ccc",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid #30363d" }}>
              <th style={{ padding: "10px", textAlign: "left" }}>Name</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Email</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Role</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Created</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Last Login</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user._id}
                style={{
                  borderBottom: "1px solid #30363d",
                  backgroundColor: "#0d1117",
                }}
              >
                <td style={{ padding: "10px" }}>{user.name}</td>
                <td style={{ padding: "10px" }}>{user.email}</td>
                <td style={{ padding: "10px" }}>
                  <span
                    style={{
                      backgroundColor: "#30363d",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                  >
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: "10px" }}>{formatDate(user.createdAt)}</td>
                <td style={{ padding: "10px" }}>{formatDate(user.lastLogin)}</td>
                <td style={{ padding: "10px" }}>
                  {activeTab === "pending" && (
                    <>
                      <button
                        style={{ ...buttonStyle, backgroundColor: "#2ea043", color: "white" }}
                        onClick={() => handleApprove(user._id)}
                      >
                        Approve
                      </button>{" "}
                      <button
                        style={{ ...buttonStyle, backgroundColor: "#d73a49", color: "white" }}
                        onClick={() => handleReject(user._id)}
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {activeTab === "allAdmins" && (
                    <button
                      style={{ ...buttonStyle, backgroundColor: "#d73a49", color: "white" }}
                      onClick={() => handleReject(user._id)}
                    >
                      Reject
                    </button>
                  )}

                  {activeTab === "allUsers" && (
                    <button
                      style={{ ...buttonStyle, backgroundColor: "#d73a49", color: "white" }}
                      onClick={() => handleReject(user._id)}
                    >
                      Reject
                    </button>
                  )}

                  {activeTab === "rejected" && (
                    <>
                      <button
                        style={{ ...buttonStyle, backgroundColor: "#0366d6", color: "white" }}
                        onClick={() => handleGrantUser(user._id)}
                      >
                        Grant User
                      </button>{" "}
                      <button
                        style={{ ...buttonStyle, backgroundColor: "#2ea043", color: "white" }}
                        onClick={() => handleGrantAdmin(user._id)}
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
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#0d1117", color: "#ccc" }}>
  
      <aside
        style={{
          width: "240px",
          backgroundColor: "#161b22",
          borderRight: "1px solid #30363d",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#58a6ff", marginBottom: "20px" }}>
          Super Admin Panel
        </h2>

        <button
          style={{
            ...buttonStyle,
            backgroundColor: activeTab === "pending" ? "#238636" : "transparent",
            color: activeTab === "pending" ? "#fff" : "#ccc",
            textAlign: "left",
            marginBottom: "10px",
          }}
          onClick={() => setActiveTab("pending")}
        >
          <LayoutDashboard size={16} style={{ marginRight: "6px" }} /> Dashboard
        </button>

        <button
          style={{
            ...buttonStyle,
            backgroundColor: activeTab === "allAdmins" ? "#238636" : "transparent",
            color: activeTab === "allAdmins" ? "#fff" : "#ccc",
            textAlign: "left",
            marginBottom: "10px",
          }}
          onClick={() => setActiveTab("allAdmins")}
        >
          <UserCheck size={16} style={{ marginRight: "6px" }} /> Admins
        </button>

        <button
          style={{
            ...buttonStyle,
            backgroundColor: activeTab === "rejected" ? "#238636" : "transparent",
            color: activeTab === "rejected" ? "#fff" : "#ccc",
            textAlign: "left",
            marginBottom: "10px",
          }}
          onClick={() => setActiveTab("rejected")}
        >
          <Clock size={16} style={{ marginRight: "6px" }} /> Rejected
        </button>

        <button
          style={{
            ...buttonStyle,
            backgroundColor: activeTab === "allUsers" ? "#238636" : "transparent",
            color: activeTab === "allUsers" ? "#fff" : "#ccc",
            textAlign: "left",
            marginBottom: "10px",
          }}
          onClick={() => setActiveTab("allUsers")}
        >
          <Users size={16} style={{ marginRight: "6px" }} /> Users
        </button>

        <div style={{ marginTop: "auto", paddingTop: "10px", borderTop: "1px solid #30363d" }}>
          <button
            onClick={handleLogout}
            style={{
              ...buttonStyle,
              backgroundColor: "#d73a49",
              color: "white",
              width: "100%",
            }}
          >
            Logout
          </button>
        </div>
      </aside>

     
      <main style={{ flex: 1, padding: "30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "bold" }}>Super Admin Dashboard</h1>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#161b22",
              padding: "6px 12px",
              borderRadius: "6px",
            }}
          >
            <div
              style={{
                backgroundColor: "#238636",
                color: "white",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
              }}
            >
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <span>{userEmail}</span>
          </div>
        </div>

     
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px" }}>
          {[
            { label: "Total Users", value: stats.users },
            { label: "Total Admins", value: stats.admins },
            { label: "Super Admins", value: stats.superAdmins },
            { label: "Pending", value: stats.pending },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                backgroundColor: "#161b22",
                border: "1px solid #30363d",
                borderRadius: "6px",
                textAlign: "center",
                padding: "15px",
              }}
            >
              <p style={{ color: "#aaa" }}>{stat.label}</p>
              <h2 style={{ color: "#58a6ff", fontSize: "22px", marginTop: "6px" }}>{stat.value}</h2>
            </div>
          ))}
        </div>

        
        <div style={{ marginTop: "20px" }}>{renderTabContent()}</div>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
