const JobCard = ({ title, company, type, location, salary }) => {
  return (
    <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(37,99,235,0.15)] transition-all duration-300 group flex flex-col justify-between h-full">
      
      {/* Top Section */}
      <div>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-100 group-hover:text-blue-400 transition-colors">
            {title}
          </h3>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {type}
          </span>
        </div>
        
        <p className="text-gray-400 font-medium mb-2">{company}</p>
        
        <div className="flex items-center text-sm text-gray-500 mb-6 space-x-4">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            {location}
          </span>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {salary}
          </span>
        </div>
      </div>

      {/* Bottom Section (Apply Button) */}
      <button className="w-full py-2.5 rounded-lg font-medium text-sm text-gray-300 bg-gray-700/50 hover:bg-blue-600 hover:text-white transition-colors duration-200">
        View Details
      </button>

    </div>
  );
};

export default JobCard;