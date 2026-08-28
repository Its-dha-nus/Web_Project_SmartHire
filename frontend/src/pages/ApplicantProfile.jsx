import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";

const ApplicantProfile = () => {
  const { applicationId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`https://smarthire-api-0djt.onrender.com/api/profiles/applicant/${applicationId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else {
          toast.error("Failed to load applicant profile");
        }
      } catch (error) {
        console.error("Error fetching applicant:", error);
        toast.error("Error connecting to server");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [applicationId]);

  if (loading) return <div className="text-white text-center mt-20 text-xl">Loading applicant data...</div>;
  if (!profile) return <div className="text-white text-center mt-20 text-xl">Profile not found.</div>;

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-6">
        <Link to="/employer/dashboard" className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-2 transition-colors">
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="bg-gray-800/40 border border-gray-700 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
        <div className="border-b border-gray-700/50 pb-8 mb-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500 mb-2">
            {profile.full_name}
            {profile.is_student === 1 && (
    <span className="text-sm bg-blue-900/40 text-blue-400 border border-blue-700/50 px-3 py-1 rounded-full tracking-widest uppercase font-bold">
      Student
    </span>
  )}
          </h1>
          <p className="text-gray-400 text-lg uppercase tracking-widest font-semibold">
            Applicant Profile
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Object.entries(profile).map(([key, value]) => {
            if (key.includes('_id') || key === 'created_at' || !value) return null;
            
            // Make URLs clickable
            const isUrl = value.toString().startsWith('http');
            
            return (
              <div key={key} className="bg-gray-900/50 p-5 rounded-2xl border border-gray-700/50">
                <p className="text-emerald-500/80 text-xs uppercase font-bold tracking-wider mb-1">
                  {key.replace(/_/g, ' ')}
                </p>
                {isUrl ? (
                  <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 font-medium text-lg break-words underline">
                    {value}
                  </a>
                ) : (
                  <p className="text-gray-200 font-medium text-lg break-words">
                    {value}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default ApplicantProfile;