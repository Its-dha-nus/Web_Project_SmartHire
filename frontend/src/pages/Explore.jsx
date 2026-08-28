import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast"; // <-- Added missing toast import!

const Explore = () => {
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [isSeeker, setIsSeeker] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/jobs");
        const data = await response.json();
        if (response.ok) setJobs(data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch Saved Jobs AND Profile Status
    const checkSeekerData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role === "seeker") {
          setIsSeeker(true);

          // 1. Fetch Saved Jobs
          const savedRes = await fetch("http://localhost:5000/api/jobs/saved", {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (savedRes.ok) {
            const savedData = await savedRes.json();
            setSavedJobIds(new Set(savedData.map(j => j.job_id)));
          }

          // 2. Fetch Profile to check Student Status
          const profileRes = await fetch("http://localhost:5000/api/profiles/me", {
            headers: { "Authorization": `Bearer ${token}` }
          });
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            // Automatically filter for Internships if they are a student
            if (profileData.is_student) {
              setFilterType("internship"); // Lowercase to match the jobTypes array exactly
            }
          }
        }
      } catch (err) {
        console.error("Auth error on explore page", err);
      }
    };

    fetchJobs();
    checkSeekerData();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const searchLower = searchTerm.toLowerCase();
    const filterLower = filterType.toLowerCase();

    // 1. Search bar logic (Checks everything)
    const matchesSearch = 
      (job.title?.toLowerCase().includes(searchLower)) || 
      (job.company_name?.toLowerCase().includes(searchLower)) ||
      (job.location?.toLowerCase().includes(searchLower)) ||
      (job.job_type?.toLowerCase().includes(searchLower));
    
    // 2. The chip checks Job Type OR Location
    const matchesType = 
      filterType === "All" || 
      job.job_type?.toLowerCase() === filterLower ||
      job.location?.toLowerCase().includes(filterLower);

    // Only keep the job if it matches BOTH conditions
    return matchesSearch && matchesType;
  });

  const handleToggleSave = async (jobId) => {
    if (!isSeeker) return toast.error("Please log in as a seeker to save jobs.");

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:5000/api/jobs/${jobId}/save`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();

        // Update the Set of saved IDs instantly
        setSavedJobIds(prev => {
          const newSet = new Set(prev);
          if (data.isSaved) {
            newSet.add(jobId);
            toast.success("Job saved!");
          } else {
            newSet.delete(jobId);
            toast.success("Job removed from saved.");
          }
          return newSet;
        });
      }
    } catch (error) {
      toast.error("Failed to save job.");
    }
  };

  const jobTypes = ["All", "full-time", "part-time", "remote", "contract", "internship"];

  if (loading) {
    return <div className="text-white text-center mt-20 text-xl">Loading opportunities...</div>;
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
          Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">Opportunities</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Find the perfect role by searching titles, companies, or filtering by job type.
        </p>
      </div>

      {/* Premium Search and Filter UI */}
      <div className="bg-gray-800/40 border border-gray-700 rounded-2xl p-6 mb-10 backdrop-blur-sm shadow-lg max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search Bar */}
          <div className="w-full md:w-1/2 relative">
            <input 
              type="text" 
              placeholder="Search jobs or companies..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-600 text-white rounded-xl py-3 px-4 pl-11 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder-gray-500"
            />
            {/* Search Icon SVG */}
            <svg className="w-5 h-5 text-gray-500 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap justify-center gap-2 w-full md:w-auto">
            {jobTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all duration-200 border ${
                  filterType === type 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                    : 'bg-gray-900/50 text-gray-400 border-gray-700 hover:border-gray-500 hover:text-gray-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Render the FILTERED jobs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <div key={job.job_id} className="relative bg-gray-800/40 border border-gray-700 rounded-2xl p-6 hover:border-emerald-500/50 transition-colors shadow-lg flex flex-col justify-between h-full">
              
              {/* SMART BOOKMARK BUTTON */}
              {isSeeker && (
                <button 
                  onClick={(e) => {
                    e.preventDefault(); 
                    handleToggleSave(job.job_id);
                  }}
                  className="absolute top-6 right-6 transition-transform hover:scale-110 z-10"
                  title={savedJobIds.has(job.job_id) ? "Remove from saved" : "Save job"}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-7 w-7" 
                    fill={savedJobIds.has(job.job_id) ? "#10b981" : "none"} 
                    viewBox="0 0 24 24" 
                    stroke={savedJobIds.has(job.job_id) ? "#10b981" : "#515f73"} 
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              )}

              <div>
                <h2 className="text-2xl font-bold text-white mb-1 pr-10">{job.title}</h2>
                <p className="text-emerald-400 font-semibold mb-4">{job.company_name}</p>
                
                <div className="space-y-2 mb-6">
                  <p className="text-gray-400 text-sm flex items-center gap-2">
                    📍 {job.location}
                  </p>
                  <p className="text-gray-400 text-sm flex items-center gap-2 capitalize">
                    💼 {job.job_type}
                  </p>
                  <p className="text-gray-400 text-sm flex items-center gap-2">
                    💰 {job.salary}
                  </p>
                </div>
              </div>
              
              <Link 
                to={`/jobs/${job.job_id}`} 
                className="block w-full text-center bg-gray-700/50 hover:bg-emerald-600/20 text-gray-300 hover:text-emerald-400 border border-gray-600 hover:border-emerald-500 font-semibold py-2.5 rounded-xl transition-all"
              >
                View Details
              </Link>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-2xl text-gray-500 font-medium">No jobs found matching your criteria.</p>
            <button 
              onClick={() => { setSearchTerm(""); setFilterType("All"); }}
              className="mt-4 text-emerald-400 hover:text-emerald-300 underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default Explore;