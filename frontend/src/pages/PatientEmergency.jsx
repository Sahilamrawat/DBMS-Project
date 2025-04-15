import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaAmbulance, FaUserMd, FaHospital, FaClock, FaCheckCircle, FaExclamationTriangle, FaSpinner, FaHome, FaFilter, FaSearch, FaTimes, FaPhone, FaMapMarkerAlt, FaNotesMedical, FaHistory, FaPlus, FaUser } from 'react-icons/fa';
import api from '../api';
import Navheader from '../Components/Navheader';
import { Link } from 'react-router-dom';
import { debounce } from 'lodash';
import { normalizeEmergencyData } from '../utils/dataUtils'; // Utility for data normalization

// Helper functions for styling
const getStatusColor = (status) => {
  switch (status) {
    case 'PENDING': return 'bg-yellow-200 text-yellow-800';
    case 'IN_PROGRESS': return 'bg-blue-200 text-blue-800';
    case 'COMPLETED': return 'bg-green-200 text-green-800';
    case 'CANCELLED': return 'bg-gray-200 text-gray-800';
    default: return 'bg-gray-200 text-gray-800';
  }
};

const getSeverityColor = (severity) => {
  switch (severity) {
    case 'HIGH': return 'bg-red-200 text-red-800';
    case 'MEDIUM': return 'bg-yellow-200 text-yellow-800';
    case 'LOW': return 'bg-green-200 text-green-800';
    default: return 'bg-gray-200 text-gray-800';
  }
};

