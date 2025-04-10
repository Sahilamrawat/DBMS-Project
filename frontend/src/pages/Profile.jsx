import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaPhone, FaAddressCard, FaIdCard, FaCalendarAlt, FaVenusMars, FaUserMd, FaCamera } from 'react-icons/fa';
import api from '../api'; // Keep this import

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
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50 flex items-center justify-center p-4 relative">
       {/* Background elements */}
       <div className="fixed inset-0 overflow-hidden -z-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-20 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          <div className="absolute bottom-0 right-20 w-96 h-96 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-6000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-3000"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
       </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden relative z-10 my-8"
      >
        {/* Card Header */}
        <div className="bg-gradient-to-r from-[#77B254] to-green-600 p-6 text-center relative">
          <h2 className="text-3xl font-bold text-white">Your Profile</h2>
          <p className="text-green-100 mt-1">Manage your personal information</p>
        </div>

        {/* Profile Content */}
        <div className="p-8">
           {/* Display Save Error Inline */}
           {error && isEditing && (
             <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                 <p><strong>Update Failed:</strong> {error}</p>
             </div>
           )}

          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <img 
                // Use default avatar if profileData is temporarily null during loading/error
                src={profilePicPreview || `https://ui-avatars.com/api/?name=${profileData?.first_name || 'User'}+${profileData?.last_name || ''}&background=77B254&color=fff&size=128`} 
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md bg-gray-200" // Added bg-gray-200 for loading state
              />
              {isEditing && (
                <button 
                  onClick={triggerFileInput}
                  className="absolute bottom-0 right-0 bg-[#77B254] text-white rounded-full p-2 hover:bg-green-600 transition duration-200 shadow-md"
                  aria-label="Change profile picture"
                >
                  <FaCamera />
                </button>
              )}
            </div>
            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden" 
            />
            {!isEditing && profileData && (
                <h3 className="text-2xl font-semibold mt-4 text-gray-800">{profileData.first_name} {profileData.last_name}</h3>
            )}
            {/* Check profileData.user before accessing username */}
            {profileData?.user?.username && <p className="text-gray-500">@{profileData.user.username}</p>} 
          </div>

          {/* Profile Details Form/Display - Ensure profileData exists before accessing properties */}
          {profileData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* First Name */}
                <div className="flex items-center space-x-3">
                  <FaUser className="text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500">First Name</label>
                    {isEditing ? (
                      <input type="text" name="first_name" value={profileData.first_name || ''} onChange={handleInputChange} className="w-full p-2 border-b border-gray-300 focus:border-[#77B254] focus:outline-none" />
                    ) : (
                      <p className="text-gray-800">{profileData.first_name || 'N/A'}</p>
                    )}
                  </div>
                </div>

                {/* Last Name */}
                <div className="flex items-center space-x-3">
                  <FaUser className="text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500">Last Name</label>
                    {isEditing ? (
                      <input type="text" name="last_name" value={profileData.last_name || ''} onChange={handleInputChange} className="w-full p-2 border-b border-gray-300 focus:border-[#77B254] focus:outline-none" />
                    ) : (
                      <p className="text-gray-800">{profileData.last_name || 'N/A'}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                 <div className="flex items-center space-x-3">
                  <FaEnvelope className="text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500">Email</label>
                    {isEditing ? (
                        <input type="email" name="email" value={profileData.email || ''} onChange={handleInputChange} className="w-full p-2 border-b border-gray-300 focus:border-[#77B254] focus:outline-none" />
                    ) : (
                        <p className="text-gray-800">{profileData.email || 'N/A'}</p>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center space-x-3">
                  <FaPhone className="text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500">Phone</label>
                    {isEditing ? (
                      <input type="tel" name="phone" value={profileData.phone || ''} onChange={handleInputChange} className="w-full p-2 border-b border-gray-300 focus:border-[#77B254] focus:outline-none" />
                    ) : (
                      <p className="text-gray-800">{profileData.phone || 'N/A'}</p>
                    )}
                  </div>
                </div>
                
                 {/* Adhaar Number */}
                <div className="flex items-center space-x-3">
                  <FaIdCard className="text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500">Adhaar Number</label>
                     {/* Adhaar is often sensitive and might not be editable */}
                     <p className="text-gray-800">{profileData.adhaar_number ? `${profileData.adhaar_number.substring(0, 4)}********` : 'N/A'}</p>
                  </div>
                </div>

                 {/* Date of Birth */}
                <div className="flex items-center space-x-3">
                  <FaCalendarAlt className="text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500">Date of Birth</label>
                    {isEditing ? (
                        <input type="date" name="dob" value={formattedDob} onChange={handleInputChange} className="w-full p-2 border-b border-gray-300 focus:border-[#77B254] focus:outline-none" />
                    ) : (
                        <p className="text-gray-800">{profileData.dob ? new Date(profileData.dob).toLocaleDateString() : 'N/A'}</p>
                    )}
                  </div>
                </div>

                {/* Gender */}
                <div className="flex items-center space-x-3">
                  <FaVenusMars className="text-gray-400" />
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500">Gender</label>
                     {isEditing ? (
                        <select name="gender" value={profileData.gender || ''} onChange={handleInputChange} className="w-full p-2 border-b border-gray-300 focus:border-[#77B254] focus:outline-none bg-white">
                            <option value="">Select...</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                     ) : (
                        <p className="text-gray-800">{profileData.gender || 'N/A'}</p>
                     )}
                  </div>
                </div>

                {/* Patient Type */}
                <div className="flex items-center space-x-3">
                   <FaUserMd className="text-gray-400" /> {/* Example icon */}
                   <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500">Patient Type</label>
                     {isEditing ? (
                        <select name="patient_type" value={profileData.patient_type || ''} onChange={handleInputChange} className="w-full p-2 border-b border-gray-300 focus:border-[#77B254] focus:outline-none bg-white">
                            <option value="TBE">To Be Entered</option> 
                            <option value="outpatient">Outpatient</option>
                            <option value="inpatient">Inpatient</option>
                            {/* Add other types if needed */}
                        </select>
                     ) : (
                        <p className="text-gray-800">{profileData.patient_type || 'N/A'}</p>
                     )}
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start space-x-3 md:col-span-2">
                  <FaAddressCard className="text-gray-400 mt-1" />
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500">Address</label>
                    {isEditing ? (
                      <textarea name="address" value={profileData.address || ''} onChange={handleInputChange} rows="3" className="w-full p-2 border border-gray-300 rounded-md focus:border-[#77B254] focus:outline-none focus:ring-1 focus:ring-[#77B254]"></textarea>
                    ) : (
                      <p className="text-gray-800 whitespace-pre-line">{profileData.address || 'N/A'}</p>
                    )}
                  </div>
                </div>
              </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex justify-end space-x-4">
             {isEditing ? (
                 <>
                    <button
                        onClick={() => { 
                            setIsEditing(false); 
                            // Reset preview and file stage on cancel
                            setProfilePicFile(null); 
                            fetchProfileData(); // Re-fetch original data
                        }}
                        disabled={loading}
                        className="py-2 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="py-2 px-6 bg-gradient-to-r from-[#77B254] to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-[#77B254] transition duration-300 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                 </>
             ) : (
                <button
                    onClick={() => { 
                        setError(null); // Clear any previous errors when entering edit mode
                        setIsEditing(true); 
                    }}
                    className="py-2 px-6 bg-gradient-to-r from-[#77B254] to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-[#77B254] transition duration-300"
                >
                    Edit Profile
                </button>
             )}
          </div>
        </div>
      </motion.div>
      {/* Style element */}
       <style jsx global>{`
         .bg-grid-pattern {
           background-image: linear-gradient(rgba(0, 128, 0, 0.05) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(0, 128, 0, 0.05) 1px, transparent 1px);
           background-size: 20px 20px;
         }
         @keyframes blob { 0% { transform: scale(1); } 33% { transform: scale(1.1); } 66% { transform: scale(0.9); } 100% { transform: scale(1); } }
         .animate-blob { animation: blob 7s infinite alternate; }
         .animation-delay-2000 { animation-delay: 2s; }
         .animation-delay-3000 { animation-delay: 3s; }
         .animation-delay-4000 { animation-delay: 4s; }
         .animation-delay-6000 { animation-delay: 6s; }
       `}</style>
    </div>
  );
}

export default Profile;