import React, { useEffect, useState } from "react";
import axios from "../axiosConfig";

const SuperAdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [superAdmins, setSuperAdmins] = useState([]);
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [rejectedAdmins, setRejectedAdmins] = useState([]);
  const [regularUsers, setRegularUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Backend URL
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "https://excel-analysis-server.onrender.com";

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("❌ No token found. Please log in again.");
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const allUsersRes = await axios.get(
          `${API_BASE_URL}/api/users/all`,
          config
        );

        let allUsersList = allUsersRes.data;
        if (!Array.isArray(allUsersList)) {
          console.error("⚠️ allUsersList is not an array:", allUsersList);
          allUsersList = [];
        }

        const superAdminsList = allUsersList.filter(
          (u) => u.role === "superadmin"
        );
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
          (u) => u.role === "user" && !u.adminRequestStatus
        );

        setUsers(allUsersList);
        setAdmins(adminsList);
        setSuperAdmins(superAdminsList);
        setPendingAdmins(pendingAdminsList);
        setRejectedAdmins(rejectedAdminsList);
        setRegularUsers(regularUsersList);
        setLoading(false);
      } catch (error) {
        console.error("❌ Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading)
    return <p className="text-center text-white mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-[#0d1117] text-white p-6">
      <h1 className="text-2xl font-bold text-green-400 mb-6">
        Super Admin Dashboard
      </h1>

      {/* ✅ Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Users", count: regularUsers.length },
          { label: "Super Admins", count: superAdmins.length },
          { label: "Admins", count: admins.length },
          { label: "Pending Requests", count: pendingAdmins.length },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-[#161b22] rounded-xl p-4 text-center shadow-md border border-gray-800"
          >
            <p className="text-lg">{item.label}</p>
            <h2 className="text-2xl font-bold text-green-400">
              {item.count}
            </h2>
          </div>
        ))}
      </div>

      {/* ✅ Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg">
          Pending Requests ({pendingAdmins.length})
        </button>
        <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">
          Admitted Admins ({admins.length})
        </button>
        <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg">
          Rejected ({rejectedAdmins.length})
        </button>
        <button className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg">
          Regular Users ({regularUsers.length})
        </button>
      </div>

      {/* ✅ Table */}
      <div className="bg-[#161b22] p-6 rounded-2xl shadow-md overflow-x-auto">
        {users.length > 0 ? (
          <table className="w-full text-left text-gray-300">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-2 px-2">Name</th>
                <th className="px-2">Email</th>
                <th className="px-2">Role</th>
                <th className="px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u._id}
                  className="border-b border-gray-800 hover:bg-[#1c2128]"
                >
                  <td className="py-2 px-2">{u.name}</td>
                  <td className="px-2">{u.email}</td>
                  <td className="px-2">{u.role}</td>
                  <td className="px-2">
                    {u.adminRequestStatus || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-400 text-center">No data to display.</p>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
