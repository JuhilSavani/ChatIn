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
import ProtectedRoute from "./utils/ProtectedRoute";
import useAuth from "./utils/hooks/useAuth";

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
