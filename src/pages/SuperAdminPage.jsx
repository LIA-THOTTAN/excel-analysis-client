import React, { useState, useEffect, useRef } from "react";
import axios from "../axiosConfig";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Users, UserCheck, Clock, Shield } from "lucide-react";

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    admins: 0,
    superAdmins: 0,
    pending: 0,
    rejected: 0,
  });
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [allAdmins, setAllAdmins] = useState([]);
  const [rejectedAdmins, setRejectedAdmins] = useState([]);
  const [regularUsers, setRegularUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [userEmail, setUserEmail] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
  });

  const fetchDashboardData = async () => {
    try {
      const config = getAuthHeaders();
      const profileRes = await axios.get("/api/users/profile", config);
      setUserEmail(profileRes.data.email);

      const allUsersRes = await axios.get("/api/users/all", config);
      const allUsers = allUsersRes.data || [];

      const superAdminsList = allUsers.filter((u) => u.role === "superadmin");
      const adminsList = allUsers.filter(
        (u) => u.role === "admin" && u.adminRequestStatus === "accepted"
      );
      const pendingAdminsList = allUsers.filter(
        (u) => u.adminRequestStatus === "pending"
      );
      const rejectedAdminsList = allUsers.filter(
        (u) => u.adminRequestStatus === "rejected"
      );
      const regularUsersList = allUsers.filter(
        (u) =>
          u.role === "user" &&
          (!u.adminRequestStatus || u.adminRequestStatus === null)
      );

      setStats({
        users: regularUsersList.length,
        admins: adminsList.length,
        superAdmins: superAdminsList.length,
        pending: pendingAdminsList.length,
        rejected: rejectedAdminsList.length,
      });

      setAllAdmins(adminsList);
      setPendingAdmins(pendingAdminsList);
      setRejectedAdmins(rejectedAdminsList);
      setRegularUsers(regularUsersList);
    } catch (err) {
      toast.error("Failed to load dashboard data");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`/api/users/approve/${id}`, {}, getAuthHeaders());
      toast.success("Admin approved successfully!");
      fetchDashboardData();
    } catch {
      toast.error("Failed to approve admin");
    }
  };

  const handleReject = async (id, role) => {
    try {
      const endpoint =
        role === "admin"
          ? `/api/users/reject-admin/${id}`
          : `/api/users/reject/${id}`;
      await axios.put(endpoint, {}, getAuthHeaders());
      toast.success(`${role === "admin" ? "Admin" : "User"} rejected successfully!`);
      fetchDashboardData();
      setActiveTab("rejected");
    } catch (err) {
      toast.error("Failed to reject");
      console.error(err);
    }
  };

  const handleGrantAdmin = async (id) => {
    try {
      await axios.put(`/api/users/grant-admin/${id}`, {}, getAuthHeaders());
      toast.success("Granted as Admin!");
      fetchDashboardData();
      setActiveTab("allAdmins");
    } catch {
      toast.error("Failed to grant admin");
    }
  };

  const handleGrantUser = async (id) => {
    try {
      await axios.put(`/api/users/grant-user/${id}`, {}, getAuthHeaders());
      toast.success("Granted as User!");
      fetchDashboardData();
      setActiveTab("allUsers");
    } catch {
      toast.error("Failed to grant user");
    }
  };

  const formatDate = (date) => (date ? new Date(date).toLocaleString() : "N/A");

  const renderTable = (data) => {
    if (!data.length)
      return (
        <p style={{ textAlign: "center", marginTop: "1rem", color: "#9ca3af" }}>
          No records found.
        </p>
      );

    return (
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#1f2937",
          color: "#fff",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <thead>
          <tr style={{ background: "#111827" }}>
            <th style={thStyle}>Username</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Role</th>
            <th style={thStyle}>Created</th>
            <th style={thStyle}>Last Login</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((user) => (
            <tr key={user._id} style={{ borderBottom: "1px solid #374151" }}>
              <td style={tdStyle}>{user.name}</td>
              <td style={tdStyle}>{user.email}</td>
              <td style={tdStyle}>
                <span
                  style={{
                    background: "#2563eb33",
                    padding: "4px 8px",
                    borderRadius: "6px",
                  }}
                >
                  {user.role}
                </span>
              </td>
              <td style={tdStyle}>{formatDate(user.createdAt)}</td>
              <td style={tdStyle}>{formatDate(user.lastLogin)}</td>
              <td style={{ ...tdStyle, display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {activeTab === "pending" && (
                  <>
                    <button style={btnGreen} onClick={() => handleApprove(user._id)}>
                      Approve
                    </button>
                    <button
                      style={btnRed}
                      onClick={() => handleReject(user._id, "admin")}
                    >
                      Reject
                    </button>
                  </>
                )}
                {activeTab === "allAdmins" && (
                  <button
                    style={btnRed}
                    onClick={() => handleReject(user._id, "admin")}
                  >
                    Reject
                  </button>
                )}
                {activeTab === "allUsers" && (
                  <button
                    style={btnRed}
                    onClick={() => handleReject(user._id, "user")}
                  >
                    Reject
                  </button>
                )}
                {activeTab === "rejected" && (
                  <>
                    <button
                      style={btnBlue}
                      onClick={() => handleGrantUser(user._id)}
                    >
                      Grant User
                    </button>
                    <button
                      style={btnPurple}
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
    );
  };

  const renderTab = () => {
    switch (activeTab) {
      case "pending":
        return renderTable(pendingAdmins);
      case "allAdmins":
        return renderTable(allAdmins);
      case "rejected":
        return renderTable(rejectedAdmins);
      case "allUsers":
        return renderTable(regularUsers);
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        background: "#0f172a",
        color: "#e5e7eb",
        minHeight: "100vh",
        padding: "2rem",
      }}
    >
     
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "1rem",
          position: "relative",
        }}
      >
        <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>Super Admin Dashboard</h1>

        
        <div
          ref={dropdownRef}
          style={{
            position: "relative",
            display: "inline-block",
          }}
        >
          <div
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              background: "#1f2937",
              padding: "8px 12px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                background: "#2563eb",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "10px",
              }}
            >
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <span>{userEmail}</span>
          </div>

          {dropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "110%",
                right: 0,
                background: "#1f2937",
                borderRadius: "8px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
                padding: "8px 0",
                minWidth: "160px",
                zIndex: 100,
              }}
             >
              <button
                onClick={handleLogout}
                style={{ ...dropdownBtn, color: "#ef4444" }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <StatCard title="Total Users" icon={<Users />} value={stats.users} />
        <StatCard title="Super Admins" icon={<Shield />} value={stats.superAdmins} />
        <StatCard title="Admins" icon={<UserCheck />} value={stats.admins} />
        <StatCard title="Pending" icon={<Clock />} value={stats.pending} />
      </div>

    
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "1rem",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <TabButton
          label={`Pending Requests (${stats.pending})`}
          active={activeTab === "pending"}
          onClick={() => setActiveTab("pending")}
        />
        <TabButton
          label={`Admitted Admins (${stats.admins})`}
          active={activeTab === "allAdmins"}
          onClick={() => setActiveTab("allAdmins")}
        />
        <TabButton
          label={`Rejected Admins (${stats.rejected})`}
          active={activeTab === "rejected"}
          onClick={() => setActiveTab("rejected")}
        />
        <TabButton
          label={`Regular Users (${stats.users})`}
          active={activeTab === "allUsers"}
          onClick={() => setActiveTab("allUsers")}
        />
      </div>

      {renderTab()}
    </div>
  );
};


