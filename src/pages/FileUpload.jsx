import React, { useState } from "react";
import axios from "axios";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("⚠️ Please select a file first.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken"); // token from login
      const formData = new FormData();
      formData.append("file", file);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const res = await axios.post(`${API_BASE_URL}/api/users/upload`,formData,
  {
    headers: {
      'Content-Type': 'multipart/form-data',
       Authorization: `Bearer ${token}`,
    },
  }
);


      setMessage(`✅ ${res.data.message} (${res.data.file.fileName})`);
      setFile(null);
    } catch (err) {
      setMessage(
        err.response?.data?.message || "❌ File upload failed. Try again."
      );
    }
  };

  return (
    <div className="p-6 bg-[#161b22] text-[#c9d1d9] rounded-xl shadow-lg max-w-md">
      <h2 className="text-lg font-semibold mb-4 text-white">Upload a File</h2>

      <form onSubmit={handleUpload}>
        <input
          type="file"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-300 border border-[#30363d] rounded-lg cursor-pointer bg-[#0d1117] focus:outline-none mb-4"
        />

        <button
          type="submit"
          className="w-full px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white font-medium rounded-lg"
        >
          Upload
        </button>
      </form>

      {message && (
        <p className="mt-4 text-sm text-center text-gray-300">{message}</p>
      )}
    </div>
  );
};

export default FileUpload;
