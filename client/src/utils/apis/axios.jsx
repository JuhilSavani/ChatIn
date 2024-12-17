import axios from "axios";

const BACKEND_URL = process.env.NODE_ENV === "production" ? "/api" : "http://localhost:4000/api";

export default axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});