const StatCard = ({ title, icon, value }) => (
  <div
    style={{
      background: "#1f2937",
      padding: "1rem",
      borderRadius: "10px",
      textAlign: "center",
      border: "1px solid #374151",
    }}
  >
    <div style={{ fontSize: "14px", color: "#9ca3af" }}>{title}</div>
    <div
      style={{
        fontSize: "22px",
        fontWeight: "bold",
        color: "#22d3ee",
        marginTop: "4px",
      }}
    >
      {value}
    </div>
  </div>
);

const TabButton = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      background: active ? "#16a34a" : "#1f2937",
      color: active ? "#fff" : "#9ca3af",
      padding: "8px 16px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      fontWeight: "500",
    }}
  >
    {label}
  </button>
);


const thStyle = {
  padding: "10px",
  textAlign: "left",
  color: "#9ca3af",
  borderBottom: "1px solid #374151",
};
const tdStyle = { padding: "10px" };

const btnGreen = {
  background: "#16a34a",
  color: "#fff",
  padding: "6px 12px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};
const btnRed = {
  background: "#dc2626",
  color: "#fff",
  padding: "6px 12px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};
const btnBlue = {
  background: "#2563eb",
  color: "#fff",
  padding: "6px 12px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};
const btnPurple = {
  background: "#9333ea",
  color: "#fff",
  padding: "6px 12px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};
const dropdownBtn = {
  width: "100%",
  textAlign: "left",
  padding: "8px 16px",
  background: "none",
  border: "none",
  color: "#e5e7eb",
  cursor: "pointer",
  fontSize: "14px",
};

export default SuperAdminDashboard;
