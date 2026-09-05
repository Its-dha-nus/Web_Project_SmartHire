import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch("https://smarthire-api-0djt.onrender.com/api/jobs/saved", {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setSavedJobs(data);
        } else {
          toast.error("Failed to fetch saved jobs");
        }
      } catch (error) {
        console.error("Error fetching saved jobs:", error);
        toast.error("Server error.");
      } finally {
        setLoading(false);
      }
    };

    fetchSavedJobs();
  }, []);

  const handleUnsave = async (jobId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`https://smarthire-api-0djt.onrender.com/api/jobs/${jobId}/save`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        // Instantly remove it from the UI
        setSavedJobs(savedJobs.filter(job => job.job_id !== jobId));
        toast.success("Job removed from saved list.");
      }
    } catch (error) {
      console.error("Error unsaving job:", error);
    }
  };

  if (loading) return <div className="text-white text-center mt-20 text-xl">Loading your saved jobs...</div>;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white">My Saved Jobs</h2>
        <Link to="/explore" className="text-blue-400 hover:text-blue-300 transition-colors">
          &larr; Discover more jobs
        </Link>
      </div>

      {savedJobs.length === 0 ? (
        <div className="bg-gray-800/40 border border-gray-700 rounded-3xl p-12 text-center">
          <h3 className="text-xl text-gray-300 mb-4">You haven't saved any jobs yet.</h3>
          <Link to="/explore" className="text-blue-400 hover:text-blue-300 underline">Head to the Explore page to find your next opportunity</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedJobs.map((job) => (
            <div key={job.job_id} className="relative bg-gray-800/40 border border-gray-700 rounded-2xl p-6 backdrop-blur-sm shadow-lg hover:border-gray-500 transition-all group">
              
              {/* UNSAVE BUTTON */}
              <button 
                onClick={() => handleUnsave(job.job_id)}
                className="absolute top-4 right-4 text-emerald-400 hover:text-red-400 transition-colors"
                title="Remove from saved"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
              </button>

              <h3 className="text-xl font-bold text-white mb-2 pr-8">{job.title}</h3>
              <p className="text-blue-400 font-medium mb-4">{job.company_name || "Company Name"}</p>
              
              <div className="space-y-2 mb-8 text-sm text-gray-300">
                <p className="flex items-center gap-2"><span>📍</span> {job.location}</p>
                <p className="flex items-center gap-2"><span>💼</span> {job.job_type}</p>
              </div>

              <Link 
                to={`/jobs/${job.job_id}`} 
                className="block text-center w-full py-3 bg-gray-700 hover:bg-blue-600 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-md"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default SavedJobs;