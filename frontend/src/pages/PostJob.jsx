import { useState } from "react";
import { useNavigate } from "react-router-dom";

const PostJob = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    job_type: "Full-time",
    salary: "",
    required_skills: "",
    description: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Grab the VIP wristband (token) from memory
    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must be logged in to post a job!");
      return;
    }
    
    try {
      // 2. Send the data AND the token to the backend
      const response = await fetch("https://smarthire-api-0djt.onrender.com/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // <--- The security token!
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Job posted successfully!");
        navigate("/explore"); 
      } else {
        alert(`Error: ${data.message}`); 
      }
    } catch (error) {
      console.error("Error posting job:", error);
      alert("Failed to connect to the server.");
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Post a New Job</h2>
        <p className="text-gray-400">Fill out the details below to attract top talent to your company.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-800/40 backdrop-blur-md border border-gray-700 rounded-3xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.3)] space-y-6">
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Job Title</label>
          <input 
            type="text" name="title" value={formData.title} onChange={handleChange} required
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="e.g. Senior React Developer"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Job Type</label>
            <select 
              name="job_type" value={formData.job_type} onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
            <input 
              type="text" name="location" value={formData.location} onChange={handleChange} required
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="e.g. Remote, or New York, NY"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Salary</label>
            <input 
              type="text" name="salary" value={formData.salary} onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="e.g. $80k - $100k"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Required Skills (Comma separated)</label>
          <input 
            type="text" name="required_skills" value={formData.required_skills} onChange={handleChange} required
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="e.g. React, Node.js, MySQL"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Job Description</label>
          <textarea 
            name="description" value={formData.description} onChange={handleChange} required rows="5"
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="Describe the role, responsibilities, and benefits..."
          ></textarea>
        </div>

        <div className="pt-4">
          <button 
            type="submit" 
            className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all duration-200"
          >
            Post Job to Explore Page
          </button>
        </div>
      </form>
    </main>
  );
};

export default PostJob;