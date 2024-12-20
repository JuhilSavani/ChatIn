import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_NODE_ENV === "development" ? "http://localhost:4000/api" : "/api";

export default axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});
