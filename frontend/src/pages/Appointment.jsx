import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUserMd, FaCalendar, FaClock, FaMoneyBill, FaNotesMedical, FaStethoscope, FaHospital } from 'react-icons/fa';
import api from '../api';
import Navheader from '../Components/Navheader';
import Footer from '../Components/Footer'
const specializations = [
  { name: "Cardiologist", icon: "❤️", description: "Heart and cardiovascular specialists" },
  { name: "Dermatologist", icon: "🔬", description: "Skin care experts" },
  { name: "Orthopedic", icon: "🦴", description: "Bone and joint specialists" },
  { name: "Pediatrician", icon: "👶", description: "Child healthcare experts" },
  { name: "Neurologist", icon: "🧠", description: "Brain and nervous system specialists" },
  { name: "Psychiatrist", icon: "🧘‍♂️", description: "Mental health professionals" },
  { name: "Gynecologist", icon: "👩", description: "Women's health specialists" },
  { name: "Ophthalmologist", icon: "👁️", description: "Eye care specialists" }
];

function Appointment() {
  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentData, setAppointmentData] = useState({
    doctor: '',
    appointment_date: '',
    appointment_fee: '',
    appointment_mode: 'IN_PERSON',
    symptoms: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await api.get('/api/doctors/');
        setDoctors(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setError('Failed to load doctors. Please try again.');
        if (error.response?.status === 401) {
          window.location.href = '/login';
        }
      }
    };

    fetchDoctors();
  }, []);

  const filteredDoctors = selectedSpecialization
    ? doctors.filter(doc => doc.specialization === selectedSpecialization)
    : doctors;

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setAppointmentData(prev => ({
      ...prev,
      doctor: doctor.id,
    }));
    setStep(3);
  };

  const validateAppointmentData = () => {
    if (!appointmentData.doctor) {
      setError('Please select a doctor');
      return false;
    }
    if (!appointmentData.appointment_date) {
      setError('Please select appointment date and time');
      return false;
    }
    // Validate that the selected date is in the future
    if (new Date(appointmentData.appointment_date) <= new Date()) {
      setError('Please select a future date and time');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError(null);
    if (!validateAppointmentData()) {
      return;
    }

    setLoading(true);
    try {
      const formattedDate = new Date(appointmentData.appointment_date).toISOString();

      const dataToSend = {
        doctor: selectedDoctor.id,
        appointment_date: formattedDate,
        appointment_mode: appointmentData.appointment_mode,
        symptoms: appointmentData.symptoms || '',
        notes: appointmentData.notes || ''
      };

      console.log('Sending appointment data:', dataToSend);

      const response = await api.post('/api/appointments/create/', dataToSend);
      console.log('Appointment created:', response.data);
      alert('Appointment booked successfully!');
      // Redirect to appointments list or dashboard
      window.location.href = '/';
    } catch (err) {
      console.error('Error creating appointment:', err.response?.data);
      setError(err.response?.data?.detail || 
              Object.values(err.response?.data || {})[0]?.[0] || 
              'Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navheader />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 pt-24">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <FaStethoscope className="mx-auto h-16 w-16 text-[#77B254] mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Book Your Appointment</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find the right specialist and book your appointment in just a few clicks
            </p>
          </motion.div>
        </div>

        {/* Progress Steps with animations */}
        <div className="max-w-4xl mx-auto mb-12 px-4">
          <div className="flex justify-between relative">
            {[
              { step: 1, title: "Choose Specialty", icon: <FaUserMd /> },
              { step: 2, title: "Select Doctor", icon: <FaStethoscope /> },
              { step: 3, title: "Book Slot", icon: <FaCalendar /> }
            ].map((item) => (
              <motion.div
                key={item.step}
                className="flex flex-col items-center relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: item.step * 0.2 }}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  step >= item.step ? 'bg-[#77B254]' : 'bg-gray-200'
                } transition-colors duration-300`}>
                  <span className="text-white text-xl">{item.icon}</span>
                </div>
                <p className="mt-2 text-sm font-medium text-gray-600">{item.title}</p>
              </motion.div>
            ))}
            {/* Progress line */}
            <div className="absolute top-6 left-0 w-full h-1 bg-gray-200 -z-10">
              <div 
                className="h-full bg-[#77B254] transition-all duration-300"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step 1: Select Specialization */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {specializations.map((spec) => (
                <motion.div
                  key={spec.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedSpecialization(spec.name);
                    setStep(2);
                  }}
                  className={`p-6 bg-white rounded-xl shadow-lg cursor-pointer transform transition-all
                    hover:shadow-xl ${selectedSpecialization === spec.name ? 'ring-2 ring-[#77B254]' : ''}
                    bg-gradient-to-br from-white to-gray-50`}
                >
                  <div className="text-4xl mb-4">{spec.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{spec.name}</h3>
                  <p className="text-gray-500 text-sm">{spec.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Select Doctor */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDoctors.map((doctor) => (
                <motion.div
                  key={doctor.doctor_id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDoctorSelect(doctor)}
                  className={`bg-white rounded-lg shadow hover:shadow-md transition-all cursor-pointer
                    ${selectedDoctor?.id === doctor.id ? 'ring-2 ring-[#77B254]' : ''}`}
                >
                  <div className="p-4">
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
                          {doctor.qualification}
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
                      className="mt-3 w-full bg-gray-50 text-[#77B254] border border-[#77B254] hover:bg-[#77B254] hover:text-white 
                        px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <FaCalendar className="w-4 h-4" />
                      <span>Book Appointment</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredDoctors.length === 0 && (
              <div className="text-center py-12">
                <FaUserMd className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No doctors found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No doctors available for the selected specialization.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 3: Book Appointment */}
        {step === 3 && selectedDoctor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto px-4"
          >
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#77B254] to-green-600 p-6 text-white">
                <h2 className="text-2xl font-semibold mb-2">
                  Book Appointment with Dr. {selectedDoctor.first_name} {selectedDoctor.last_name}
                </h2>
                <p className="opacity-90">{selectedDoctor.specialization}</p>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Appointment Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={appointmentData.appointment_date}
                      onChange={(e) =>
                        setAppointmentData({ ...appointmentData, appointment_date: e.target.value })
                      }
                      min={new Date().toISOString().split('.')[0]}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#77B254] focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Appointment Mode
                    </label>
                    <select
                      value={appointmentData.appointment_mode}
                      onChange={(e) =>
                        setAppointmentData({ ...appointmentData, appointment_mode: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#77B254] focus:border-transparent transition-all"
                      required
                    >
                      <option value="IN_PERSON">In Person</option>
                      <option value="ONLINE">Online</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Symptoms/Reason for Visit
                  </label>
                  <textarea
                    value={appointmentData.symptoms}
                    onChange={(e) =>
                      setAppointmentData({ ...appointmentData, symptoms: e.target.value })
                    }
                    rows="4"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#77B254] focus:border-transparent transition-all"
                    placeholder="Please describe your symptoms..."
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 bg-red-50 text-red-500 p-4 rounded-lg"
                  >
                    {error}
                  </motion.div>
                )}

                <div className="mt-8 flex justify-end space-x-4">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                    disabled={loading}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-8 py-3 bg-[#77B254] text-white rounded-lg hover:bg-green-600 
                      transition-all transform hover:scale-105 disabled:bg-gray-400 disabled:transform-none
                      flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Booking...</span>
                      </>
                    ) : (
                      <>
                        <FaCalendar />
                        <span>Confirm Booking</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      <Footer/>
    </>
  );
}

export default Appointment;