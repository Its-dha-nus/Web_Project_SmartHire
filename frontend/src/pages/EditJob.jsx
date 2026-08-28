import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    salary: "",
    location: "",
    job_type: "Full-Time"
  });

  // Fetch the existing job data to pre-fill the form
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/jobs/${id}`);
        if (response.ok) {
          const data = await response.json();
          setFormData({
            title: data.title || "",
            description: data.description || "",
            requirements: data.requirements || "",
            salary: data.salary || "",
            location: data.location || "",
            job_type: data.job_type || "Full-Time"
          });
        } else {
          toast.error("Failed to load job details.");
          navigate("/employer/dashboard");
        }
      } catch (error) {
        console.error("Error fetching job:", error);
        toast.error("Error connecting to server.");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`http://localhost:5000/api/jobs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success("Job updated successfully!");
        navigate("/employer/dashboard");
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to update job.");
      }
    } catch (error) {
      console.error("Error updating job:", error);
      toast.error("Server error while updating.");
    }
  };

  if (loading) return <div className="text-white text-center mt-20 text-xl">Loading job data...</div>;

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-6">
        <Link to="/employer/dashboard" className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-2 transition-colors">
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="bg-gray-800/40 border border-gray-700 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
        <h2 className="text-3xl font-extrabold text-white mb-8">Edit Job Posting</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 font-medium mb-2">Job Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required
                className="w-full bg-gray-900/50 border border-gray-600 text-white rounded-xl py-3 px-4 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
            </div>
            <div>
              <label className="block text-gray-300 font-medium mb-2">Job Type</label>
              <select name="job_type" value={formData.job_type} onChange={handleChange}
                className="w-full bg-gray-900/50 border border-gray-600 text-white rounded-xl py-3 px-4 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all">
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 font-medium mb-2">Location</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} required
                className="w-full bg-gray-900/50 border border-gray-600 text-white rounded-xl py-3 px-4 focus:border-emerald-500 transition-all" />
            </div>
            <div>
              <label className="block text-gray-300 font-medium mb-2">Salary (Optional)</label>
              <input type="text" name="salary" value={formData.salary} onChange={handleChange}
                className="w-full bg-gray-900/50 border border-gray-600 text-white rounded-xl py-3 px-4 focus:border-emerald-500 transition-all" />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-2">Job Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required rows="4"
              className="w-full bg-gray-900/50 border border-gray-600 text-white rounded-xl py-3 px-4 focus:border-emerald-500 transition-all"></textarea>
          </div>
          <div>
            <label className="block text-gray-300 font-medium mb-2">Requirements</label>
            <textarea name="requirements" value={formData.requirements} onChange={handleChange} required rows="4"
              className="w-full bg-gray-900/50 border border-gray-600 text-white rounded-xl py-3 px-4 focus:border-emerald-500 transition-all"></textarea>
          </div>

          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)]">
            Save Changes
          </button>
        </form>
      </div>
    </main>
  );
};

export default EditJob;