import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SuperAdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [superAdmins, setSuperAdmins] = useState([]);
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [rejectedAdmins, setRejectedAdmins] = useState([]);
  const [regularUsers, setRegularUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Change this to your backend URL
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "https://excel-analysis-server.onrender.com";

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

        // ✅ Fetch all users
        const allUsersRes = await axios.get(`${API_BASE_URL}/api/users/all`, config);
        console.log("✅ allUsersRes.data =", allUsersRes.data);

        let allUsersList = allUsersRes.data;

        console.log("📊 Dashboard data received:", allUsersList);

        // ✅ Safety check to avoid `.filter` crash
        if (!Array.isArray(allUsersList)) {
          console.error("⚠️ allUsersList is not an array. Response:", allUsersList);
          allUsersList = [];
        }

        // ✅ Filter users by role/status
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
          (u) => u.role === "user" && !u.adminRequestStatus
        );

        // ✅ Update state
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

  if (loading) return <p className="text-center text-white mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-[#0d1117] text-white p-6">
      <h1 className="text-2xl font-bold text-green-400 mb-6">
        Super Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-lg">Users</p>
            <h2 className="text-2xl font-bold text-green-400">{regularUsers.length}</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center py-4">
            <p className="text-lg">Super Admins</p>
            <h2 className="text-2xl font-bold text-green-400">{superAdmins.length}</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center py-4">
            <p className="text-lg">Admins</p>
            <h2 className="text-2xl font-bold text-green-400">{admins.length}</h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center py-4">
            <p className="text-lg">Pending Requests</p>
            <h2 className="text-2xl font-bold text-green-400">{pendingAdmins.length}</h2>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 mb-6">
        <Button className="bg-green-600 hover:bg-green-700">
          Pending Requests ({pendingAdmins.length})
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700">
          Admitted Admins ({admins.length})
        </Button>
        <Button className="bg-red-600 hover:bg-red-700">
          Rejected ({rejectedAdmins.length})
        </Button>
        <Button className="bg-gray-600 hover:bg-gray-700">
          Regular Users ({regularUsers.length})
        </Button>
      </div>

      <div className="bg-[#161b22] p-6 rounded-2xl shadow-md">
        {users.length > 0 ? (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-2">Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-gray-800 hover:bg-[#1c2128]">
                  <td className="py-2">{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.adminRequestStatus || "N/A"}</td>
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
