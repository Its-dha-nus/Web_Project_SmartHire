import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // This hook lets us programmatically change pages
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch("https://smarthire-api-0djt.onrender.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {

        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        // We use the name returned from the backend in our alert!
        toast.success(`Welcome back, ${data.user.name}!`);

       // THE NEW TRAFFIC COP (Hard Redirects)
        if (data.user.role === 'employer' && !data.hasProfile) {
            window.location.href = "/create-profile";
        } else if (data.user.role === 'seeker' && !data.hasProfile) {
            window.location.href = "/create-seeker-profile"; 
        } else {
            window.location.href = "/explore";
        }
        // Instantly redirect them to the jobs board
      } else {
        toast.error(data.message || "Invalid credentials");
      }
    } catch (error) {
      toast.error("Error during login:", error);
      toast.error("Something went wrong connecting to the server.");
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex justify-center items-center h-[calc(100vh-80px)]">
      <div className="w-full max-w-md bg-gray-800/40 backdrop-blur-md border border-gray-700 rounded-3xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
          <p className="text-gray-400 text-sm">Enter your credentials to access your account.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all duration-200"
          >
            Sign In
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Sign up here
          </Link>
        </p>
      </div>
    </main>
  );
};

export default Login;