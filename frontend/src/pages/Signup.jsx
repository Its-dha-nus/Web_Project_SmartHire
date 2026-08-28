import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const Signup = () => {
  // 1. Declare state hooks inside the component
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("seeker");


  const handleSignup = async (e) => {
    e.preventDefault();
    console.log("1. Button was clicked! Data:", { name, email, password });
    
    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Account created successfully!");
        // We can redirect them to login page here
      } else {
        toast.error(data.message || "Signup failed");
      }
    } catch (error) {
      toast.error("Error during signup:", error);
      toast.error("Something went wrong connecting to the server.");
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center items-center min-h-[calc(100vh-80px)]">
      <div className="w-full max-w-lg bg-gray-800/40 backdrop-blur-md border border-gray-700 rounded-3xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Create an account</h2>
          <p className="text-gray-400 text-sm">Join SmartHire to find your perfect role.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Jane Doe"
              required
            />
          </div>

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
            <label className="block text-sm font-medium text-gray-300 mb-2">I am a...</label>
            <select 
              name="role" 
              value={role} // Make sure you add 'role' to your state variables at the top!
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="seeker">Job Seeker</option>
              <option value="employer">Employer / Company</option>
            </select>
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
            className="w-full py-3.5 px-4 mt-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all duration-200"
          >
            Create Account
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Sign in here
          </Link>
        </p>
      </div>
    </main>
  );
};

export default Signup;