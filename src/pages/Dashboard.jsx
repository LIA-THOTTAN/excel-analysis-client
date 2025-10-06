// client/src/pages/Dashboard.jsx
import React, { useState, useRef } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, Tooltip, Legend, CartesianGrid,
  ResponsiveContainer, Cell, ScatterChart, Scatter,
} from "recharts";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042",
  "#AF19FF", "#FF0056", "#8A2BE2", "#7FFF00",
  "#FFC0CB", "#ADD8E6", "#DDA0DD", "#90EE90",
];

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const [chartType, setChartType] = useState("Line");
  const [generated, setGenerated] = useState(false);
  const [message, setMessage] = useState("");
  const [chartData, setChartData] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const chartRef = useRef(null);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setMessage("");

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const json = XLSX.utils.sheet_to_json(ws);

        if (json.length > 0) {
          setData(json);
          setColumns(Object.keys(json[0]));
          setXAxis("");
          setYAxis("");
          setGenerated(false);
          setChartData([]);
        } else {
          setMessage("The uploaded file is empty or could not be parsed.");
        }
      } catch (error) {
        setMessage("Failed to read the file. Please upload a valid Excel file.");
      }
    };
    reader.readAsBinaryString(file);
  };

  // Upload file to backend
  const handleUploadToServer = async () => {
    if (!selectedFile) {
      setMessage("Please select a file to upload.");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      setMessage("No authentication token found. Please log in again.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.post("http://localhost:5000/api/users/upload", formData, config);
      setMessage("File uploaded successfully!");
      setSelectedFile(null);
    } catch (error) {
      setMessage(`File upload failed: ${error.response?.data?.message || error.message}`);
    }
  };

  // Generate chart data
  const handleGenerateGraph = () => {
    setMessage("");

    if (!xAxis || !yAxis) {
      setMessage("Please select required axes.");
      return;
    }

    let formattedData = [];

    if (chartType === "Pie" || chartType === "Donut") {
      const sums = data.reduce((acc, row) => {
        const category = row[xAxis];
        const value = parseFloat(row[yAxis]);
        if (!isNaN(value)) acc[category] = (acc[category] || 0) + value;
        return acc;
      }, {});
      formattedData = Object.keys(sums).map((name) => ({ name, value: sums[name] }));
    } else {
      formattedData = data
        .map((row) => {
          const yValue = parseFloat(row[yAxis]);
          if (!isNaN(yValue)) {
            return { [xAxis]: row[xAxis], [yAxis]: yValue };
          }
          return null;
        })
        .filter(Boolean);
    }

    if (formattedData.length === 0) {
      setMessage("No valid data found.");
      return;
    }

    setChartData(formattedData);
    setGenerated(true);
  };

  // Export PNG
  const handleSavePng = () => {
    if (!chartRef.current) return;
    toPng(chartRef.current).then((dataUrl) => {
      const link = document.createElement("a");
      link.download = "chart.png";
      link.href = dataUrl;
      link.click();
    });
  };

  // Export PDF
  const handleSavePdf = () => {
    if (!chartRef.current) return;
    toPng(chartRef.current).then((dataUrl) => {
      const pdf = new jsPDF("landscape");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight() * 0.8;
      pdf.addImage(dataUrl, "PNG", 10, 20, pdfWidth - 20, pdfHeight);
      pdf.save("chart.pdf");
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0d1117] text-[#c9d1d9] p-8 font-sans">
      {/* Upload Section */}
      <div className="w-full max-w-xl mx-auto space-y-6 bg-[#161b22] border border-[#30363d] p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center">Upload Excel File</h2>

        <div className="flex flex-col items-center">
          <label htmlFor="file-upload" className="cursor-pointer bg-[#0370a7] text-white py-3 px-6 rounded-md hover:bg-[#2083ba]">
            Choose a File
          </label>
          <input id="file-upload" type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="hidden" />
          {selectedFile && <p className="mt-2 text-sm">Selected: {selectedFile.name}</p>}
          {selectedFile && (
            <button onClick={handleUploadToServer} className="mt-4 bg-[#238636] text-white py-2 px-4 rounded-md hover:bg-[#2ea043]">
              Upload to Server
            </button>
          )}
        </div>

        {/* Axis & Chart Type Selectors */}
        {columns.length > 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">X-Axis:</label>
              <select value={xAxis} onChange={(e) => setXAxis(e.target.value)} className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md">
                <option value="">-- Select --</option>
                {columns.map((col) => <option key={col} value={col}>{col}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Y-Axis:</label>
              <select value={yAxis} onChange={(e) => setYAxis(e.target.value)} className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md">
                <option value="">-- Select --</option>
                {columns.map((col) => <option key={col} value={col}>{col}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Chart Type:</label>
              <select value={chartType} onChange={(e) => setChartType(e.target.value)} className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md">
                <option value="Line">Line Chart</option>
                <option value="Bar">Bar Chart</option>
                <option value="Pie">Pie Chart</option>
                <option value="Donut">Donut Chart</option>
                <option value="Scatter">Scatter Plot</option>
              </select>
            </div>
            <button onClick={handleGenerateGraph} className="w-full bg-[#238636] text-white py-3 rounded-md hover:bg-[#2ea043]">
              Generate Graph
            </button>
          </div>
        )}

        {message && <div className="p-3 text-center text-green-400 border border-green-500 rounded">{message}</div>}
      </div>

      {/* Chart Preview */}
      {generated && (chartData.length > 0) && (
        <div className="mt-12 w-full max-w-5xl mx-auto h-[450px] border border-[#30363d] rounded-lg bg-[#161b22] p-4 shadow-lg">
          <h3 className="text-xl font-bold mb-4 text-center">
            {chartType} Chart for {xAxis} vs {yAxis}
          </h3>
          <div className="h-[380px]" ref={chartRef}>
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "Line" ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                  <XAxis dataKey={xAxis} stroke="#c9d1d9" />
                  <YAxis stroke="#c9d1d9" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey={yAxis} stroke={COLORS[0]} strokeWidth={2} />
                </LineChart>
              ) : chartType === "Bar" ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                  <XAxis dataKey={xAxis} stroke="#c9d1d9" />
                  <YAxis stroke="#c9d1d9" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={yAxis} fill={COLORS[1]} barSize={30} />
                </BarChart>
              ) : chartType === "Pie" ? (
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              ) : chartType === "Donut" ? (
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              ) : chartType === "Scatter" ? (
                <ScatterChart>
                  <CartesianGrid stroke="#30363d" />
                  <XAxis dataKey={xAxis} stroke="#c9d1d9" />
                  <YAxis dataKey={yAxis} stroke="#c9d1d9" />
                  <Tooltip />
                  <Legend />
                  <Scatter data={chartData} fill={COLORS[4]} />
                </ScatterChart>
              ) : null}
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Export Buttons */}
      {generated && chartData.length > 0 && (
        <div className="flex justify-center mt-6 space-x-4">
          <button onClick={handleSavePng} className="bg-green-600 text-white py-2 px-6 rounded hover:bg-green-700">Save as PNG</button>
          <button onClick={handleSavePdf} className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700">Save as PDF</button>
        </div>
      )}
    </div>
  );
}