const PatientEmergency = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [emergencies, setEmergencies] = useState([]);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [formData, setFormData] = useState({
    emergency_type: '',
    severity: 'MEDIUM',
    symptoms: '',
    location: '',
    contact_number: '',
    additional_notes: '',
    doctor_id: ''
  });

  useEffect(() => {
    if (id) {
      fetchEmergencyDetails(id);
    } else {
      fetchEmergencies();
    }
    fetchAvailableDoctors();
  }, [id]);

  const fetchAvailableDoctors = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await api.get('/api/doctors/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAvailableDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to fetch available doctors');
    }
  };

  const fetchEmergencyDetails = async (emergencyId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await api.get(`/api/emergencies/${emergencyId}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSelectedEmergency(normalizeEmergencyData(response.data));
      setIsRequestModalOpen(true);
    } catch (error) {
      handleApiError(error, 'emergency details');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmergencies = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await api.get('/api/emergencies/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setEmergencies(response.data.map(normalizeEmergencyData));
    } catch (error) {
      handleApiError(error, 'emergency requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApiError = (error, context) => {
    if (error.response?.status === 401) {
      toast.error(`Please login to view ${context}`);
      navigate('/login');
    } else if (error.response?.status === 403) {
      toast.error(`You do not have permission to view ${context}`);
    } else if (error.response?.status === 404) {
      toast.error(`${context.charAt(0).toUpperCase() + context.slice(1)} not found`);
    } else {
      toast.error(`Failed to fetch ${context}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'emergency_type') autoAssignDoctor(value);
  };

  const autoAssignDoctor = (emergencyType) => {
    if (!availableDoctors.length) return;
    const specializationMap = {
      CARDIAC: 'CARDIOLOGIST',
      STROKE: 'NEUROLOGIST',
      TRAUMA: 'GENERAL',
      RESPIRATORY: 'PULMONOLOGIST',
      PEDIATRIC: 'PEDIATRICIAN',
      OBSTETRIC: 'GYNECOLOGIST',
      PSYCHIATRIC: 'PSYCHIATRIST',
      TOXICOLOGY: 'GENERAL',
      ORTHOPEDIC: 'ORTHOPEDIC',
      GENERAL: 'GENERAL'
    };
    const specialization = specializationMap[emergencyType.toUpperCase()] || 'GENERAL';
    const matchingDoctor = availableDoctors.find(doctor => doctor.specialization.toUpperCase() === specialization) ||
                          availableDoctors.find(doctor => doctor.specialization.toUpperCase() === 'GENERAL') ||
                          availableDoctors[0];
    if (matchingDoctor) {
      setFormData(prev => ({ ...prev, doctor_id: matchingDoctor.id }));
    }
  };

  const handleSubmitEmergencyRequest = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await api.post('/api/emergencies/', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      navigate(`/emergency/${response.data.id}`);
      toast.success('Emergency request submitted successfully');
      setFormData({
        emergency_type: '',
        severity: 'MEDIUM',
        symptoms: '',
        location: '',
        contact_number: '',
        additional_notes: '',
        doctor_id: ''
      });
      setIsRequestModalOpen(false);
    } catch (error) {
      console.error('Error submitting emergency request:', error);
      toast.error(error.response?.data?.error || 'Failed to submit emergency request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((value) => setSearchQuery(value), 300),
    []
  );

  const filteredEmergencies = emergencies.filter(emergency =>
    (emergency.emergency_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     emergency.symptoms?.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (filterStatus === 'ALL' || emergency.status === filterStatus)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-6xl text-blue-600 mb-4" />
          <p className="text-xl text-gray-600">Loading emergency services...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navheader />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 relative">
        <div className="absolute inset-0 opacity-10 pattern-medical"></div>
        <div className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <style>
            {`.pattern-medical {
                background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M25 0h10v60H25zM0 25h60v10H0z' fill='%23000000' fill-opacity='0.05'/%3E%3C/svg%3E");
                background-size: 30px 30px;
              }`}
          </style>

          <div className="fixed top-24 left-4 z-10">
            <button
              onClick={() => navigate('/')}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all"
            >
              <FaHome className="mr-2" />
              Back to Home
            </button>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900">Emergency Services</h1>
            <p className="mt-2 text-lg text-gray-600">Request emergency medical assistance when you need it most</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative w-full md:w-1/3">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search emergencies..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => debouncedSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <FaFilter className="text-gray-500" />
                  <select
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="ALL">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                <button
                  onClick={() => setIsRequestModalOpen(true)}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  <FaPlus className="mr-2" />
                  New Emergency
                </button>
              </div>
            </div>
          </div>

          {filteredEmergencies.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <FaAmbulance className="text-6xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900">No emergency requests found</h3>
              <p className="text-gray-600 mt-2">Create a new emergency request to get started.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEmergencies.map((emergency) => (
                <div
                  key={emergency.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">Emergency #{emergency.id}</h3>
                        <p className="text-sm">{new Date(emergency.created_at).toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(emergency.status)}`}>
                          {emergency.status}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs ${getSeverityColor(emergency.severity)}`}>
                          {emergency.severity}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 flex items-center">
                        <FaExclamationTriangle className="mr-2 text-red-500" />
                        Type
                      </h4>
                      <p className="font-medium text-gray-800">{emergency.emergency_type || 'Not specified'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 flex items-center">
                        <FaNotesMedical className="mr-2 text-blue-500" />
                        Symptoms
                      </h4>
                      <p className="text-gray-700 truncate">{emergency.symptoms || 'Not specified'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 flex items-center">
                        <FaUserMd className="mr-2 text-green-500" />
                        Doctor
                      </h4>
                      <p className="text-gray-700">{emergency.doctor_name || 'Not assigned'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 flex items-center">
                        <FaAmbulance className="mr-2 text-orange-500" />
                        Ambulance
                      </h4>
                      <p className="text-gray-700">{emergency.ambulance_assigned || 'Not assigned'}</p>
                    </div>
                    <Link
                      to={`/emergency/${emergency.id}`}
                      className="block text-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isRequestModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">New Emergency Request</h2>
                  <button
                    onClick={() => setIsRequestModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes size={24} />
                  </button>
                </div>
                <form onSubmit={handleSubmitEmergencyRequest} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Emergency Type</label>
                    <select
                      name="emergency_type"
                      value={formData.emergency_type}
                      onChange={handleInputChange}
                      className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Type</option>
                      {['CARDIAC', 'STROKE', 'TRAUMA', 'RESPIRATORY', 'PEDIATRIC', 'OBSTETRIC', 'PSYCHIATRIC', 'TOXICOLOGY', 'ORTHOPEDIC', 'GENERAL'].map(type => (
                        <option key={type} value={type}>{type.charAt(0) + type.slice(1).toLowerCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Severity</label>
                    <select
                      name="severity"
                      value={formData.severity}
                      onChange={handleInputChange}
                      className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Symptoms</label>
                    <textarea
                      name="symptoms"
                      value={formData.symptoms}
                      onChange={handleInputChange}
                      className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                      rows="4"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                    <input
                      type="tel"
                      name="contact_number"
                      value={formData.contact_number}
                      onChange={handleInputChange}
                      className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
                    <textarea
                      name="additional_notes"
                      value={formData.additional_notes}
                      onChange={handleInputChange}
                      className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                      rows="3"
                    />
                  </div>
                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setIsRequestModalOpen(false)}
                      className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <FaSpinner className="animate-spin mr-2" /> : 'Submit'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PatientEmergency;