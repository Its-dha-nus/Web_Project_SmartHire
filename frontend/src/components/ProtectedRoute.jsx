import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem("token");

  // 1. Check if they are logged in at all
  if (!token) {
    // We use setTimeout so the toast fires AFTER the redirect rendering cycle
    setTimeout(() => toast.error("Please log in to access this page."), 0);
    return <Navigate to="/login" replace />;
  }

  // 2. If a specific role is required, decode the token and check it
  if (allowedRole) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      if (payload.role !== allowedRole) {
        setTimeout(() => toast.error(`Access denied. ${allowedRole}s only.`), 0);
        // Kick them back to the homepage
        return <Navigate to="/" replace />;
      }
    } catch (error) {
      console.error("Token decoding error:", error);
      // If the token is corrupted, kick them to login
      localStorage.removeItem("token");
      return <Navigate to="/login" replace />;
    }
  }

  // 3. If they pass all checks, render the page!
  return children;
};

export default ProtectedRoute;