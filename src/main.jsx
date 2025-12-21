import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import CreateTrip from "./create-trip/index.jsx";
import ViewTrip from "./view-trip/index.jsx";
import { ToastProvider } from "./components/ui/toast";
import ViewDetails from './view-trip/ViewDetails';
import { AuthProvider } from "./context/AuthContext";
import MyTrips from "./my-trips/index.jsx";
import Layout from "./Layout";

import About from "./components/pages/About";
import Contact from "./components/pages/Contact";
import Chat from "./chat/index.jsx";
import Explore from "./pages/Explore.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import OrganiserDashboard from "./pages/OrganiserDashboard.jsx";
import Profile from "./pages/Profile.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <App /> },
      { path: "/create-trip", element: <CreateTrip /> },
      { path: "/view-trip", element: <ViewTrip /> },
      { path: "/view-trip/:id", element: <ViewTrip /> },
      { path: "/view-details", element: <ViewDetails /> },

      { path: "/my-trips", element: <MyTrips /> },
      { path: "/explore", element: <Explore /> },
      { path: "/chat", element: <Chat /> },
      { path: "/profile", element: <Profile /> },

      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/admin", element: <AdminDashboard /> },
      { path: "/organiser", element: <OrganiserDashboard /> },


      { path: "/about", element: <About /> },
      { path: "/contact", element: <Contact /> },
      { path: "*", element: <div>Page not found</div> },
    ]
  }
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </AuthProvider>
  </StrictMode>
);
