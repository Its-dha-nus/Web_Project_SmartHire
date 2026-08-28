import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useParams, Link } from "react-router-dom";

const JobDetails = () => {
  const { id } = useParams(); // Grabs the job ID from the URL!
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  let userRole = null;
  const token = localStorage.getItem("token");
  if (token) {
    try {
      userRole = JSON.parse(atob(token.split('.')[1])).role;
    } catch (error) {
      toast.error("Error reading token");
    }
  }

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`https://smarthire-api-0djt.onrender.com/api/jobs/${id}`);
        const data = await response.json();
        
        if (response.ok) {
          setJob(data);
        } else {
          toast.error(`Error: ${data.message}`);
        }
      } catch (error) {
        toast.error("Error fetching job details:");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();

    const checkApplicationStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token) return; // If they aren't logged in, they haven't applied!

      try {
        // We reuse your existing dashboard route to get their history
        const response = await fetch("https://smarthire-api-0djt.onrender.com/api/jobs/seeker/dashboard", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (response.ok) {
          const applications = await response.json();
          // Check if this specific job's ID exists in their applications array
          // Note: 'id' comes from your useParams() hook at the top of the file
          const alreadyApplied = applications.some(app => app.job_id.toString() === id.toString());
          setHasApplied(alreadyApplied);
        }
      } catch (error) {
        console.error("Error checking status:", error);
      }
    };

    checkApplicationStatus();
  }, [id]);

  const handleApply = async () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      alert("Please log in to apply.");
      return;
    }

    try {
      // The ${id} comes from the useParams() at the top of your file
      const response = await fetch(`https://smarthire-api-0djt.onrender.com/api/jobs/${id}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("🎉 " + data.message);
        setHasApplied(true);
      } else {
        toast.error("Notice: " + data.message);
      }
    } catch (error) {
      toast.error("Error applying:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };


  if (loading) {
    return <div className="text-white text-center mt-20 text-xl">Loading job details...</div>;
  }

  if (!job) {
    return <div className="text-white text-center mt-20 text-xl">Job not found.</div>;
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/explore" className="text-blue-400 hover:text-blue-300 mb-6 inline-block transition-colors">
        &larr; Back to Explore
      </Link>

      <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700 rounded-3xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{job.title}</h1>
            <p className="text-xl text-blue-400 font-semibold">{job.company_name}</p>
          </div>
           {userRole !== 'employer' && (
            <button 
                onClick={handleApply}
                disabled={hasApplied}
                className={`w-full py-3 rounded-xl font-bold transition-all mt-6 ${
                  hasApplied 
                    ? "bg-gray-700/50 text-gray-400 border border-gray-600 cursor-not-allowed" 
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                    }`}
                    >
                  {hasApplied ? "Already Applied" : "Apply Now"}
            </button>
            )}
          </div>

        <div className="flex flex-wrap gap-4 mb-8">
          <span className="bg-gray-900/50 text-gray-300 py-1.5 px-4 rounded-lg border border-gray-600 text-sm">{job.location}</span>
          <span className="bg-gray-900/50 text-gray-300 py-1.5 px-4 rounded-lg border border-gray-600 text-sm">{job.job_type}</span>
          {job.salary && <span className="bg-green-900/30 text-green-400 py-1.5 px-4 rounded-lg border border-green-800 text-sm">{job.salary}</span>}
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-3">Job Description</h3>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{job.description}</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-3">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.required_skills.split(',').map((skill, index) => (
                <span key={index} className="bg-gray-700 text-gray-200 py-1 px-3 rounded-md text-sm">
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default JobDetails;