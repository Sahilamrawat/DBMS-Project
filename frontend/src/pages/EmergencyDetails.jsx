import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaAmbulance, FaUserMd, FaSpinner, FaHome, FaTimes, FaArrowLeft, FaUser } from 'react-icons/fa';
import api from '../api';
import Navheader from '../Components/Navheader';
import { normalizeEmergencyData } from '../Utils/dataUtils';

const EmergencyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [emergency, setEmergency] = useState(null);
  const [userRole, setUserRole] = useState(localStorage.getItem('user_type'));
  const [isAssigningAmbulance, setIsAssigningAmbulance] = useState(false);
  const [ambulanceFormData, setAmbulanceFormData] = useState({
    ambulance_assigned: '',
    driver_name: '',
    driver_contact_num: '',
    arrival_time_in_hospital: ''
  });
  const [activeTab, setActiveTab] = useState('emergency');

  useEffect(() => {
    if (!id) {
      toast.error('Emergency ID is missing');
      setLoading(false);
      return;
    }
    fetchEmergencyDetails();
  }, [id]);

  const fetchEmergencyDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/emergencies/${id}/`);
      setEmergency(normalizeEmergencyData(response.data));
    } catch (error) {
      handleApiError(error, 'emergency details');
    } finally {
      setLoading(false);
    }
  };

  const handleApiError = (error, context) => {
    if (error.response?.status === 404) {
      toast.error('Emergency request not found');
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
      const response = await api.patch(`/api/emergencies/${id}/`, {
        ambulance_assign_status: 'Yes',
        ...ambulanceFormData
      });
      setEmergency(normalizeEmergencyData(response.data));
      toast.success('Ambulance assigned successfully');
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

  const handleBack = () => {
    navigate(userRole === 'DOCTOR' ? '/doctor/emergencies' : '/patient/emergencies');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-6xl text-blue-600 mb-4" />
          <p className="text-xl text-gray-600">Loading emergency details...</p>
        </div>
      </div>
    );
  }

  if (!emergency) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Emergency not found</p>
          <button
            onClick={handleBack}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700"
          >
            <FaArrowLeft className="mr-2" />
            Back to Emergencies
          </button>
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
              onClick={handleBack}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700"
            >
              <FaArrowLeft className="mr-2" />
              Back to Emergencies
            </button>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900">Emergency #{emergency.id}</h1>
            <p className="mt-2 text-lg text-gray-600">{emergency.emergency_type}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex border-b border-gray-200 mb-4">
              {['emergency', 'patient', 'doctor', 'ambulance'].map(tab => (
                <button
                  key={tab}
                  className={`px-4 py-2 font-medium ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {activeTab === 'emergency' && (
              <div className="space-y-4">
                <p><span className="font-medium">Type:</span> {emergency.emergency_type}</p>
                <p><span className="font-medium">Severity:</span> <span className={`px-2 py-1 rounded ${emergency.severity === 'HIGH' ? 'bg-red-100 text-red-800' : emergency.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{emergency.severity}</span></p>
                <p><span className="font-medium">Status:</span> <span className={`px-2 py-1 rounded ${emergency.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : emergency.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : emergency.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{emergency.status}</span></p>
                <p><span className="font-medium">Symptoms:</span> {emergency.symptoms}</p>
                <p><span className="font-medium">Created:</span> {new Date(emergency.created_at).toLocaleString()}</p>
              </div>
            )}

            {activeTab === 'patient' && (
              <div className="space-y-4">
                <p><span className="font-medium">Name:</span> {emergency.patient_name}</p>
                <p><span className="font-medium">ID:</span> {emergency.patient_unique_id}</p>
                <p><span className="font-medium">Contact:</span> {emergency.patient_phone}</p>
                <p><span className="font-medium">Address:</span> {emergency.patient_address}</p>
                <p><span className="font-medium">Emergency Contact:</span> {emergency.patient_emergency_contact}</p>
              </div>
            )}

            {activeTab === 'doctor' && (
              <div className="space-y-4">
                {emergency.doctor_id ? (
                  <>
                    <p><span className="font-medium">Name:</span> Dr. {emergency.doctor_name}</p>
                    <p><span className="font-medium">ID:</span> {emergency.doctor_unique_id}</p>
                    <p><span className="font-medium">Specialization:</span> {emergency.doctor_specialization}</p>
                    <p><span className="font-medium">Experience:</span> {emergency.doctor_experience} years</p>
                    <p><span className="font-medium">Fee:</span> ₹{emergency.doctor_fee}</p>
                  </>
                ) : (
                  <p className="text-gray-500">No doctor assigned</p>
                )}
              </div>
            )}

            {activeTab === 'ambulance' && (
              <div className="space-y-4">
                {emergency.ambulance_assign_status === 'Yes' ? (
                  <>
                    <p><span className="font-medium">Number:</span> {emergency.ambulance_assigned}</p>
                    <p><span className="font-medium">Driver:</span> {emergency.driver_name}</p>
                    <p><span className="font-medium">Contact:</span> {emergency.driver_contact_num}</p>
                    <p><span className="font-medium">Arrival:</span> {emergency.arrival_time_in_hospital ? new Date(emergency.arrival_time_in_hospital).toLocaleString() : 'N/A'}</p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-500">No ambulance assigned</p>
                    {userRole === 'DOCTOR' && (
                      <form onSubmit={handleAssignAmbulance} className="space-y-4 mt-4">
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
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                            disabled={isAssigningAmbulance}
                          >
                            {isAssigningAmbulance ? <FaSpinner className="animate-spin mr-2" /> : <FaAmbulance className="mr-2" />}
                            Assign
                          </button>
                        </div>
                      </form>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default EmergencyDetails;