import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast"; // <-- Added toast for premium notifications

const CreateSeekerProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: "",
    contact_number: "",
    skills: "",
    education: "",
    experience: "",
    bio: "",
    github_url: "",
    linkedin_url: "",
    is_student: false // <-- NEW: Added student toggle state
  });

  const handleChange = (e) => {
    // Checkboxes use 'checked' instead of 'value'
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("https://smarthire-api-0djt.onrender.com/api/profiles/seeker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Profile Created! Let's find you a job."); // Upgraded to toast
        navigate("/explore");
      } else {
        toast.error(`Error: ${data.message}`); // Upgraded to toast
      }
    } catch (error) {
      console.error("Error creating profile:", error);
      toast.error("Failed to connect to the server."); // Upgraded to toast
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Build Your Seeker Profile</h2>
        <p className="text-gray-400">Showcase your skills to top employers on SmartHire.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-800/40 backdrop-blur-md border border-gray-700 rounded-3xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.3)] space-y-6">
        
        {/* 2-Column Grid for basic info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
            <input 
              type="text" name="full_name" value={formData.full_name} onChange={handleChange} required
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="e.g. Jane Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Contact Number</label>
            <input 
              type="text" name="contact_number" value={formData.contact_number} onChange={handleChange} required
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="e.g. +91 9876543210"
            />
          </div>
        </div>

        {/* 2-Column Grid for links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">GitHub URL (Optional)</label>
            <input 
              type="url" name="github_url" value={formData.github_url} onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="https://github.com/yourusername"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn URL (Optional)</label>
            <input 
              type="url" name="linkedin_url" value={formData.linkedin_url} onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="https://linkedin.com/in/yourusername"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Top Skills (Comma separated)</label>
          <input 
            type="text" name="skills" value={formData.skills} onChange={handleChange} required
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="e.g. React, Node.js, UI/UX Design"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Education</label>
            <textarea 
              name="education" value={formData.education} onChange={handleChange} required rows="3"
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Your degree and university..."
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Experience</label>
            <textarea 
              name="experience" value={formData.experience} onChange={handleChange} required rows="3"
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Brief overview of your work history..."
            ></textarea>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">About Me (Bio)</label>
          <textarea 
            name="bio" value={formData.bio} onChange={handleChange} required rows="3"
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="Tell employers what makes you a great hire..."
          ></textarea>
        </div>

        {/* --- NEW STUDENT TOGGLE --- */}
        <div className="flex items-center gap-3 bg-gray-900/50 border border-gray-600 rounded-xl p-4 transition-all hover:border-emerald-500">
          <input 
            type="checkbox" 
            id="is_student"
            name="is_student"
            checked={formData.is_student}
            onChange={handleChange}
            className="w-5 h-5 text-emerald-500 bg-gray-800 border-gray-600 rounded focus:ring-emerald-500 focus:ring-2 cursor-pointer"
          />
          <label htmlFor="is_student" className="text-gray-300 font-medium cursor-pointer select-none">
            I am currently a student looking for internships
          </label>
        </div>

        <div className="pt-4">
          <button 
            type="submit" 
            className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all duration-200"
          >
            Complete My Profile
          </button>
        </div>
      </form>
    </main>
  );
};

export default CreateSeekerProfile;