import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const Home = () => {
  // 1. Declare all necessary state variables
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashboardRoute, setDashboardRoute] = useState("/");

  useEffect(() => {
    // 2. Auth Check Logic
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role === "employer") {
          setDashboardRoute("/employer/dashboard");
        } else {
          setDashboardRoute("/seeker/dashboard");
        }
      } catch (error) {
        console.error("Error decoding token on home page:", error);
      }
    }

    // 3. Fetch Recent Jobs Logic
    const fetchRecentJobs = async () => {
      try {
        const response = await fetch("https://smarthire-api-0djt.onrender.com/api/jobs");
        const data = await response.json();

        if (response.ok) {
          setRecentJobs(data.slice(0, 3));
        } else {
          console.error("Error fetching jobs:", data.message);
        }
      } catch (error) {
        console.error("Failed to connect to the server:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentJobs();
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* HERO SECTION */}
      <div className="text-center mb-20 mt-8">
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
          Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">Dream Job</span> Today
        </h1>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
          Connect with top employers and discover opportunities that match your skills on SmartHire.
        </p>
        
        {/* SMART BUTTONS CONTAINER */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mt-10">
          <Link 
            to="/explore" 
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)]"
          >
            Explore All Jobs
          </Link>

          {isLoggedIn ? (
            <Link 
              to={dashboardRoute} 
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)]"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link 
              to="/signup" 
              className="bg-gray-800/80 hover:bg-gray-700 text-white border border-gray-600 hover:border-gray-400 font-bold py-3 px-8 rounded-xl transition-all backdrop-blur-sm"
            >
              Sign Up
            </Link>
          )}
        </div>
      </div>

      {/* RECENT JOBS SECTION */}
      <div>
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-3xl font-bold text-white">Latest Opportunities</h2>
          <Link to="/explore" className="text-blue-400 hover:text-blue-300 font-medium transition-colors hidden sm:block">
            View all &rarr;
          </Link>
        </div>
        
        {loading ? (
          <p className="text-gray-400 animate-pulse text-lg">Loading latest jobs...</p>
        ) : recentJobs.length === 0 ? (
          <div className="bg-gray-800/40 border border-gray-700 rounded-3xl p-12 text-center">
            <p className="text-gray-400 text-lg">No jobs have been posted yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentJobs.map((job) => (
              <div key={job.job_id} className="bg-gray-800/40 border border-gray-700 rounded-2xl p-6 backdrop-blur-sm shadow-lg hover:border-gray-500 transition-all group">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{job.title}</h3>
                <p className="text-blue-400 font-medium mb-4">{job.company_name}</p>
                
                <div className="space-y-2 mb-8 text-sm text-gray-300">
                  <p className="flex items-center gap-2"><span>📍</span> {job.location}</p>
                  <p className="flex items-center gap-2"><span>💼</span> {job.job_type}</p>
                  <p className="flex items-center gap-2"><span>💰</span> {job.salary || "Not specified"}</p>
                </div>

                <Link 
                  to={`/jobs/${job.job_id}`} 
                  className="block text-center w-full py-3 bg-gray-700 hover:bg-blue-600 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Home;