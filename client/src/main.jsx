// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.scss";
import App from "./App.jsx";
import { AuthProvider } from "./utils/contexts/AuthContext.jsx";
import { SocketProvider } from "./utils/contexts/SocketContext.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <AuthProvider>
    <SocketProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </SocketProvider>
  </AuthProvider>
  // </StrictMode>
);
