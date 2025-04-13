import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaUserMd, FaCalendar, FaVideo, FaPhone, FaComment, FaHistory, FaPills, FaAllergies, FaProcedures } from 'react-icons/fa';
import api from '../api';
import Navheader from '../Components/Navheader';
import Footer from '../Components/Footer';

function Consultancy() {
  const navigate = useNavigate();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/consultancies/', {
        consultation_type: consultationType,
        diagnosis: medicalHistory.diagnosis,
        treatment: medicalHistory.treatment,
        allergies: medicalHistory.allergies,
        past_surgeries: medicalHistory.past_surgeries,
        previous_medications: medicalHistory.previous_medications,
        consultation_notes: consultationNotes
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

          {/* Main Content */}
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
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Consultancy;