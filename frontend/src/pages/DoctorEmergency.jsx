import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaAmbulance, FaUserMd, FaSpinner, FaHome, FaFilter, FaSearch, FaTimes, FaNotesMedical, FaHistory, FaUser, FaExclamationTriangle } from 'react-icons/fa';
import api from '../api';
import Navheader from '../Components/Navheader';
import { debounce } from 'lodash';
import { normalizeEmergencyData } from '../utils/dataUtils';

// Helper functions for styling
const getStatusColor = (status) => {
  switch (status) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-800';
    case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
    case 'COMPLETED': return 'bg-green-100 text-green-800';
    case 'CANCELLED': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getSeverityColor = (severity) => {
  switch (severity) {
    case 'HIGH': return 'bg-red-100 text-red-800';
    case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
    case 'LOW': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const DoctorEmergency = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [emergencies, setEmergencies] = useState([]);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [isAssigningAmbulance, setIsAssigningAmbulance] = useState(false);
  const [ambulanceFormData, setAmbulanceFormData] = useState({
    ambulance_assigned: '',
    driver_name: '',
    driver_contact_num: '',
    arrival_time_in_hospital: ''
  });

  useEffect(() => {
    fetchEmergencies();
  }, []);

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

  const handleAmbulanceFormChange = (e) => {
    const { name, value } = e.target;
    setAmbulanceFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAssignAmbulance = async (e) => {
    e.preventDefault();
    if (!/^[0-9]{10}$/.test(ambulanceFormData.driver_contact_num)) {
      toast.error('Please enter a valid 10-digit contact number');
      return;
    }
    setIsAssigningAmbulance(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await api.patch(`/api/emergencies/${selectedEmergency.id}/`, {
        ambulance_assign_status: 'Yes',
        ...ambulanceFormData
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setEmergencies(prev => prev.map(em => em.id === selectedEmergency.id ? normalizeEmergencyData(response.data) : em));
      toast.success('Ambulance assigned successfully');
      setIsDetailsModalOpen(false);
      setAmbulanceFormData({
        ambulance_assigned: '',
        driver_name: '',
        driver_contact_num: '',
        arrival_time_in_hospital: ''
      });
    } catch (error) {
      handleApiError(error, 'ambulance assignment');
    } finally {
      setIsAssigningAmbulance(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((value) => setSearchQuery(value), 300),
    []
  );

  const filteredEmergencies = useMemo(() =>
    emergencies.filter(emergency =>
      (emergency.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       emergency.emergency_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       emergency.status?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (filterStatus === 'ALL' || emergency.status === filterStatus)
    ),
    [emergencies, searchQuery, filterStatus]
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
            <h1 className="text-4xl font-bold text-gray-900">Emergency Requests</h1>
            <p className="mt-2 text-lg text-gray-600">Manage assigned emergencies</p>
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
            </div>
          </div>

          {filteredEmergencies.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <FaAmbulance className="text-6xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900">No emergency requests found</h3>
              <p className="text-gray-600 mt-2">No emergencies assigned to you.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEmergencies.map((emergency) => (
                <div
                  key={emergency.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                  onClick={() => {
                    setSelectedEmergency(emergency);
                    setIsDetailsModalOpen(true);
                  }}
                >
                  <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
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
                        <FaUser className="mr-2 text-blue-500" />
                        Patient
                      </h4>
                      <p className="font-medium text-gray-800">{emergency.patient_name || 'Not specified'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 flex items-center">
                        <FaNotesMedical className="mr-2 text-blue-500" />
                        Symptoms
                      </h4>
                      <p className="text-gray-700 truncate">{emergency.symptoms || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isDetailsModalOpen && selectedEmergency && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Emergency #{selectedEmergency.id}</h2>
                  <button
                    onClick={() => setIsDetailsModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes size={24} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Emergency Information</h3>
                      <div className="space-y-3">
                        <p><span className="text-sm text-gray-500">Type:</span> {selectedEmergency.emergency_type || 'Not specified'}</p>
                        <p><span className="text-sm text-gray-500">Severity:</span> <span className={`px-2 py-1 rounded ${getSeverityColor(selectedEmergency.severity)}`}>{selectedEmergency.severity || 'Not specified'}</span></p>
                        <p><span className="text-sm text-gray-500">Status:</span> <span className={`px-2 py-1 rounded ${getStatusColor(selectedEmergency.status)}`}>{selectedEmergency.status || 'Not specified'}</span></p>
                        <p><span className="text-sm text-gray-500">Created:</span> {new Date(selectedEmergency.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Patient Information</h3>
                      <div className="space-y-3">
                        <p><span className="text-sm text-gray-500">Name:</span> {selectedEmergency.patient_name || 'Not specified'}</p>
                        <p><span className="text-sm text-gray-500">ID:</span> {selectedEmergency.patient_unique_id || 'Not specified'}</p>
                        <p><span className="text-sm text-gray-500">Contact:</span> {selectedEmergency.patient_phone || 'Not specified'}</p>
                        <p><span className="text-sm text-gray-500">Address:</span> {selectedEmergency.patient_address || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Ambulance Information</h3>
                      {selectedEmergency.ambulance_assign_status === 'Yes' ? (
                        <div className="space-y-3">
                          <p><span className="text-sm text-gray-500">Number:</span> {selectedEmergency.ambulance_assigned || 'Not specified'}</p>
                          <p><span className="text-sm text-gray-500">Driver:</span> {selectedEmergency.driver_name || 'Not specified'}</p>
                          <p><span className="text-sm text-gray-500">Contact:</span> {selectedEmergency.driver_contact_num || 'Not specified'}</p>
                          <p><span className="text-sm text-gray-500">Arrival:</span> {selectedEmergency.arrival_time_in_hospital ? new Date(selectedEmergency.arrival_time_in_hospital).toLocaleString() : 'N/A'}</p>
                        </div>
                      ) : (
                        <p className="text-gray-500">No ambulance assigned</p>
                      )}
                    </div>
                    {selectedEmergency.ambulance_assign_status !== 'Yes' && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Assign Ambulance</h3>
                        <form onSubmit={handleAssignAmbulance} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Ambulance Number</label>
                            <input
                              type="text"
                              name="ambulance_assigned"
                              value={ambulanceFormData.ambulance_assigned}
                              onChange={handleAmbulanceFormChange}
                              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Driver Name</label>
                            <input
                              type="text"
                              name="driver_name"
                              value={ambulanceFormData.driver_name}
                              onChange={handleAmbulanceFormChange}
                              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Driver Contact</label>
                            <input
                              type="tel"
                              name="driver_contact_num"
                              value={ambulanceFormData.driver_contact_num}
                              onChange={handleAmbulanceFormChange}
                              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Estimated Arrival</label>
                            <input
                              type="datetime-local"
                              name="arrival_time_in_hospital"
                              value={ambulanceFormData.arrival_time_in_hospital}
                              onChange={handleAmbulanceFormChange}
                              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div className="flex justify-end">
                            <button
                              type="submit"
                              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                              disabled={isAssigningAmbulance}
                            >
                              {isAssigningAmbulance ? <FaSpinner className="animate-spin mr-2" /> : <FaAmbulance className="mr-2" />}
                              Assign
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DoctorEmergency;