import React from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Outlet,
  Route,
  RouterProvider,
} from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Chat from "./pages/Chat";
import Navbar from "./components/Navbar";

// Define a layout component
const Layout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

// Define the routes
const routes = createRoutesFromElements(
  <Route path="/" element={<Layout />}>
    {/* Public */}
    <Route index element={<Home />} />
    <Route path="about" element={<About />} />
    <Route path="chat" element={<Chat />} />
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
