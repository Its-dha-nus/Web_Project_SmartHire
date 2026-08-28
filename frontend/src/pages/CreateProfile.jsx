import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    company_name: "",
    whatsapp_number: "",
    description: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:5000/api/profiles/employer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Company Profile Created! You can now post jobs.");
        navigate("/post-job"); // Instantly teleport them back to the job form
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error creating profile:", error);
      alert("Failed to connect to the server.");
    }
  };

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Set Up Your Company</h2>
        <p className="text-gray-400">Create your employer profile to start hiring on SmartHire.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-800/40 backdrop-blur-md border border-gray-700 rounded-3xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.3)] space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
          <input 
            type="text" name="company_name" value={formData.company_name} onChange={handleChange} required
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="e.g. Tech Innovators Inc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">WhatsApp Contact Number</label>
          <input 
            type="text" name="whatsapp_number" value={formData.whatsapp_number} onChange={handleChange} required
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="e.g. +91 9876543210"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Company Description</label>
          <textarea 
            name="description" value={formData.description} onChange={handleChange} required rows="4"
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="Tell us about your company..."
          ></textarea>
        </div>
        <div className="pt-4">
          <button 
            type="submit" 
            className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all duration-200"
          >
            Create Employer Profile
          </button>
        </div>
      </form>
    </main>
  );
};

export default CreateProfile;