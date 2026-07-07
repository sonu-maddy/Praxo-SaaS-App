import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "./features/userSlice";
import { loadTheme } from "./features/themeSlice";
import api from "./utils/api";

// Layout
import AppLayout from "./pages/Layout";

// Public pages
import SignIn         from "./pages/SignIn";
import SignUp         from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import OrgSetup       from "./pages/OrgSetup";

// App pages
import Home           from "./pages/Home";
import BoardPage      from "./pages/BoardPage";
import MyWork         from "./pages/MyWork";
import Inbox          from "./pages/Inbox";
import TeamPage       from "./pages/TeamPage";
import SettingsPage   from "./pages/SettingsPage";
import BillingPage    from "./pages/BillingPage";
import TaskDetails    from "./pages/TaskDetails";

// Protected route
import ProtectedRoute from "./components/ProtectedRoute";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

function AppInit() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(loadTheme());
    const token = localStorage.getItem("token");
    if (!token) return;
    api.get("/auth/cookie-user")
      .then(({ data }) => dispatch(setUser({ ...data, id: data._id?.toString() || data.id })))
      .catch(() => localStorage.removeItem("token"));
  }, []);
  return null;
}

function RequireOrg({ children }) {
  const user = useSelector((s) => s.user.user);
  const token = localStorage.getItem("token");
  if (!user && !token) return <Navigate to="/signin" replace />;
  // If logged in but no org, redirect to org setup
  if (user && !user.organizationId) return <Navigate to="/org-setup" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInit />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: "10px",
            fontFamily: "'Figtree', sans-serif",
            fontSize: "13px",
            fontWeight: 500,
          },
          success: { iconTheme: { primary: "#00c875", secondary: "#fff" } },
          error:   { iconTheme: { primary: "#e2445c", secondary: "#fff" } },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/signin"          element={<SignIn />} />
        <Route path="/signup"          element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/org-setup"       element={<OrgSetup />} />

        {/* Protected — requires org */}
        <Route element={<RequireOrg><AppLayout /></RequireOrg>}>
          <Route path="/"          element={<Home />} />
          <Route path="/my-work"   element={<MyWork />} />
          <Route path="/inbox"     element={<Inbox />} />
          <Route path="/board"     element={<BoardPage />} />
          <Route path="/task/:id"  element={<TaskDetails />} />
          <Route path="/team"      element={<TeamPage />} />
          <Route path="/settings"  element={<SettingsPage />} />
          <Route path="/billing"   element={<BillingPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
