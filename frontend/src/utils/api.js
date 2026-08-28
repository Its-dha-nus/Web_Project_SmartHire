// frontend/src/utils/api.js

// Automatically switches between Render in production and localhost in development
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://smarthire-api-0djt.onrender.com";

export const apiFetch = async (endpoint, options = {}) => {
  // 1. Automatically grab the token
  const token = localStorage.getItem("token");

  // 2. Set up default headers (JSON + Auth)
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }), // Only add if token exists
    ...options.headers, // Allow overriding headers if needed
  };

  // 3. Make the fetch call using the base URL
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
};