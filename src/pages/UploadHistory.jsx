import React, { useEffect, useState } from "react";
import axios from "axios";

const UploadHistory = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [previewFileName, setPreviewFileName] = useState("");

  // Fetch history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setError("No token found, please log in.");
          setLoading(false);
          return;
        }

        const { data } = await axios.get("http://localhost:5000/api/users/uploads", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setFiles(data);
      } catch (err) {
        setError("Failed to load upload history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Handle preview
  const handlePreview = async (id, fileName) => {
    try {
      const token = localStorage.getItem("authToken");
      const { data } = await axios.get(
        `http://localhost:5000/api/users/uploads/preview/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPreviewData(data.data);
      setPreviewFileName(fileName);
    } catch (err) {
      setError("Failed to preview file");
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`http://localhost:5000/api/users/uploads/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles((prev) => prev.filter((file) => file._id !== id));
      if (previewFileName && previewData && id === previewData._id) {
        setPreviewData(null);
        setPreviewFileName("");
      }
    } catch (err) {
      setError("Failed to delete file");
    }
  };

  if (loading) return <p className="text-gray-400">Loading history...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6 bg-[#0d1117] text-[#c9d1d9] rounded-2xl shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-white">Upload History</h2>

      {files.length === 0 ? (
        <p className="text-gray-400">No files uploaded yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#21262d]">
            <thead className="bg-[#161b22]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#8b949e] uppercase">File Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#8b949e] uppercase">Uploaded At</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#8b949e] uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262d]">
              {files.map((file) => (
                <tr key={file._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{file.fileName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(file.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm flex gap-3 justify-end">
                    <button
                      onClick={() => handlePreview(file._id, file.fileName)}
                      className="text-[#58a6ff] hover:text-[#79c0ff]"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => handleDelete(file._id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      Delete
                    </button>
                    <a
                      href={`http://localhost:5000/${file.filePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-500 hover:text-green-400"
                    >
                      Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview Section */}
      {previewData && (
        <div className="mt-6 p-4 bg-[#161b22] rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Preview: {previewFileName}</h3>
            <button
              onClick={() => {
                setPreviewData(null);
                setPreviewFileName("");
              }}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-500"
            >
              Close Preview
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#21262d]">
              <thead className="bg-[#0d1117]">
                <tr>
                  {Object.keys(previewData[0] || {}).map((key) => (
                    <th
                      key={key}
                      className="px-4 py-2 text-left text-xs font-medium text-[#8b949e] uppercase"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#21262d]">
                {previewData.map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((val, i) => (
                      <td key={i} className="px-4 py-2 whitespace-nowrap text-sm">
                        {val !== undefined ? val.toString() : ""}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadHistory;
