import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const MyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  
  // NEW: State for Edit Mode
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setRole(payload.role);

      const response = await fetch("http://localhost:5000/api/profiles/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData(data); // Pre-fill the form with current data
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // NEW: Submit the updates to the backend
  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:5000/api/profiles/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setProfile(formData); // Update local UI state
        setIsEditing(false);  // Exit edit mode
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Failed to update profile.");
      }
    } catch (error) {
      toast.error("Error updating profile:", error);
    }
  };

  if (loading) return <div className="text-white text-center mt-20 text-xl">Loading profile...</div>;
  if (!profile) return <div className="text-white text-center mt-20 text-xl">Profile not found.</div>;

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-gray-800/40 border border-gray-700 rounded-3xl p-8 backdrop-blur-md shadow-2xl transition-all">
        
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8 border-b border-gray-700/50 pb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500 mb-2">
              {role === 'employer' ? profile.company_name : profile.full_name}
            </h1>
            <p className="text-gray-400 text-lg uppercase tracking-widest font-semibold">
              {role === 'employer' ? 'Employer Profile' : 'Seeker Profile'}
            </p>
          </div>
          
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="bg-gray-700/50 hover:bg-emerald-600/20 text-gray-300 hover:text-emerald-400 border border-gray-600 hover:border-emerald-500 font-semibold py-2 px-6 rounded-xl transition-all"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Conditional Rendering: Form vs View */}
        {isEditing ? (
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(formData).map(([key, value]) => {
                if (key.includes('_id') || key === 'created_at') return null;
                
                return (
                  <div key={key}>
                    <label className="block text-emerald-500/80 text-xs uppercase font-bold tracking-wider mb-2">
                      {key.replace(/_/g, ' ')}
                    </label>
                    <input
                      type="text"
                      name={key}
                      value={value || ""}
                      onChange={handleChange}
                      className="w-full bg-gray-900/50 border border-gray-600 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                );
              })}
            </div>
            
            <div className="flex gap-4 pt-6 border-t border-gray-700/50">
              <button 
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)]"
              >
                Save Changes
              </button>
              <button 
                type="button"
                onClick={() => {
                  setFormData(profile); // Reset form back to original data
                  setIsEditing(false);
                }}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Object.entries(profile).map(([key, value]) => {
              if (key.includes('_id') || key === 'created_at' || !value) return null;
              
              return (
                <div key={key} className="bg-gray-900/50 p-5 rounded-2xl border border-gray-700/50">
                  <p className="text-emerald-500/80 text-xs uppercase font-bold tracking-wider mb-1">
                    {key.replace(/_/g, ' ')}
                  </p>
                  <p className="text-gray-200 font-medium text-lg break-words">
                    {value}
                  </p>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
};

export default MyProfile;