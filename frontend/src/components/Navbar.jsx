import { Link } from "react-router-dom";

const Navbar = () => {
  // 1. Grab the token from storage
  const token = localStorage.getItem("token");
  let userRole = null;

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userRole = payload.role;
    } catch (error) {
      console.error("Invalid token");
    }
  }
  


  // 3. Handle Logout by clearing storage and forcing a reload to update the UI
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/"; // Redirects to home and clears React state
  };

  return (
    <nav className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* BRAND LOGO */}
          <Link to="/" className="text-2xl font-extrabold text-white tracking-tight">
            Smart<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">Hire.</span>
          </Link>

          {/* DYNAMIC MIDDLE LINKS */}
          <div className="flex items-center gap-6">
            <Link to="/explore" className="text-gray-300 hover:text-white transition-colors font-medium">
              Explore Jobs
            </Link>

            {/* ONLY show these if the user is an Employer */}
            {userRole === 'employer' && (
              <>
                <Link to="/employer/dashboard" className="text-gray-300 hover:text-white transition-colors font-medium">
                  Dashboard
                </Link>
                {userRole === "seeker" && (
                <Link 
                  to="/saved-jobs" 
                  className="text-gray-300 hover:text-emerald-400 font-medium transition-colors"
                >
                  Saved Jobs
                </Link>
                  )}
                <Link to="/post-job" className="text-gray-300 hover:text-white transition-colors font-medium">
                  Post a Job
                </Link>
              </>
            )}
            {/* ONLY show these if the user is a Seeker */}
            {userRole === 'seeker' && (
                <Link to="/seeker/dashboard" className="text-gray-300 hover:text-white transition-colors font-medium">
                  Dashboard
                </Link>
            )}
          </div>

          {/* AUTHENTICATION BUTTONS */}
          <div className="flex items-center gap-4">
            {token ? (
              // Logged IN View
              <>
                <Link to="/profile" className="text-gray-300 hover:text-emerald-400 font-medium transition-colors">
                  Profile
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-red-400 font-medium transition-colors"
                >
                  Log Out
                </button>
              </>
            ) : (
              // Logged OUT View
              <>
                <Link to="/login" className="text-gray-300 hover:text-white font-medium transition-colors">
                  Log In
                </Link>
                <Link to="/signup" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-5 rounded-lg transition-all shadow-[0_0_10px_rgba(37,99,235,0.3)]">
                  Sign Up
                </Link>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;