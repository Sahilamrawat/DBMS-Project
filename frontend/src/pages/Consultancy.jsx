import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaUserMd, FaCalendar, FaVideo, FaPhone, FaComment, FaHistory, FaPills, FaAllergies, FaProcedures, FaArrowLeft, FaMoneyBill, FaClock } from 'react-icons/fa';
import api from '../api';
import Navheader from '../Components/Navheader';
import Footer from '../Components/Footer';

function Consultancy() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Select Department, 2: Select Doctor, 3: Consultation Form
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState({
    diagnosis: '',
    treatment: '',
    allergies: '',
    past_surgeries: '',
    previous_medications: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [consultationType, setConsultationType] = useState('Chat');
  const [consultationNotes, setConsultationNotes] = useState('');
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [formData, setFormData] = useState({
    doctor_id: '',
    consultation_type: '',
    follow_up_date: '',
    symptoms: '',
    allergies: '',
    past_surgeries: '',
    previous_medications: '',
    consultation_notes: ''
  });

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      setIsLoadingDepartments(true);
      try {
        const response = await api.get('/api/doctors/');
        const doctorsData = response.data;
        
        // Extract unique specializations/departments
        const uniqueDepartments = [...new Set(doctorsData.map(doctor => doctor.specialization))];
        setDepartments(uniqueDepartments);
      } catch (err) {
        console.error('Error fetching departments:', err);
        setError('Failed to load departments. Please try again.');
      } finally {
        setIsLoadingDepartments(false);
      }
    };
    
    fetchDepartments();
  }, []);

  // Fetch doctors when a department is selected
  const handleDepartmentSelect = async (department) => {
    setSelectedDepartment(department);
    setStep(2);
    setIsLoadingDoctors(true);
    setError(null);
    
    try {
      const response = await api.get(`/api/doctors/?specialization=${encodeURIComponent(department)}`);
      setDoctors(response.data);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to load doctors. Please try again.');
    } finally {
      setIsLoadingDoctors(false);
    }
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setStep(3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/consultancies/', {
        doctor_id: selectedDoctor.id,
        diagnosis: medicalHistory.diagnosis,
        prescription: medicalHistory.treatment,
        follow_up_date: formData.follow_up_date
      });
      
      console.log('Consultation created:', response.data);
      alert('Consultation request submitted successfully!');
      navigate('/');
    } catch (err) {
      console.error('Error creating consultation:', err);
      setError(err.response?.data?.error || err.response?.data?.detail || 'Failed to submit consultation request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <>
      <Navheader />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <FaUserMd className="mx-auto h-16 w-16 text-[#77B254] mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Online Consultation</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Connect with our specialists through video, audio, or chat consultation
            </p>
          </motion.div>

          {/* Step 1: Select Department */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Select Department</h2>
                
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 text-red-500 p-4 rounded-lg mb-6"
                  >
                    {error}
                  </motion.div>
                )}
                
                {isLoadingDepartments ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#77B254] mb-4"></div>
                    <p className="text-gray-600">Loading departments...</p>
                  </div>
                ) : departments.length === 0 ? (
                  <div className="text-center py-12">
                    <FaUserMd className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No departments found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      No medical departments are available at the moment.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {departments.map((department) => (
                      <motion.button
                        key={department}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleDepartmentSelect(department)}
                        className="p-6 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-[#77B254] transition-all text-left"
                      >
                        <div className="flex items-center">
                          <div className="bg-[#77B254] text-white p-3 rounded-lg mr-4">
                            <FaUserMd className="text-xl" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800">{department}</h3>
                            <p className="text-sm text-gray-500">Select to view doctors</p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2: Select Doctor */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto"
            >
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {selectedDepartment} Specialists
                </h2>
                <button
                  onClick={() => setStep(1)}
                  className="text-[#77B254] hover:text-green-600 font-medium flex items-center gap-2"
                >
                  <FaArrowLeft />
                  <span>Change Department</span>
                </button>
              </div>

              {isLoadingDoctors ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#77B254] mb-4"></div>
                  <p className="text-gray-600">Loading doctors...</p>
                </div>
              ) : doctors.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                  <FaUserMd className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No doctors found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No doctors available for {selectedDepartment} at the moment.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {doctors.map((doctor) => (
                    <motion.div
                      key={doctor.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDoctorSelect(doctor)}
                      className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer
                        ${selectedDoctor?.id === doctor.id ? 'ring-2 ring-[#77B254]' : ''}`}
                    >
                      <div className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className="relative flex-shrink-0">
                            <img
                              src={doctor.image || `https://ui-avatars.com/api/?name=${doctor.first_name}+${doctor.last_name}&background=77B254&color=fff`}
                              alt={doctor.first_name}
                              className="w-20 h-20 rounded-full object-cover border-2 border-gray-100"
                            />
                            <div className="absolute -bottom-1 -right-1 bg-[#77B254] text-white px-2 py-0.5 rounded-full text-xs">
                              {doctor.experience_years}y
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-800 truncate">
                              Dr. {doctor.first_name} {doctor.last_name}
                            </h3>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <FaUserMd className="w-4 h-4 mr-1 text-[#77B254]" />
                              <span className="truncate">{doctor.specialization}</span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1 truncate">
                              {doctor.qualifications}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FaMoneyBill className="text-[#77B254] w-4 h-4" />
                            <span className="text-[#77B254] font-semibold">
                              ₹{doctor.consultation_fee}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 space-x-2">
                            <FaClock className="w-4 h-4" />
                            <span>Available Today</span>
                          </div>
                        </div>

                        <button 
                          className="mt-4 w-full bg-[#77B254] text-white hover:bg-green-600 
                            px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 
                            flex items-center justify-center space-x-2"
                        >
                          <FaCalendar className="w-4 h-4" />
                          <span>Book Consultation</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: Consultation Form */}
          {step === 3 && selectedDoctor && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Book Consultation with Dr. {selectedDoctor.first_name} {selectedDoctor.last_name}
                </h2>
                <button
                  onClick={() => setStep(2)}
                  className="text-[#77B254] hover:text-green-600 font-medium flex items-center gap-2"
                >
                  <FaArrowLeft />
                  <span>Change Doctor</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Consultation Type Selection */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="lg:col-span-1"
                >
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Choose Consultation Type</h2>
                    <div className="space-y-4">
                      {[
                        { type: 'Video Call', icon: <FaVideo />, description: 'Face-to-face video consultation' },
                        { type: 'Audio call', icon: <FaPhone />, description: 'Voice call consultation' },
                        { type: 'Chat', icon: <FaComment />, description: 'Text-based consultation' }
                      ].map((option) => (
                        <button
                          key={option.type}
                          onClick={() => setConsultationType(option.type)}
                          className={`w-full p-4 rounded-lg border-2 transition-all duration-200 flex items-center space-x-4
                            ${consultationType === option.type 
                              ? 'border-[#77B254] bg-green-50' 
                              : 'border-gray-200 hover:border-[#77B254]'}`}
                        >
                          <div className={`text-2xl ${consultationType === option.type ? 'text-[#77B254]' : 'text-gray-400'}`}>
                            {option.icon}
                          </div>
                          <div className="text-left">
                            <h3 className="font-medium text-gray-800">{option.type}</h3>
                            <p className="text-sm text-gray-500">{option.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Medical History Form */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="lg:col-span-2"
                >
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Medical History</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FaHistory className="inline-block mr-2 text-[#77B254]" />
                            Diagnosis
                          </label>
                          <input
                            type="text"
                            value={medicalHistory.diagnosis}
                            onChange={(e) => setMedicalHistory({ ...medicalHistory, diagnosis: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#77B254] focus:border-transparent transition-all"
                            placeholder="Enter your diagnosis"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FaPills className="inline-block mr-2 text-[#77B254]" />
                            Treatment
                          </label>
                          <input
                            type="text"
                            value={medicalHistory.treatment}
                            onChange={(e) => setMedicalHistory({ ...medicalHistory, treatment: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#77B254] focus:border-transparent transition-all"
                            placeholder="Enter your current treatment"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FaAllergies className="inline-block mr-2 text-[#77B254]" />
                            Allergies
                          </label>
                          <input
                            type="text"
                            value={medicalHistory.allergies}
                            onChange={(e) => setMedicalHistory({ ...medicalHistory, allergies: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#77B254] focus:border-transparent transition-all"
                            placeholder="Enter any allergies"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FaProcedures className="inline-block mr-2 text-[#77B254]" />
                            Past Surgeries
                          </label>
                          <input
                            type="text"
                            value={medicalHistory.past_surgeries}
                            onChange={(e) => setMedicalHistory({ ...medicalHistory, past_surgeries: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#77B254] focus:border-transparent transition-all"
                            placeholder="Enter past surgeries"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FaPills className="inline-block mr-2 text-[#77B254]" />
                            Previous Medications
                          </label>
                          <textarea
                            value={medicalHistory.previous_medications}
                            onChange={(e) => setMedicalHistory({ ...medicalHistory, previous_medications: e.target.value })}
                            rows="3"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#77B254] focus:border-transparent transition-all"
                            placeholder="Enter previous medications"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FaCalendar className="inline-block mr-2 text-[#77B254]" />
                            Follow-up Date and Time
                          </label>
                          <input
                            type="datetime-local"
                            name="follow_up_date"
                            value={formData.follow_up_date}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#77B254] focus:border-transparent transition-all"
                            min={new Date().toISOString().slice(0, 16)}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FaComment className="inline-block mr-2 text-[#77B254]" />
                          Consultation Notes
                        </label>
                        <textarea
                          value={consultationNotes}
                          onChange={(e) => setConsultationNotes(e.target.value)}
                          rows="4"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#77B254] focus:border-transparent transition-all"
                          placeholder="Describe your symptoms or concerns..."
                        />
                      </div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-red-50 text-red-500 p-4 rounded-lg"
                        >
                          {error}
                        </motion.div>
                      )}

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-8 py-3 bg-[#77B254] text-white rounded-lg hover:bg-green-600 
                            transition-all transform hover:scale-105 disabled:bg-gray-400 disabled:transform-none
                            flex items-center space-x-2"
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              <span>Submitting...</span>
                            </>
                          ) : (
                            <>
                              <FaCalendar />
                              <span>Schedule Consultation</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Consultancy;