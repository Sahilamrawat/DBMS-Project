import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';
import api from '../api';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!username || !password) {
      setError("Please enter both username and password");
      setLoading(false);
      return;
    }

    try {
      // Get tokens and user data
      const res = await api.post('/api/token/', { username, password });
      
      if (!res.data || !res.data.access) {
        setError("Invalid response from server");
        setLoading(false);
        return;
      }

      console.log('Login Response:', res.data); // Debug log
      
      // Store tokens and user data
      localStorage.setItem(ACCESS_TOKEN, res.data.access);
      localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
      
      if (res.data.user && res.data.user.user_type) {
        localStorage.setItem('user_type', res.data.user.user_type);
        console.log('User Type:', res.data.user.user_type); // Debug log
        
        // Navigate based on user type
        if (res.data.user.user_type === 'DOCTOR') {
          navigate('/');
        } else if (res.data.user.user_type === 'PATIENT') {
          navigate('/');
        } else {
          console.log('Unknown user type:', res.data.user.user_type); // Debug log
          navigate('/');
        }
      } else {
        console.log('No user type found in response'); // Debug log
        navigate('/');
      }
      
    } catch (error) {
      console.error('Login Error:', error); // Debug log
      if (error.response) {
        if (error.response.status === 401) {
          setError("Invalid username or password");
        } else {
          setError(error.response.data.detail || "An error occurred during login");
        }
      } else {
        setError("Network error. Please try again.");
      }
      // Clear any tokens if login fails
      localStorage.removeItem(ACCESS_TOKEN);
      localStorage.removeItem(REFRESH_TOKEN);
      localStorage.removeItem('user_type');
    } finally {
      setLoading(false);
    }
  };

  console.log("Google Client ID:", "618587580136-7cdf2g80k68vpb794o2halci2iq35ali.apps.googleusercontent.com");

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-64 h-64 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Login Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden relative z-10"
      >
        {/* Card Header */}
        <div className="bg-gradient-to-r from-[#77B254] to-green-600 p-6 text-center">
          <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
          <p className="text-green-100 mt-2">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Username Input */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="text-gray-400" />
              </div>
              <input
                type="text"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#77B254] focus:border-transparent"
                placeholder="Enter your username"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#77B254] focus:border-transparent"
                placeholder="Enter your password"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                disabled={loading}
              >
                {showPassword ? (
                  <FaEyeSlash className="text-gray-400 hover:text-gray-600" />
                ) : (
                  <FaEye className="text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#77B254] to-green-600 text-white py-3 px-4 rounded-xl font-medium
                     hover:from-green-600 hover:to-[#77B254] transition-all duration-300
                     focus:outline-none focus:ring-2 focus:ring-[#77B254] focus:ring-offset-2
                     disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-[#77B254] hover:text-green-600 font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>

          {/* Google Login Button */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Or sign in with Google
            </p>
          </div>

          <GoogleOAuthProvider clientId="618587580136-7cdf2g80k68vpb794o2halci2iq35ali.apps.googleusercontent.com">
            <GoogleLogin
              onSuccess={async credentialResponse => {
                console.log('Google onSuccess called', credentialResponse);
                try {
                  const res = await api.post('/api/google-login/', {
                    credential: credentialResponse.credential,
                  });
                  // Store JWT tokens and user info in localStorage
                  localStorage.setItem(ACCESS_TOKEN, res.data.access);
                  localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                  if (res.data.user && res.data.user.user_type) {
                    localStorage.setItem('user_type', res.data.user.user_type);
                  }
                  console.log('Google login success, about to redirect...');
                  window.location.href = '/';
                } catch (err) {
                  alert('Google login failed: ' + (err.response?.data?.error || err.message));
                }
              }}
              onError={() => {
                alert('Google Login Failed');
              }}
            />
          </GoogleOAuthProvider>
        </form>
      </motion.div>
    </div>
  );
}

export default Login;