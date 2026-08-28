import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500 mb-4 tracking-tighter">
        404
      </h1>
      <h2 className="text-3xl font-bold text-white mb-6">
        Page Not Found
      </h2>
      <p className="text-xl text-gray-400 max-w-lg mx-auto mb-10 leading-relaxed">
        Oops! Looks like this page got lost in the application pile. Let's get you back to finding your dream job.
      </p>
      
      <Link 
        to="/" 
        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-10 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] text-lg"
      >
        Return Home
      </Link>
    </main>
  );
};

export default NotFound;