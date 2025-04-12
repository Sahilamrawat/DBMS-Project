import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaUserMd, FaFilter } from 'react-icons/fa';
import api from '../api';
import Navheader from '../Components/Navheader';

const Doctor = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
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
      // Extract unique specializations
      const uniqueSpecializations = [...new Set(response.data.map(doc => doc.specialization))];
      setSpecializations(uniqueSpecializations);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const nameMatch = (doctor.first_name + ' ' + doctor.last_name)
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const specializationMatch = !selectedSpecialization || 
      doctor.specialization === selectedSpecialization;
    return nameMatch && specializationMatch;
  });

  return (
    <>
        <Navheader/>
    
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pt-30">
      {/* Background Decorations */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Find Your Perfect Doctor
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Search from our wide range of qualified healthcare professionals
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Input */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search doctors by name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Specialization Filter */}
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
              >
                <option value="">All Specializations</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Doctors Grid */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-6">
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
                      <p className="text-[#77B254]">{doctor.specialization}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-gray-600">
                      <span className="font-medium">Qualification:</span> {doctor.qualification}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Experience:</span> {doctor.experience_years} years
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Consultation Fee:</span> ₹{doctor.consultation_fee}
                    </p>
                  </div>

                  <div className="mt-6">
                    <button
                      className="w-full  bg-gray-50 text-[#77B254] border border-[#77B254] hover:bg-[#77B254] hover:text-white  py-2 px-4 rounded-lg  transition-colors duration-300"
                      onClick={() => {
                        // Handle booking appointment
                        navigate('/appointments', {
                          state: { doctorId: doctor.id },
                        });
                      }}
                    >
                      Book Appointment
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* No Results Message */}
        {!loading && filteredDoctors.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">No doctors found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default Doctor;
