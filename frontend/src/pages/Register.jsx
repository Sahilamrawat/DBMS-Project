import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaEnvelope, FaPhone, FaAddressCard, FaIdCard, FaCalendarAlt, FaVenusMars, FaUserMd, FaStethoscope } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';
import api from '../api';

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userType, setUserType] = useState('PATIENT');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    user_type: 'PATIENT',
    // Patient specific fields
    adhaar_number: '',
    patient_type: 'outpatient',
    dob: '',
    gender: '',
    address: '',
    phone: '',
    // Doctor specific fields
    specialization: 'GENERAL',
    consultation_fee: 500
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Validate form data
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!formData.username || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/api/user/register/', {
        ...formData,
        user_type: userType
      });
  
      if (res.data.message === 'User registered successfully') {
        navigate('/login');
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (error) {
      if (error.response) {
        setError(error.response.data.error || 'Registration failed. Please try again.');
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
    setFormData({
      ...formData,
      user_type: type
    });
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-green-50 via-white to-green-50 flex items-center justify-center p-4 relative">
      {/* Enhanced Background Elements */}
      <div className="fixed inset-0 overflow-hidden">
        {/* Left top blob */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        
        {/* Right top blob */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        
        {/* Left bottom blob */}
        <div className="absolute bottom-0 left-20 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        
        {/* Right bottom blob */}
        <div className="absolute bottom-0 right-20 w-96 h-96 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-6000"></div>
        
        {/* Center blob */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-3000"></div>
        
        {/* Subtle patterns */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      </div>

      {/* Registration Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden relative z-10 my-8"
      >
        {/* Card Header */}
        <div className="bg-gradient-to-r from-[#77B254] to-green-600 p-6 text-center">
          <h2 className="text-3xl font-bold text-white">Create Account</h2>
          <p className="text-green-100 mt-2">Join our healthcare community</p>
        </div>

        {/* User Type Selection */}
        <div className="p-4 border-b">
          <div className="flex justify-center space-x-4">
            <button
              type="button"
              onClick={() => handleUserTypeChange('PATIENT')}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                userType === 'PATIENT'
                  ? 'bg-[#77B254] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaUser className="inline-block mr-2" />
              Patient
            </button>
            <button
              type="button"
              onClick={() => handleUserTypeChange('DOCTOR')}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                userType === 'DOCTOR'
                  ? 'bg-[#77B254] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaUserMd className="inline-block mr-2" />
              Doctor
            </button>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Account Information */}
            <div className="col-span-2">
              <h3 className="text-xl font-semibold text-gray-700 mb-3">Account Information</h3>
            </div>
            
            {/* Username Input */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Username *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#77B254] focus:border-transparent"
                  placeholder="Choose a username"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#77B254] focus:border-transparent"
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#77B254] focus:border-transparent"
                  placeholder="Create a password"
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

            {/* Confirm Password Input */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#77B254] focus:border-transparent"
                  placeholder="Confirm your password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash className="text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FaEye className="text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Personal Information */}
            <div className="col-span-2 mt-4">
              <h3 className="text-xl font-semibold text-gray-700 mb-3">Personal Information</h3>
            </div>

            {/* First Name */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                First Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#77B254] focus:border-transparent"
                  placeholder="Enter your first name"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Last Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#77B254] focus:border-transparent"
                  placeholder="Enter your last name"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Date of Birth
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendarAlt className="text-gray-400" />
                </div>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#77B254] focus:border-transparent"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Gender
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaVenusMars className="text-gray-400" />
                </div>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#77B254] focus:border-transparent"
                  disabled={loading}
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div className="col-span-2">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Address
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 flex items-center pointer-events-none">
                  <FaAddressCard className="text-gray-400" />
                </div>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#77B254] focus:border-transparent"
                  placeholder="Enter your address"
                  rows="3"
                  disabled={loading}
                ></textarea>
              </div>
            </div>

            {/* Phone Number */}
            <div className="col-span-2">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#77B254] focus:border-transparent"
                  placeholder="Enter your phone number"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Patient Specific Fields */}
            {userType === 'PATIENT' && (
              <>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Aadhaar Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaIdCard className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="adhaar_number"
                      value={formData.adhaar_number}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#77B254] focus:border-transparent"
                      placeholder="Enter your Aadhaar number"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Patient Type
                  </label>
                  <div className="relative">
                    <select
                      name="patient_type"
                      value={formData.patient_type}
                      onChange={handleChange}
                      className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#77B254] focus:border-transparent"
                      disabled={loading}
                    >
                      <option value="outpatient">Outpatient</option>
                      <option value="inpatient">Inpatient</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Doctor Specific Fields */}
            {userType === 'DOCTOR' && (
              <>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Specialization
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaStethoscope className="text-gray-400" />
                    </div>
                    <select
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#77B254] focus:border-transparent"
                      disabled={loading}
                    >
                      <option value="GENERAL">General Physician</option>
                      <option value="CARDIOLOGIST">Cardiologist</option>
                      <option value="DERMATOLOGIST">Dermatologist</option>
                      <option value="NEUROLOGIST">Neurologist</option>
                      <option value="PEDIATRICIAN">Pediatrician</option>
                      <option value="PSYCHIATRIST">Psychiatrist</option>
                      <option value="ORTHOPEDIC">Orthopedic Surgeon</option>
                      <option value="GYNECOLOGIST">Gynecologist</option>
                      <option value="OPHTHALMOLOGIST">Ophthalmologist</option>
                      <option value="ENT">ENT Specialist</option>
                      <option value="GASTROENTEROLOGIST">Gastroenterologist</option>
                      <option value="ENDOCRINOLOGIST">Endocrinologist</option>
                      <option value="NEPHROLOGIST">Nephrologist</option>
                      <option value="UROLOGIST">Urologist</option>
                      <option value="PULMONOLOGIST">Pulmonologist</option>
                      <option value="RHEUMATOLOGIST">Rheumatologist</option>
                      <option value="HEMATOLOGIST">Hematologist</option>
                      <option value="ONCOLOGIST">Oncologist</option>
                      <option value="ALLERGIST">Allergist</option>
                      <option value="INFECTIOUS_DISEASE">Infectious Disease Specialist</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Consultation Fee
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">₹</span>
                    </div>
                    <input
                      type="number"
                      name="consultation_fee"
                      value={formData.consultation_fee}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#77B254] focus:border-transparent"
                      placeholder="Enter consultation fee"
                      min="0"
                      disabled={loading}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#77B254] to-green-600 text-white py-3 px-4 rounded-xl font-medium
                       hover:from-green-600 hover:to-[#77B254] transition-all duration-300
                       focus:outline-none focus:ring-2 focus:ring-[#77B254] focus:ring-offset-2
                       disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-[#77B254] hover:text-green-600 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
      
      {/* Add this style element for the grid pattern */}
      <style jsx global>{`
        .bg-grid-pattern {
          background-image: linear-gradient(rgba(0, 128, 0, 0.05) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0, 128, 0, 0.05) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        
        @keyframes blob {
          0% { transform: scale(1); }
          33% { transform: scale(1.1); }
          66% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        
        .animate-blob {
          animation: blob 7s infinite alternate;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animation-delay-6000 {
          animation-delay: 6s;
        }
      `}</style>
    </div>
  );
}

export default Register;