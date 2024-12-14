import axios from "axios";

const BACKEND_URL = `${
  import.meta.env.VITE_NODE_ENV === "production"
    ? import.meta.env.VITE_BACKEND_URL
    : "http://localhost:4000"
}/api`;

export default axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});
