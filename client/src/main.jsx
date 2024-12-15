// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.scss";
import App from "./App.jsx";
import { AuthProvider } from "./utils/contexts/AuthContext.jsx";
import { SocketProvider } from "./utils/contexts/SocketContext.jsx";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <AuthProvider>
    <SocketProvider>
      <App />
    </SocketProvider>
  </AuthProvider>
  // </StrictMode>
);
