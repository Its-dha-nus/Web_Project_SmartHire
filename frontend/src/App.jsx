import NotFound from "./pages/NotFound";
import EmployerDashboard from "./pages/EmployerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home.jsx";
import Explore from "./pages/Explore";
import PostJob from "./pages/PostJob";
import CreateProfile from "./pages/CreateProfile";
import CreateSeekerProfile from "./pages/CreateSeekerProfile";
import JobDetails from "./pages/JobDetails";
import SeekerDashboard from "./pages/SeekerDashboard";
import MyProfile from "./pages/MyProfile";
import { Toaster } from "react-hot-toast";
import ApplicantProfile from "./pages/ApplicantProfile";
import EditJob from "./pages/EditJob";
import SavedJobs from "./pages/SavedJobs";
const PORT = process.env.PORT || 5000;
function App() {
  return (
    <div className="min-h-screen bg-gray-900 font-sans text-gray-100">
      <Navbar />
      <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1f2937', // Tailwind bg-gray-800
              color: '#f3f4f6',      // Tailwind text-gray-100
              border: '1px solid #374151', // Tailwind border-gray-700
            },
            success: {
              iconTheme: {
                primary: '#10b981', // Tailwind emerald-500
                secondary: '#1f2937',
              },
            },
          }}
        />
      
      <Routes>
        {/* --- PUBLIC ROUTES (No protection needed) --- */}
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* --- GENERAL PROTECTED ROUTES (Must be logged in, any role) --- */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <MyProfile />
            </ProtectedRoute>
          } 
        />

        {/* --- EMPLOYER ONLY ROUTES --- */}
        <Route 
          path="/create-profile" 
          element={
            <ProtectedRoute allowedRole="employer">
              <CreateProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/post-job" 
          element={
            <ProtectedRoute allowedRole="employer">
              <PostJob />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/employer/dashboard" 
          element={
            <ProtectedRoute allowedRole="employer">
              <EmployerDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/applicant/:applicationId" 
          element={
            <ProtectedRoute allowedRole="employer">
              <ApplicantProfile />
            </ProtectedRoute>
          } 
        />

        {/* --- THE NEW EDIT JOB ROUTE --- */}
        <Route 
          path="/edit-job/:id" 
          element={
            <ProtectedRoute allowedRole="employer">
              <EditJob />
            </ProtectedRoute>
          } 
        />

        {/* --- SEEKER ONLY ROUTES --- */}
        <Route 
          path="/create-seeker-profile" 
          element={
            <ProtectedRoute allowedRole="seeker">
              <CreateSeekerProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/seeker/dashboard" 
          element={
            <ProtectedRoute allowedRole="seeker">
              <SeekerDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/saved-jobs" 
          element={
            <ProtectedRoute allowedRole="seeker">
              <SavedJobs />
            </ProtectedRoute>
          } 
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;