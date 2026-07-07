import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ children }) {
  const user  = useSelector((s) => s.user.user);
  const token = localStorage.getItem("token");
  if (!user && !token) return <Navigate to="/signin" replace />;
  return children;
}
