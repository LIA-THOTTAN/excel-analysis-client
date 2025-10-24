import axios from "axios";

const instance = axios.create({
  baseURL: "https://excel-analysis-server.onrender.com", 
});

export default instance;
