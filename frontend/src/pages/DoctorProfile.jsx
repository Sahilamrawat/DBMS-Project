import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaPhone, FaAddressCard, FaIdCard, FaCalendarAlt, FaUserMd, FaCamera, FaHistory, FaCalendar, FaPrescription, FaFileMedical, FaUserCircle, FaClock, FaMoneyBillAlt, FaHome, FaSpinner } from 'react-icons/fa';
import api from '../api';
import { useNavigate } from 'react-router-dom';

function DoctorProfile() {
  const navigate = useNavigate();
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

  const handleBackToHome = () => {
    navigate('/');
  };

  const fetchProfileData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/api/profile/');
      const data = response.data;
      
      // Combine all relevant data
      const combinedProfileData = {
        // User data
        ...data.user,
        // Profile data
        ...data.profile,
        // Doctor data if exists
        ...(data.doctor || {}),
        // Add appointments data with proper date formatting
        appointments: (data.appointments || []).map(apt => ({
          ...apt,
          appointment_date: apt.appointment_date ? new Date(apt.appointment_date).toISOString() : null,
          created_at: apt.created_at ? new Date(apt.created_at).toISOString() : null,
          updated_at: apt.updated_at ? new Date(apt.updated_at).toISOString() : null
        })),
        // Add any additional fields that should be displayed
        first_name: data.user.first_name,
        last_name: data.user.last_name,
        email: data.user.email,
        username: data.user.username,
        // Format dates if they exist
        date_joined: data.user.date_joined ? new Date(data.user.date_joined).toISOString() : null,
        last_login: data.user.last_login ? new Date(data.user.last_login).toISOString() : null,
        date_of_birth: data.profile.date_of_birth ? new Date(data.profile.date_of_birth).toISOString() : null,
        // Format doctor-specific dates
        available_days: data.doctor?.available_days ? JSON.parse(data.doctor.available_days) : [],
        available_hours_start: data.doctor?.available_hours_start || '',
        available_hours_end: data.doctor?.available_hours_end || '',
        is_available: data.doctor?.is_available || false,
        specialization: data.doctor?.specialization || '',
        consultation_fee: data.doctor?.consultation_fee || 0,
        experience_years: data.doctor?.experience_years || 0,
        qualifications: data.doctor?.qualifications || ''
      };
      
      setProfileData(combinedProfileData);
      
      if (data.profile.profile_picture_url) {
        let baseUrl = api.defaults.baseURL || '';
        if (baseUrl.endsWith('/api')) {
          baseUrl = baseUrl.replace('/api', '');
        } else if (baseUrl.endsWith('/api/')) {
          baseUrl = baseUrl.replace('/api/', '');
        }
        const imageUrl = data.profile.profile_picture_url.startsWith('/') ? data.profile.profile_picture_url : `/${data.profile.profile_picture_url}`;
        setProfilePicPreview(baseUrl + imageUrl);
      }
      console.log('Doctor Profile Data:', combinedProfileData);
    } catch (err) {
      console.error("Full error object:", err);
      setError(err.response?.data?.error || err.response?.data?.detail || err.message || 'Could not load profile data.');
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

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    const dataToUpdate = { ...profileData };

    delete dataToUpdate.profile_picture_url;
    delete dataToUpdate.user;
    delete dataToUpdate.id;
    delete dataToUpdate.username;

    for (const key in dataToUpdate) {
      if (dataToUpdate[key] !== null && dataToUpdate[key] !== undefined) {
        formData.append(key, dataToUpdate[key]);
      }
    }

    if (profilePicFile instanceof File) {
      formData.append('profile_picture', profilePicFile);
    }
    
    try {
      const response = await api.patch('/api/profile/', formData);
      setProfileData(response.data.profile);
      if (response.data.profile.profile_picture_url) {
        let baseUrl = api.defaults.baseURL || '';
        if (baseUrl.endsWith('/api')) baseUrl = baseUrl.replace('/api', '');
        else if (baseUrl.endsWith('/api/')) baseUrl = baseUrl.replace('/api/', '');
        const imageUrl = response.data.profile.profile_picture_url.startsWith('/') ? response.data.profile.profile_picture_url : `/${response.data.profile.profile_picture_url}`;
        setProfilePicPreview(baseUrl + imageUrl);
      }
      setProfilePicFile(null);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      let errorMessage = 'Failed to update profile. ';
      if (err.response?.data) {
        const errors = err.response.data;
        errorMessage += Object.entries(errors).map(([field, messages]) => 
          `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`
        ).join('; ');
      } else {
        errorMessage = err.message || errorMessage;
      }
      setError(errorMessage);
      alert(`Error updating profile: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profileData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 via-white to-gray-50">
        <div className="text-center">
          <FaSpinner className="text-6xl text-[#77B254] animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Loading Profile...</h2>
          <p className="text-gray-600 mt-2">Please wait while we fetch your profile data</p>
        </div>
      </div>
    );
  }
  
  if (error && !isEditing) return <div className="flex flex-col justify-center items-center min-h-screen"><p className="text-xl text-red-500">Error: {error}</p><button onClick={fetchProfileData} className="mt-4 px-4 py-2 bg-[#77B254] text-white rounded">Try Again</button></div>;
  if (!profileData && !loading) return <div className="flex justify-center items-center min-h-screen"><p className="text-xl text-gray-500">No profile data found.</p></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 pt-10">
        {/* Back to Home Button */}
        <div className="mb-6">
          <button 
            onClick={handleBackToHome}
            className="flex items-center px-4 py-2 bg-[#77B254] text-white rounded-full shadow-lg hover:bg-green-600 transition-all duration-300"
          >
            <FaHome className="mr-2" />
            Back to Home
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Doctor Info */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-xl p-6 sticky top-8"
            >
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <img 
                    src={profilePicPreview || `https://ui-avatars.com/api/?name=${profileData?.first_name || 'Doctor'}+${profileData?.last_name || ''}&background=77B254&color=fff&size=128`} 
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" 
                  />
                  {isEditing && (
                    <button 
                      onClick={() => fileInputRef.current.click()}
                      className="absolute bottom-0 right-0 bg-[#77B254] text-white rounded-full p-2 hover:bg-green-600 transition duration-200 shadow-md"
                    >
                      <FaCamera />
                    </button>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                
                <h3 className="text-xl font-bold text-gray-800">Dr. {profileData?.first_name} {profileData?.last_name}</h3>
                <p className="text-gray-500 mb-4">
                  Doctor ID: {profileData?.doctor_id || 'N/A'}
                </p>

                {/* Quick Stats */}
                <div className="w-full space-y-4">
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <FaUserMd className="text-[#77B254] text-xl mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Specialization</p>
                      <p className="font-semibold text-gray-800">{profileData?.specialization || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <FaHistory className="text-blue-500 text-xl mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Experience</p>
                      <p className="font-semibold text-gray-800">{profileData?.experience_years || '0'} years</p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                    <FaClock className="text-purple-500 text-xl mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Availability</p>
                      <p className="font-semibold text-gray-800">{profileData?.is_available ? 'Available' : 'Not Available'}</p>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                    <FaMoneyBillAlt className="text-yellow-500 text-xl mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Consultation Fee</p>
                      <p className="font-semibold text-gray-800">₹{profileData?.consultation_fee || '0'}</p>
                    </div>
                  </div>

                  {/* Logout Button */}
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
                    <h2 className="text-2xl font-bold text-white">Doctor Profile</h2>
                    <p className="text-green-100">Manage your professional details and schedule</p>
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

                {/* Professional Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <FaUserMd className="mr-2 text-[#77B254]" />
                      Professional Details
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Specialization</label>
                        {isEditing ? (
                          <select
                            name="specialization"
                            value={profileData?.specialization || ''}
                            onChange={handleInputChange}
                            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-[#77B254] focus:border-[#77B254]"
                          >
                            <option value="">Select Specialization</option>
                            <option value="Cardiologist">Cardiologist</option>
                            <option value="Dermatologist">Dermatologist</option>
                            <option value="Neurologist">Neurologist</option>
                            <option value="Pediatrician">Pediatrician</option>
                            <option value="Orthopedic">Orthopedic</option>
                            <option value="Psychiatrist">Psychiatrist</option>
                            <option value="General Physician">General Physician</option>
                          </select>
                        ) : (
                          <p className="mt-1 text-gray-800">{profileData?.specialization || 'N/A'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500">Qualifications</label>
                        {isEditing ? (
                          <textarea
                            name="qualifications"
                            value={profileData?.qualifications || ''}
                            onChange={handleInputChange}
                            rows="3"
                            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-[#77B254] focus:border-[#77B254]"
                          />
                        ) : (
                          <p className="mt-1 text-gray-800">{profileData?.qualifications || 'N/A'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500">Experience (Years)</label>
                        {isEditing ? (
                          <input
                            type="number"
                            name="experience_years"
                            value={profileData?.experience_years || ''}
                            onChange={handleInputChange}
                            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-[#77B254] focus:border-[#77B254]"
                          />
                        ) : (
                          <p className="mt-1 text-gray-800">{profileData?.experience_years || '0'} years</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500">Consultation Fee (₹)</label>
                        {isEditing ? (
                          <input
                            type="number"
                            name="consultation_fee"
                            value={profileData?.consultation_fee || ''}
                            onChange={handleInputChange}
                            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-[#77B254] focus:border-[#77B254]"
                          />
                        ) : (
                          <p className="mt-1 text-gray-800">₹{profileData?.consultation_fee || '0'}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Schedule Information */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <FaCalendar className="mr-2 text-[#77B254]" />
                      Schedule Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Available Days</label>
                        {isEditing ? (
                          <div className="mt-1 space-y-2">
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                              <label key={day} className="flex items-center">
                                <input
                                  type="checkbox"
                                  name="available_days"
                                  value={day}
                                  checked={(profileData?.available_days || []).includes(day)}
                                  onChange={(e) => {
                                    const days = profileData?.available_days || [];
                                    const newDays = e.target.checked
                                      ? [...days, day]
                                      : days.filter(d => d !== day);
                                    handleInputChange({
                                      target: { name: 'available_days', value: newDays }
                                    });
                                  }}
                                  className="rounded border-gray-300 text-[#77B254] focus:ring-[#77B254]"
                                />
                                <span className="ml-2">{day}</span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-1 text-gray-800">
                            {(profileData?.available_days || []).join(', ') || 'No days set'}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500">Available Hours</label>
                        {isEditing ? (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs text-gray-500">Start Time</label>
                              <input
                                type="time"
                                name="available_hours_start"
                                value={profileData?.available_hours_start || ''}
                                onChange={handleInputChange}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-[#77B254] focus:border-[#77B254]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500">End Time</label>
                              <input
                                type="time"
                                name="available_hours_end"
                                value={profileData?.available_hours_end || ''}
                                onChange={handleInputChange}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-[#77B254] focus:border-[#77B254]"
                              />
                            </div>
                          </div>
                        ) : (
                          <p className="mt-1 text-gray-800">
                            {profileData?.available_hours_start && profileData?.available_hours_end
                              ? `${profileData.available_hours_start} - ${profileData.available_hours_end}`
                              : 'No hours set'}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500">Availability Status</label>
                        {isEditing ? (
                          <select
                            name="is_available"
                            value={profileData?.is_available ? 'true' : 'false'}
                            onChange={(e) => handleInputChange({
                              target: {
                                name: 'is_available',
                                value: e.target.value === 'true'
                              }
                            })}
                            className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-[#77B254] focus:border-[#77B254]"
                          >
                            <option value="true">Available</option>
                            <option value="false">Not Available</option>
                          </select>
                        ) : (
                          <p className="mt-1 text-gray-800">
                            {profileData?.is_available ? 'Available' : 'Not Available'}
                          </p>
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
              {/* Upcoming Appointments */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaCalendar className="mr-2 text-[#77B254]" />
                  Upcoming Appointments
                </h3>
                {profileData?.appointments && profileData.appointments.length > 0 ? (
                  <div className="space-y-4">
                    {profileData.appointments
                      .filter(apt => {
                        const aptDate = new Date(apt.appointment_date);
                        const now = new Date();
                        return aptDate > now && apt.status === 'SCHEDULED';
                      })
                      .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date))
                      .map((appointment) => (
                        <div key={appointment.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-800">
                                Patient: {appointment.patient_name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Date: {new Date(appointment.appointment_date).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-600">
                                Time: {new Date(appointment.appointment_date).toLocaleTimeString()}
                              </p>
                              {appointment.symptoms && (
                                <p className="text-sm text-gray-600 mt-1">
                                  Symptoms: {appointment.symptoms}
                                </p>
                              )}
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              appointment.status === 'SCHEDULED' ? 'bg-green-100 text-green-800' :
                              appointment.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                              appointment.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {appointment.status}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <p>No upcoming appointments</p>
                  </div>
                )}
              </motion.div>

              {/* Recent Consultations */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaFileMedical className="mr-2 text-[#77B254]" />
                  Recent Appointments
                </h3>
                {profileData?.appointments && profileData.appointments.length > 0 ? (
                  <div className="space-y-4">
                    {profileData.appointments
                      .filter(apt => apt.status === 'COMPLETED')
                      .sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date))
                      .slice(0, 5)
                      .map((consultation) => (
                        <div key={consultation.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-800">
                                Patient: {consultation.patient_name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Date: {new Date(consultation.appointment_date).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-600">
                                Time: {new Date(consultation.appointment_date).toLocaleTimeString()}
                              </p>
                              {consultation.notes && (
                                <p className="text-sm text-gray-600 mt-1">
                                  Notes: {consultation.notes}
                                </p>
                              )}
                            </div>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              COMPLETED
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <p>No recent consultations</p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorProfile; 