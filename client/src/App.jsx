import React from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Outlet,
  Route,
  RouterProvider,
  useLocation,
} from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import EmailVerify from "./pages/EmailVerify";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./utils/ProtectedRoute";
import useAuth from "./utils/hooks/useAuth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Define a layout component
const Layout = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const navbarRoutes = ["/", "/about", "/home", "/profile"];
  const showNavbar = navbarRoutes.includes(location.pathname);
  
  return (
    <>
      {isAuthenticated && showNavbar && <Navbar />}
      <Outlet />
      <ToastContainer
          position="bottom-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
        <footer className="fixed flex justify-center bottom-0 left-1/2 -translate-x-1/2 w-[90vw] min-w-[880px] bg-primary-white border-2 border-primary-black border-t-[5px] border-b-0 rounded-t-md py-3 translate-y-[80%] hover:translate-y-0 transition-transform duration-300 ease-in-out z-50 cursor-pointer">
          <span className="text-sm font-bold px-[0.4rem] py-[0.1rem] text-primary-black border-b-[2px] border-dashed border-primary-black pointer-events-auto">
            Built with ❤, ☕️ and lots of 🍪s!
          </span>
        </footer>
    </>
  );
};

// Define the routes
const routes = createRoutesFromElements(
  <Route path="/" element={<Layout />}>
    <Route element={<ProtectedRoute />}>
      <Route index element={<Home />} />
      <Route path="about" element={<About />} />
      <Route path="profile" element={<Profile />} />
    </Route>

    <Route path="sign-in" element={<SignIn />} />
    <Route path="sign-up" element={<SignUp />} />
    <Route path="verify" element={<EmailVerify />} />
    
     {/* Catch all */}
     <Route path="*" element={<NotFound />} />
  </Route>
);

const App = () => {
  return (
    <section id="app">
      <RouterProvider router={createBrowserRouter(routes)} />
    </section>
  );
};

export default App;
