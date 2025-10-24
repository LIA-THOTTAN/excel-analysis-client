import React, { useEffect, useState } from "react";
import axios from "axios";

const SuperAdminPage = () => {
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [rejectedAdmins, setRejectedAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");


  const API_URL =
    import.meta.env.VITE_API_URL || "https://excel-analysis-server.onrender.com";


  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const [usersRes, adminsRes, pendingRes, rejectedRes] = await Promise.all([
          axios.get(`${API_URL}/api/users/all`, config),
          axios.get(`${API_URL}/api/users/all-admins`, config),
          axios.get(`${API_URL}/api/users/pending-admins`, config),
          axios.get(`${API_URL}/api/users/rejected-admins`, config),
        ]);

        
        setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
        setAdmins(Array.isArray(adminsRes.data) ? adminsRes.data : []);
        setPendingAdmins(Array.isArray(pendingRes.data) ? pendingRes.data : []);
        setRejectedAdmins(Array.isArray(rejectedRes.data) ? rejectedRes.data : []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. You may not be authorized.");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchAllData();
    else setError("Unauthorized: No token found.");
  }, [token]);

  const handleAction = async (action, userId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`${API_URL}/api/users/${action}/${userId}`, {}, config);
      alert(`Action '${action}' completed successfully.`);
      window.location.reload(); 
    } catch (err) {
      console.error(`Error performing ${action}:`, err);
      alert(`Failed to ${action}. Check console for details.`);
    }
  };

  if (loading)
    return <p className="text-center text-gray-300 mt-10">Loading data...</p>;
  if (error)
    return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <div className="bg-[#0d1117] min-h-screen text-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Super Admin Dashboard
      </h1>

     
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">All Users</h2>
        {users.length ? (
          <table className="w-full text-sm border border-gray-700 rounded-lg">
            <thead className="bg-[#161b22] text-gray-300">
              <tr>
                <th className="p-3">Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u._id}
                  className="border-t border-gray-700 hover:bg-[#1c2128]"
                >
                  <td className="p-3">{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.isBlocked ? "Blocked" : "Active"}</td>
                  <td className="space-x-2">
                    {u.isBlocked ? (
                      <button
                        onClick={() => handleAction("unblock", u._id)}
                        className="px-3 py-1 text-xs bg-green-600 rounded"
                      >
                        Unblock
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction("block", u._id)}
                        className="px-3 py-1 text-xs bg-red-600 rounded"
                      >
                        Block
                      </button>
                    )}
                    {u.role === "user" && (
                      <button
                        onClick={() => handleAction("grant-admin", u._id)}
                        className="px-3 py-1 text-xs bg-blue-600 rounded"
                      >
                        Make Admin
                      </button>
                    )}
                    {u.role === "admin" && (
                      <button
                        onClick={() => handleAction("grant-user", u._id)}
                        className="px-3 py-1 text-xs bg-yellow-600 rounded"
                      >
                        Make User
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No users found.</p>
        )}
      </section>

   
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-blue-400">All Admins</h2>
        {admins.length ? (
          <table className="w-full text-sm border border-gray-700 rounded-lg">
            <thead className="bg-[#161b22] text-gray-300">
              <tr>
                <th className="p-3">Name</th>
                <th>Email</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr
                  key={a._id}
                  className="border-t border-gray-700 hover:bg-[#1c2128]"
                >
                  <td className="p-3">{a.name}</td>
                  <td>{a.email}</td>
                  <td>{a.status || "Active"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No admins found.</p>
        )}
      </section>


      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-yellow-400">
          Pending Admin Approvals
        </h2>
        {pendingAdmins.length ? (
          <table className="w-full text-sm border border-gray-700 rounded-lg">
            <thead className="bg-[#161b22] text-gray-300">
              <tr>
                <th className="p-3">Name</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingAdmins.map((a) => (
                <tr
                  key={a._id}
                  className="border-t border-gray-700 hover:bg-[#1c2128]"
                >
                  <td className="p-3">{a.name}</td>
                  <td>{a.email}</td>
                  <td className="space-x-2">
                    <button
                      onClick={() => handleAction("approve", a._id)}
                      className="px-3 py-1 text-xs bg-green-600 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction("reject-admin", a._id)}
                      className="px-3 py-1 text-xs bg-red-600 rounded"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No pending admin requests.</p>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-red-400">
          Rejected Admin Requests
        </h2>
        {rejectedAdmins.length ? (
          <ul className="list-disc ml-6">
            {rejectedAdmins.map((a) => (
              <li key={a._id}>
                {a.name} — {a.email}
              </li>
            ))}
          </ul>
        ) : (
          <p>No rejected admins.</p>
        )}
      </section>
    </div>
  );
};

export default SuperAdminPage;
