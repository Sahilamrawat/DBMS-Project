import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaUserMd, FaFilter, FaTimesCircle } from 'react-icons/fa';
import api from '../api';
import Navheader from '../Components/Navheader';

let debounceTimer;

const Doctor = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [loading, setLoading] = useState(true);
  const [specializations, setSpecializations] = useState([]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/api/doctors/');
      setDoctors(response.data);
      setFilteredDoctors(response.data);
      const uniqueSpecializations = [...new Set(response.data.map(doc => doc.specialization))];
      setSpecializations(uniqueSpecializations);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setLoading(false);
    }
  };

  const handleSearch = (term, specialization) => {
    const results = doctors.filter(doctor => {
      const fullName = `${doctor.first_name} ${doctor.last_name}`.toLowerCase();
      const matchesName = fullName.includes(term.toLowerCase());
      const matchesSpecialization = !specialization || doctor.specialization === specialization;
      return matchesName && matchesSpecialization;
    });
    setFilteredDoctors(results);
  };

  useEffect(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      handleSearch(searchTerm, selectedSpecialization);
    }, 300); // Debounce time
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedSpecialization]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSpecialization('');
    setFilteredDoctors(doctors);
  };

  return (
    <>
      <Navheader />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-24">
        <div className="relative z-10 container mx-auto px-6 py-12">
          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold text-gray-800 mb-2">
              👨‍⚕️ Find Your Doctor
            </h1>
            <p className="text-gray-600 max-w-xl mx-auto">
              Search from our handpicked list of professional healthcare experts.
            </p>  
          </div>

          {/* Search + Filter Section - Stylish */}
          <div className="backdrop-blur-xl bg-white/70 border border-white/30 shadow-xl rounded-3xl p-8 mb-12 w-full flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-300">
            
            {/* Search Box */}
            <div className="relative w-full">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#77B254] text-lg" />
              <input
                type="text"
                placeholder="Search doctors by name..."
                className="w-full pl-12 pr-4 py-3 text-sm rounded-xl bg-white/80 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#77B254] focus:border-transparent transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Specialization Dropdown */}
            <div className="relative w-full md:w-1/3">
              <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#77B254] text-lg pointer-events-none" />
              <select
                className="appearance-none w-full pl-12 pr-10 py-3 text-sm rounded-xl bg-white text-gray-700 border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#77B254] focus:border-[#77B254] transition-all"
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
              >
                <option value="">All Specializations</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>

              {/* Custom dropdown arrow */}
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
                ▼
              </div>
            </div>


            {/* Clear Filters */}
            {(searchTerm || selectedSpecialization) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 text-sm px-4 py-2 text-red-500 hover:text-white hover:bg-red-500 border border-red-300 rounded-xl transition-all duration-300"
              >
                <FaTimesCircle /> Clear Filters
              </button>
            )}
          </div>


          {/* Loading */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#77B254] mx-auto"></div>
            </div>
          ) : (
            <>
              {/* No Results */}
              {filteredDoctors.length === 0 ? (
                <div className="text-center text-gray-600 py-8">
                  No doctors found matching your criteria.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDoctors.map((doctor) => (
                    <motion.div
                      key={doctor.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-6"
                    >
                      <div className="flex items-center mb-4">
                        {doctor.image ? (
                          <img
                            src={doctor.image}
                            alt={doctor.first_name}
                            className="w-16 h-16 rounded-full object-cover mr-4"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-[#77B254] flex items-center justify-center mr-4">
                            <FaUserMd className="text-2xl text-white" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">
                            Dr. {doctor.first_name} {doctor.last_name}
                          </h3>
                          <p className="text-[#77B254] text-sm">{doctor.specialization}</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-gray-700">
                        <p><strong>Qualification:</strong> {doctor.qualification}</p>
                        <p><strong>Experience:</strong> {doctor.experience_years} years</p>
                        <p><strong>Consultation Fee:</strong> ₹{doctor.consultation_fee}</p>
                      </div>

                      <button
                        onClick={() => navigate('/appointments', {
                          state: { selectedDoctor: doctor },
                        })}
                        className="mt-5 w-full py-2 rounded-xl bg-[#77B254] text-white hover:bg-[#5d9f3f] transition"
                      >
                        Book Appointment
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Doctor;
