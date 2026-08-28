import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const SeekerDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("https://smarthire-api-0djt.onrender.com/api/jobs/seeker/dashboard", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (response.ok) {
          setApplications(data);
        } else {
          console.error("Error fetching dashboard:", data.message);
        }
      } catch (error) {
        console.error("Failed to connect to the server:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="text-white text-center mt-20 text-xl">Loading your dashboard...</div>;
  }

  // Helper to color-code the status badge
  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return 'bg-emerald-900/40 text-emerald-400 border-emerald-700/50';
      case 'rejected':
        return 'bg-red-900/40 text-red-400 border-red-700/50';
      default:
        return 'bg-yellow-900/40 text-yellow-500 border-yellow-700/50';
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">My Applications</h2>
        <p className="text-gray-400">Track the status of jobs you've applied for.</p>
      </div>

      {applications.length === 0 ? (
        <div className="bg-gray-800/40 border border-gray-700 rounded-3xl p-12 text-center shadow-lg">
          <h3 className="text-xl text-gray-300 mb-4">You haven't applied to any jobs yet.</h3>
          <Link to="/explore" className="text-emerald-400 hover:text-emerald-300 underline transition-colors">
            Start exploring opportunities
          </Link>
        </div>
      ) : (
        <div className="bg-gray-800/40 border border-gray-700 rounded-3xl overflow-hidden shadow-lg backdrop-blur-sm">
          <div className="hidden md:grid grid-cols-4 gap-4 p-6 bg-gray-900/50 border-b border-gray-700 text-sm font-semibold text-gray-400 uppercase tracking-wider">
            <div className="col-span-2">Job & Company</div>
            <div>Applied On</div>
            <div>Status</div>
          </div>
          
          <div className="divide-y divide-gray-700/50">
            {applications.map((app) => (
              <div key={app.application_id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 items-center hover:bg-gray-800/50 transition-colors">
                
                <div className="col-span-2">
                  <Link to={`/jobs/${app.job_id}`} className="text-xl font-bold text-white hover:text-emerald-400 transition-colors">
                    {app.title}
                  </Link>
                  <p className="text-blue-400 font-medium text-sm mt-1">{app.company_name}</p>
                  <p className="text-gray-500 text-xs mt-1">{app.location} • {app.job_type}</p>
                </div>

                <div className="text-gray-300 text-sm font-medium">
                  Recently Applied
                </div>

                <div>
                  <span className={`px-3 py-1 text-xs font-semibold uppercase tracking-wide border rounded-md inline-block ${getStatusBadge(app.status)}`}>
                    {app.status}
                  </span>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
};

export default SeekerDashboard;