import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState<string>("");
  const [error, setError] = useState<string>(""); // Add error state
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate username before making the API request
    if (!username.trim()) {
      setError("Please enter your username.");
      return;
    }

    if (typeof username !== "string") {
      setError("Username must be a string.");
      return;
    }

    setError("");

    try {
      const { data } = await axios.post("http://localhost:5000/api/login", { username });
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("userName", username);
      navigate("/home");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Main Nav */}
      <div className="bg-white py-4 shadow-md flex items-center justify-between">
        <h1 className="ml-8 text-center font-serif text-[30px] font-semibold leading-[35.13px] decoration-black">PicShare</h1>
        <button type="button" className="py-1 px-2 bg-[#1890FF] text-white rounded-sm mr-6">
          Log In
        </button>
      </div>

      {/* Main Content */}
      <div className="h-screen flex items-center justify-center py-8">
        <div className="max-w-md mx-auto p-8 bg-white">
          <h2 className="text-center mb-4 font-serif text-[30px] font-semibold leading-[35.13px] decoration-black">PicShare</h2>
          <h6 className="text-center text-xl font-semibold mb-4 text-gray-300">Login to start sharing</h6>
          {/* Login Form */}
          <form onSubmit={handleLogin}>
            <input
              type="text"
              className="w-full p-2 mb-4 border rounded-md"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            {/* Error message */}
            {error && <p className="text-red-500 text-sm mt-0 mb-2">{error}</p>}
            <button type="submit" className="py-1 mx-auto block px-4 bg-[#1890FF] text-white rounded-sm">
              Log In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
