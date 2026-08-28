import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const EmployerDashboard = () => {
  const [dashboardData, setDashboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/jobs/employer/dashboard", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (response.ok) {
          setDashboardData(data);
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

  const handleStatusChange = async (appId, newStatus) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:5000/api/jobs/applications/${appId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setDashboardData(prevData => prevData.map(job => ({
          ...job,
          applicants: job.applicants.map(app => 
            app.application_id === appId ? { ...app, status: newStatus } : app
          )
        })));
        toast.success(`Applicant status updated to ${newStatus}`);
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Server error while updating status.");
    }
  };

  // --- NEW DELETE FUNCTION ---
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job? This cannot be undone.")) return;

    const token = localStorage.getItem("token");
    
    try {
      const response = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success("Job deleted successfully!");
        // Instantly remove the job from the UI without refreshing the page
        setDashboardData(prevData => prevData.filter(job => job.job_id !== jobId));
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to delete job.");
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      toast.error("Server error while deleting.");
    }
  };

  if (loading) {
    return <div className="text-white text-center mt-20 text-xl">Loading your dashboard...</div>;
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white">Employer Dashboard</h2>
        <Link 
          to="/post-job" 
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)]"
        >
          + Post New Job
        </Link>
      </div>

      {dashboardData.length === 0 ? (
        <div className="bg-gray-800/40 border border-gray-700 rounded-3xl p-12 text-center">
          <h3 className="text-xl text-gray-300 mb-4">You haven't posted any jobs yet.</h3>
          <Link to="/post-job" className="text-blue-400 hover:text-blue-300 underline">Get started by posting your first job</Link>
        </div>
      ) : (
        <div className="space-y-8">
          {dashboardData.map((job) => (
            <div key={job.job_id} className="bg-gray-800/40 border border-gray-700 rounded-3xl p-6 md:p-8 backdrop-blur-sm shadow-lg">

              <div className="border-b border-gray-700 pb-4 mb-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">{job.title}</h3>
                  <p className="text-sm text-gray-400">
                    {job.job_type} • {job.location} • Posted: {new Date(job.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                {/* --- UPDATED HEADER WITH DELETE BUTTON --- */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="bg-gray-900/50 px-4 py-2 rounded-lg border border-gray-600 text-sm font-medium text-blue-400">
                    {job.applicants.length} Applicant{job.applicants.length !== 1 ? 's' : ''}
                  </div>
                  <Link 
    to={`/edit-job/${job.job_id}`}
    className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 hover:text-blue-300 border border-blue-500/50 py-2 px-4 rounded-lg font-medium transition-all"
  >
    Edit Job
  </Link>
                  <button 
                    onClick={() => handleDeleteJob(job.job_id)}
                    className="bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-red-300 border border-red-500/50 py-2 px-4 rounded-lg font-medium transition-all"
                  >
                    Delete Job
                  </button>
                </div>
              </div>

              {/* Applicants Section */}
              {job.applicants.length === 0 ? (
                <p className="text-gray-500 italic">No applications received yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {job.applicants.map((applicant) => (
                    <div key={applicant.application_id} className="bg-gray-900/60 border border-gray-600 rounded-xl p-5 hover:border-gray-500 transition-colors">
                      
                      <div className="flex justify-between items-start mb-3">
                          <Link to={`/applicant/${applicant.application_id}`}>
                            <h4 className="text-lg font-bold text-emerald-400 hover:text-emerald-300 hover:underline transition-all">
                              {applicant.full_name}
                            </h4>
                          </Link>
                        <div className="flex gap-2">
                          {applicant.status === 'pending' ? (
                            <>
                              <button 
                                onClick={() => handleStatusChange(applicant.application_id, 'accepted')}
                                className="px-3 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-600 hover:bg-emerald-600 hover:text-white rounded text-xs font-bold uppercase transition-colors"
                              >
                                Accept
                              </button>
                              <button 
                                onClick={() => handleStatusChange(applicant.application_id, 'rejected')}
                                className="px-3 py-1 bg-red-600/20 text-red-400 border border-red-600 hover:bg-red-600 hover:text-white rounded text-xs font-bold uppercase transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className={`text-xs px-2 py-1 rounded-md uppercase tracking-wide font-bold border ${
                              applicant.status === 'accepted' 
                                ? 'bg-emerald-900/40 text-emerald-400 border-emerald-700/50' 
                                : 'bg-red-900/40 text-red-400 border-red-700/50'
                            }`}>
                              {applicant.status}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-sm text-gray-300 space-y-1 mb-4">
                        <p><span className="text-gray-500">Skills:</span> {applicant.skills}</p>
                        <p><span className="text-gray-500">Contact:</span> {applicant.contact_number}</p>
                      </div>

                      <div className="flex gap-3 text-sm">
                        {applicant.linkedin_url && (
                          <a href={applicant.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                            LinkedIn ↗
                          </a>
                        )}
                        {applicant.github_url && (
                          <a href={applicant.github_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-300">
                            GitHub ↗
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default EmployerDashboard;