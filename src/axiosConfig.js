import axios from "axios";

const instance = axios.create({
  baseURL: "https://excel-analysis-server.onrender.com", // your backend URL
});

export default instance;
