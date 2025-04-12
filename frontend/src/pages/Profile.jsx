import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaPhone, FaAddressCard, FaIdCard, FaCalendarAlt, FaVenusMars, FaUserMd, FaCamera, FaHistory, FaCalendar, FaPrescription, FaFileMedical, FaUserCircle } from 'react-icons/fa';
import api from '../api'; // Keep this import
import Navheader from '../Components/Navheader';

function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  // --- Fetch Profile Data Directly ---
  const fetchProfileData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the api instance directly
      const response = await api.get('/api/profile/'); 
      const data = response.data; // Extract data from response
      setProfileData(data);
      
      if (data.profile_picture_url) {
          // Construct full URL if the backend provides a relative path
          // Ensure the base URL is correctly determined
          let baseUrl = api.defaults.baseURL || ''; 
          if (baseUrl.endsWith('/api')) {
              baseUrl = baseUrl.replace('/api', '');
          } else if (baseUrl.endsWith('/api/')) {
              baseUrl = baseUrl.replace('/api/', '');
          }
          // Handle potential leading slash in profile_picture_url
          const imageUrl = data.profile_picture_url.startsWith('/') ? data.profile_picture_url : `/${data.profile_picture_url}`;
          setProfilePicPreview(baseUrl + imageUrl);
      } else {
          setProfilePicPreview(null); // Reset preview if no URL
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Could not load profile data.');
      console.error("Fetch Profile Error:", err.response || err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          setProfilePicFile(file);
          const reader = new FileReader();
          reader.onloadend = () => {
              setProfilePicPreview(reader.result);
          };
          reader.readAsDataURL(file);
      }
  };


  // --- Handle Save Directly ---
  const handleSave = async () => {
      setLoading(true);
      setError(null);
      
      // Construct FormData directly here
      const formData = new FormData();
      const dataToUpdate = { ...profileData };

      // Remove fields that shouldn't be sent if they are complex objects or derived URLs
      delete dataToUpdate.profile_picture_url; 
      delete dataToUpdate.user; // Assuming 'user' is an object from the backend
      delete dataToUpdate.id; // Don't send the profile ID back usually
      delete dataToUpdate.username; // Don't send username if read-only

      // Append fields to FormData
      for (const key in dataToUpdate) {
          // Skip null/undefined values unless it's explicitly allowed by backend for clearing fields
          if (dataToUpdate[key] !== null && dataToUpdate[key] !== undefined) {
              // Handle date objects correctly (format as YYYY-MM-DD)
              if (dataToUpdate[key] instanceof Date) {
                  formData.append(key, dataToUpdate[key].toISOString().split('T')[0]); 
              } else if (key === 'dob' && typeof dataToUpdate[key] === 'string' && dataToUpdate[key].includes('T')) {
                  // Handle if DOB is already a string from state but needs formatting
                  formData.append(key, dataToUpdate[key].split('T')[0]);
              }
              // Handle the profile picture file separately below
              else if (key !== 'profile_picture') { 
                  formData.append(key, dataToUpdate[key]);
              }
          }
      }

      // Append the profile picture file if a new one was selected
      if (profilePicFile instanceof File) {
          formData.append('profile_picture', profilePicFile);
      }
      
      try {
          // Use api instance directly for PATCH request
          const response = await api.patch('/api/profile/', formData, {
              headers: {
                  // Axios sets Content-Type to multipart/form-data automatically when FormData is used
                  // 'Content-Type': 'multipart/form-data', // Usually not needed with Axios and FormData
              },
          });
          
          setProfileData(response.data); // Update state with response from server
          if (response.data.profile_picture_url) { // Update preview based on new URL from server
             let baseUrl = api.defaults.baseURL || ''; 
             if (baseUrl.endsWith('/api')) { baseUrl = baseUrl.replace('/api', ''); }
             else if (baseUrl.endsWith('/api/')) { baseUrl = baseUrl.replace('/api/', ''); }
             const imageUrl = response.data.profile_picture_url.startsWith('/') ? response.data.profile_picture_url : `/${response.data.profile_picture_url}`;
             setProfilePicPreview(baseUrl + imageUrl);
          }
          setProfilePicFile(null); // Clear the staged file
          setIsEditing(false);
          alert('Profile updated successfully!');

      } catch (err) {
          // Attempt to parse specific errors from backend response
          let errorMessage = 'Failed to update profile. ';
          if (err.response && err.response.data) {
              const errors = err.response.data;
              // Convert Django REST Framework errors object to string
              errorMessage += Object.entries(errors).map(([field, messages]) => 
                  `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`
              ).join('; ');
          } else {
              errorMessage = err.message || errorMessage;
          }
          setError(errorMessage);
          console.error("Update Profile Error:", err.response || err);
          alert(`Error updating profile: ${errorMessage}`);
      } finally {
          setLoading(false);
      }
  };

  const triggerFileInput = () => {
      fileInputRef.current.click();
  };

  // --- Render Logic (remains the same) ---
  if (loading && !profileData) return <div className="flex justify-center items-center min-h-screen"><p className="text-xl text-[#77B254]">Loading Profile...</p></div>;
  if (error && !isEditing) return <div className="flex flex-col justify-center items-center min-h-screen"><p className="text-xl text-red-500">Error: {error}</p><button onClick={fetchProfileData} className="mt-4 px-4 py-2 bg-[#77B254] text-white rounded">Try Again</button></div>; // Show error outside edit mode
  if (!profileData && !loading) return <div className="flex justify-center items-center min-h-screen"><p className="text-xl text-gray-500">No profile data found.</p></div>;

  // Format date for input field (ensure profileData exists)
  const formattedDob = profileData?.dob ? new Date(profileData.dob).toISOString().split('T')[0] : '';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Button */}
      <div className="container mx-auto px-4 py-4">
        <button 
          onClick={() => window.location.href = '/'}
          className="flex items-center space-x-2 text-gray-600 hover:text-[#77B254] transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Home</span>
        </button>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar - Quick Stats */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-xl p-6 sticky top-8"
            >
              {/* Profile Picture and Basic Info */}
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <img 
                    src={profilePicPreview || `https://ui-avatars.com/api/?name=${profileData?.first_name || 'User'}+${profileData?.last_name || ''}&background=77B254&color=fff&size=128`} 
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" 
                  />
                  {isEditing && (
                    <button 
                      onClick={triggerFileInput}
                      className="absolute bottom-0 right-0 bg-[#77B254] text-white rounded-full p-2 hover:bg-green-600 transition duration-200 shadow-md"
                    >
                      <FaCamera />
                    </button>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                
                <h3 className="text-xl font-bold text-gray-800">{profileData?.first_name} {profileData?.last_name}</h3>
                <p className="text-gray-500 mb-4">
                  Patient ID: {profileData?.patient_id || 'N/A'}
                </p>
                
                {/* Quick Stats */}
                <div className="w-full space-y-4">
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <FaUserMd className="text-[#77B254] text-xl mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Patient Type</p>
                      <p className="font-semibold text-gray-800">{profileData?.patient_type || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <FaHistory className="text-blue-500 text-xl mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Last Visit</p>
                      <p className="font-semibold text-gray-800">2 weeks ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                    <FaCalendar className="text-purple-500 text-xl mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Next Appointment</p>
                      <p className="font-semibold text-gray-800">Not Scheduled</p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                    <FaIdCard className="text-yellow-500 text-xl mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Registration Date</p>
                      <p className="font-semibold text-gray-800">
                        {profileData?.created_at ? new Date(profileData.created_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-red-50 rounded-lg">
                    <FaUserMd className="text-red-500 text-xl mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Blood Group</p>
                      <p className="font-semibold text-gray-800">{profileData?.blood_group || 'Not Set'}</p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-indigo-50 rounded-lg">
                    <FaFileMedical className="text-indigo-500 text-xl mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Insurance Status</p>
                      <p className="font-semibold text-gray-800">{profileData?.insurance_status || 'Not Available'}</p>
                    </div>
                  </div>

                  {/* Add this divider and logout button */}
                  <div className="border-t border-gray-200 pt-4">
                    <button
                      onClick={() => {
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('refresh_token');
                        window.location.href = '/login';
                      }}
                      className="w-full p-3 bg-red-50 rounded-lg text-red-600 font-medium hover:bg-red-100 transition duration-300 flex items-center justify-center space-x-2"
                    >
                      <svg 
                        className="w-5 h-5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2" 
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                        />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#77B254] to-green-600 p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Personal Information</h2>
                    <p className="text-green-100">Manage your personal details and medical information</p>
                  </div>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-white text-[#77B254] rounded-lg font-medium hover:bg-green-50 transition duration-300"
                    >
                      Edit Profile
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Profile Content */}
              <div className="p-6">
                {error && isEditing && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">{error}</p>
                  </div>
                )}

                {/* Information Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Personal Details Card */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <FaUserCircle className="mr-2 text-[#77B254]" />
                      Personal Details
                    </h3>
                    <div className="space-y-4">
                      {/* Patient ID */}
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Patient ID</label>
                        <p className="mt-1 text-gray-800 font-semibold">{profileData?.patient_id || 'N/A'}</p>
                      </div>
                      {/* First Name & Last Name */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500">First Name</label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="first_name"
                              value={profileData?.first_name || ''}
                              onChange={handleInputChange}
                              className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-[#77B254] focus:border-[#77B254]"
                            />
                          ) : (
                            <p className="mt-1 text-gray-800">{profileData?.first_name || 'N/A'}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Last Name</label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="last_name"
                              value={profileData?.last_name || ''}
                              onChange={handleInputChange}
                              className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-[#77B254] focus:border-[#77B254]"
                            />
                          ) : (
                            <p className="mt-1 text-gray-800">{profileData?.last_name || 'N/A'}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Gender & DOB */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Gender</label>
                          {isEditing ? (
                            <select
                              name="gender"
                              value={profileData?.gender || ''}
                              onChange={handleInputChange}
                              className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-[#77B254] focus:border-[#77B254]"
                            >
                              <option value="">Select...</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          ) : (
                            <p className="mt-1 text-gray-800">{profileData?.gender || 'N/A'}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Date of Birth</label>
                          {isEditing ? (
                            <input
                              type="date"
                              name="dob"
                              value={formattedDob}
                              onChange={handleInputChange}
                              className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-[#77B254] focus:border-[#77B254]"
                            />
                          ) : (
                            <p className="mt-1 text-gray-800">
                              {profileData?.dob ? new Date(profileData.dob).toLocaleDateString() : 'N/A'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information Card */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <FaPhone className="mr-2 text-[#77B254]" />
                      Contact Information
                    </h3>
                    <div className="space-y-4">
                      {/* Email & Phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Email Address</label>
                        {isEditing ? (
                          <input
                            type="email"
                            name="email"
                            value={profileData?.email || ''}
                            onChange={handleInputChange}
                            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-[#77B254] focus:border-[#77B254]"
                          />
                        ) : (
                          <p className="mt-1 text-gray-800">{profileData?.email || 'N/A'}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                        {isEditing ? (
                          <input
                            type="tel"
                            name="phone"
                            value={profileData?.phone || ''}
                            onChange={handleInputChange}
                            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-[#77B254] focus:border-[#77B254]"
                          />
                        ) : (
                          <p className="mt-1 text-gray-800">{profileData?.phone || 'N/A'}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Address</label>
                        {isEditing ? (
                          <textarea
                            name="address"
                            value={profileData?.address || ''}
                            onChange={handleInputChange}
                            rows="3"
                            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-[#77B254] focus:border-[#77B254]"
                          />
                        ) : (
                          <p className="mt-1 text-gray-800 whitespace-pre-line">{profileData?.address || 'N/A'}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Medical Information Card */}
                  <div className="bg-gray-50 rounded-xl p-6 md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <FaFileMedical className="mr-2 text-[#77B254]" />
                      Medical Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Patient Type</label>
                        {isEditing ? (
                          <select
                            name="patient_type"
                            value={profileData?.patient_type || ''}
                            onChange={handleInputChange}
                            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-[#77B254] focus:border-[#77B254]"
                          >
                            <option value="TBE">To Be Entered</option>
                            <option value="outpatient">Outpatient</option>
                            <option value="inpatient">Inpatient</option>
                          </select>
                        ) : (
                          <p className="mt-1 text-gray-800">{profileData?.patient_type || 'N/A'}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Adhaar Number</label>
                        <p className="mt-1 text-gray-800">
                          {profileData?.adhaar_number ? `${profileData.adhaar_number.substring(0, 4)}********` : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Medical History Card */}
                  <div className="bg-gray-50 rounded-xl p-6 md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <FaFileMedical className="mr-2 text-[#77B254]" />
                      Medical History
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Blood Group</label>
                        {isEditing ? (
                          <select
                            name="blood_group"
                            value={profileData?.blood_group || ''}
                            onChange={handleInputChange}
                            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-[#77B254] focus:border-[#77B254]"
                          >
                            <option value="">Select Blood Group</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                          </select>
                        ) : (
                          <p className="mt-1 text-gray-800">{profileData?.blood_group || 'N/A'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500">Height (cm)</label>
                        {isEditing ? (
                          <input
                            type="number"
                            name="height"
                            value={profileData?.height || ''}
                            onChange={handleInputChange}
                            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-[#77B254] focus:border-[#77B254]"
                          />
                        ) : (
                          <p className="mt-1 text-gray-800">{profileData?.height ? `${profileData.height} cm` : 'N/A'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500">Weight (kg)</label>
                        {isEditing ? (
                          <input
                            type="number"
                            name="weight"
                            value={profileData?.weight || ''}
                            onChange={handleInputChange}
                            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-[#77B254] focus:border-[#77B254]"
                          />
                        ) : (
                          <p className="mt-1 text-gray-800">{profileData?.weight ? `${profileData.weight} kg` : 'N/A'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500">Emergency Contact</label>
                        {isEditing ? (
                          <input
                            type="tel"
                            name="emergency_contact"
                            value={profileData?.emergency_contact || ''}
                            onChange={handleInputChange}
                            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-[#77B254] focus:border-[#77B254]"
                          />
                        ) : (
                          <p className="mt-1 text-gray-800">{profileData?.emergency_contact || 'N/A'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500">Insurance Status</label>
                        {isEditing ? (
                          <select
                            name="insurance_status"
                            value={profileData?.insurance_status || ''}
                            onChange={handleInputChange}
                            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-[#77B254] focus:border-[#77B254]"
                          >
                            <option value="">Select Status</option>
                            <option value="Insured">Insured</option>
                            <option value="Not Insured">Not Insured</option>
                            <option value="Pending">Pending</option>
                          </select>
                        ) : (
                          <p className="mt-1 text-gray-800">{profileData?.insurance_status || 'N/A'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500">Insurance Number</label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="insurance_number"
                            value={profileData?.insurance_number || ''}
                            onChange={handleInputChange}
                            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-[#77B254] focus:border-[#77B254]"
                          />
                        ) : (
                          <p className="mt-1 text-gray-800">{profileData?.insurance_number || 'N/A'}</p>
                        )}
                      </div>
                    </div>

                    {/* Allergies and Medical Conditions */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Allergies</label>
                        {isEditing ? (
                          <textarea
                            name="allergies"
                            value={profileData?.allergies || ''}
                            onChange={handleInputChange}
                            rows="3"
                            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-[#77B254] focus:border-[#77B254]"
                            placeholder="List any allergies..."
                          />
                        ) : (
                          <p className="mt-1 text-gray-800 whitespace-pre-line">{profileData?.allergies || 'None reported'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500">Medical Conditions</label>
                        {isEditing ? (
                          <textarea
                            name="medical_conditions"
                            value={profileData?.medical_conditions || ''}
                            onChange={handleInputChange}
                            rows="3"
                            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-[#77B254] focus:border-[#77B254]"
                            placeholder="List any existing medical conditions..."
                          />
                        ) : (
                          <p className="mt-1 text-gray-800 whitespace-pre-line">{profileData?.medical_conditions || 'None reported'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setProfilePicFile(null);
                        fetchProfileData();
                      }}
                      disabled={loading}
                      className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="px-6 py-2 bg-gradient-to-r from-[#77B254] to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-[#77B254] transition duration-300"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Additional Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Recent Appointments Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaCalendar className="mr-2 text-[#77B254]" />
                  Recent Appointments
                </h3>
                <div className="text-center text-gray-500 py-8">
                  <p>No recent appointments</p>
                </div>
              </motion.div>

              {/* Prescriptions Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaPrescription className="mr-2 text-[#77B254]" />
                  Recent Prescriptions
                </h3>
                <div className="text-center text-gray-500 py-8">
                  <p>No recent prescriptions</p>
                </div>
              </motion.div>

              {/* Upcoming Appointments Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white rounded-xl shadow-lg p-6 md:col-span-2"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <FaCalendar className="mr-2 text-[#77B254]" />
                    Upcoming Appointments
                  </div>
                  <button className="text-sm text-[#77B254] hover:text-green-600 transition-colors duration-200">
                    Schedule New
                  </button>
                </h3>
                <div className="text-center text-gray-500 py-8">
                  <p>No upcoming appointments scheduled</p>
                  <button className="mt-4 text-[#77B254] hover:text-green-600 transition-colors duration-200">
                    View Appointment History
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;