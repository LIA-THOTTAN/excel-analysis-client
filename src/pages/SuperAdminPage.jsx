import React, { useState, useEffect, useRef } from "react";
import axios from "../axiosConfig";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Users, UserPlus, Clock, UserCheck, LayoutDashboard, Upload, History } from "lucide-react";

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
      toast.success("Admin rejected!");
      fetchDashboardData();
    } catch {
      toast.error("Failed to reject admin.");
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
      return <p className="text-center text-gray-400 mt-4">No records found.</p>;

    return (
      <div className="overflow-x-auto mt-4">
        <table className="min-w-full bg-[#161b22] border border-[#30363d] rounded-lg">
          <thead>
            <tr className="border-b border-[#30363d] text-gray-300">
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Created</th>
              <th className="p-3 text-left">Last Login</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b border-[#30363d] hover:bg-[#0d1117]">
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">
                  <span className="bg-gray-700 text-white px-2 py-1 rounded text-xs">
                    {user.role}
                  </span>
                </td>
                <td className="p-3">{formatDate(user.createdAt)}</td>
                <td className="p-3">{formatDate(user.lastLogin)}</td>
                <td className="p-3 flex gap-2">
                  {activeTab === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(user._id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(user._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                      >
                        Reject
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
    <div className="flex min-h-screen bg-[#0d1117] text-gray-200">
      
      <aside className="w-64 bg-[#161b22] border-r border-[#30363d] p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-6 text-blue-400">Super Admin Panel</h2>
        <nav className="flex flex-col gap-2">
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex items-center gap-2 p-3 rounded ${
              activeTab === "pending"
                ? "bg-blue-600 text-white"
                : "hover:bg-[#0d1117] text-gray-300"
            }`}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button
            onClick={() => setActiveTab("allAdmins")}
            className={`flex items-center gap-2 p-3 rounded ${
              activeTab === "allAdmins"
                ? "bg-blue-600 text-white"
                : "hover:bg-[#0d1117] text-gray-300"
            }`}
          >
            <UserCheck size={18} /> Admins
          </button>
          <button
            onClick={() => setActiveTab("rejected")}
            className={`flex items-center gap-2 p-3 rounded ${
              activeTab === "rejected"
                ? "bg-blue-600 text-white"
                : "hover:bg-[#0d1117] text-gray-300"
            }`}
          >
            <Clock size={18} /> Rejected
          </button>
          <button
            onClick={() => setActiveTab("allUsers")}
            className={`flex items-center gap-2 p-3 rounded ${
              activeTab === "allUsers"
                ? "bg-blue-600 text-white"
                : "hover:bg-[#0d1117] text-gray-300"
            }`}
          >
            <Users size={18} /> Users
          </button>
        </nav>
        <div className="mt-auto pt-4 border-t border-[#30363d]">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 py-2 rounded text-white mt-2"
          >
            Logout
          </button>
        </div>
      </aside>

      
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
          <div className="flex items-center gap-3 bg-[#161b22] p-2 rounded-lg px-4">
            <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center">
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <span>{userEmail}</span>
          </div>
        </div>

    
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 text-center">
            <p className="text-gray-400">Total Users</p>
            <h2 className="text-purple-400 text-2xl font-bold">{stats.users}</h2>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 text-center">
            <p className="text-gray-400">Total Admins</p>
            <h2 className="text-purple-400 text-2xl font-bold">{stats.admins}</h2>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 text-center">
            <p className="text-gray-400">Super Admins</p>
            <h2 className="text-purple-400 text-2xl font-bold">{stats.superAdmins}</h2>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 text-center">
            <p className="text-gray-400">Pending</p>
            <h2 className="text-purple-400 text-2xl font-bold">{stats.pending}</h2>
          </div>
        </div>

       
        <div className="flex gap-3 mb-4">
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "pending" ? "bg-purple-600 text-white" : "bg-[#161b22]"
            }`}
            onClick={() => setActiveTab("pending")}
          >
            Pending ({pendingAdmins.length})
          </button>
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "allAdmins" ? "bg-purple-600 text-white" : "bg-[#161b22]"
            }`}
            onClick={() => setActiveTab("allAdmins")}
          >
            Admins ({allAdmins.length})
          </button>
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "rejected" ? "bg-purple-600 text-white" : "bg-[#161b22]"
            }`}
            onClick={() => setActiveTab("rejected")}
          >
            Rejected ({rejectedAdmins.length})
          </button>
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "allUsers" ? "bg-purple-600 text-white" : "bg-[#161b22]"
            }`}
            onClick={() => setActiveTab("allUsers")}
          >
            Users ({regularUsers.length})
          </button>
        </div>

       
        {renderTabContent()}
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
