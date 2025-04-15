import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaHistory, FaPlus, FaEdit, FaSave, FaSearch, FaCalendarAlt, FaUserMd, FaCheckCircle, FaClock, FaExclamationTriangle, FaTimesCircle, FaFileAlt } from 'react-icons/fa';
import Navheader from '../Components/Navheader';
import Footer from '../Components/Footer';
import axios from 'axios';

const MedicalHistory = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState(localStorage.getItem('user_type') || 'PATIENT');
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [formData, setFormData] = useState({
    diagnosis: '',
    treatment: '',
    allergies: '',
    past_surgeries: '',
    previous_medications: ''
  });
  const [editMode, setEditMode] = useState(null);
  const [searchParams, setSearchParams] = useState({ condition: '', date: '' });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('My History');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (!token) {
      setError('No authentication token found. Please log in.');
      setLoading(false);
      return;
    }
    fetchMedicalHistory();
  }, [userType, activeTab, searchParams]);

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refresh');
    if (!refreshToken) throw new Error('No refresh token found.');
    try {
      const response = await axios.post('http://localhost:8000/api/token/refresh/', { refresh: refreshToken }, {
        headers: { 'Content-Type': 'application/json' }
      });
      localStorage.setItem('access', response.data.access);
      return response.data.access;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  };

  const fetchWithAuth = async (url, config = {}, method = 'get', data = null) => {
    let token = localStorage.getItem('access');
    if (!token) throw new Error('No access token found.');

    config.headers = { ...config.headers, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    try {
      let response;
      switch (method.toLowerCase()) {
        case 'post':
          response = await axios.post(url, data, config);
          break;
        case 'put':
          response = await axios.put(url, data, config);
          break;
        case 'delete':
          response = await axios.delete(url, config);
          break;
        default: // 'get'
          response = await axios.get(url, config);
      }
      return response;
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('Token expired, attempting to refresh...');
        const newToken = await refreshToken();
        config.headers.Authorization = `Bearer ${newToken}`;
        
        let response;
        switch (method.toLowerCase()) {
          case 'post':
            response = await axios.post(url, data, config);
            break;
          case 'put':
            response = await axios.put(url, data, config);
            break;
          case 'delete':
            response = await axios.delete(url, config);
            break;
          default: // 'get'
            response = await axios.get(url, config);
        }
        return response;
      }
      throw error;
    }
  };

  const fetchMedicalHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const config = { params: { ...searchParams, tab: userType === 'DOCTOR' && activeTab !== 'My History' ? activeTab : undefined } };
      const endpoint = userType === 'PATIENT'
        ? 'http://localhost:8000/api/medical-history/'
        : activeTab === 'My History'
          ? 'http://localhost:8000/api/medical-history/'
          : 'http://localhost:8000/api/medical-history/doctor/';

      const response = await fetchWithAuth(endpoint, config);
      if (Array.isArray(response.data) || Array.isArray(response.data.data)) {
        setMedicalHistory(response.data.data || response.data);
      } else {
        console.warn('API response is not in expected format:', response.data);
        setMedicalHistory([]);
      }
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError(error.response?.data?.detail || 'Failed to load medical history. Please ensure you are logged in.');
      setMedicalHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (userType !== 'PATIENT') {
        setError('Only patients can add medical records.');
        return;
      }
      const config = {};
      const response = await fetchWithAuth(
        'http://localhost:8000/api/medical-history/',
        config,
        'post',
        {
          diagnosis: formData.diagnosis.trim(),
          treatment: formData.treatment.trim(),
          allergies: formData.allergies.trim(),
          past_surgeries: formData.past_surgeries.trim(),
          previous_medications: formData.previous_medications.trim()
        }
      );

      if (response.data) {
        setMedicalHistory(prev => [response.data, ...prev]);
        setFormData({
          diagnosis: '',
          treatment: '',
          allergies: '',
          past_surgeries: '',
          previous_medications: ''
        });
        setShowForm(false);
        alert('Medical history record added successfully!');
      }
    } catch (err) {
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.response?.data?.error || 'Error saving medical history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateHistory = async (historyId) => {
    try {
      setLoading(true);
      setError(null);
      
      if (userType !== 'PATIENT') {
        setError('Only patients can edit medical records.');
        return;
      }
      
      // Validate required fields
      if (!formData.diagnosis.trim() || !formData.treatment.trim()) {
        setError('Diagnosis and treatment are required fields.');
        setLoading(false);
        return;
      }
      
      const config = {};
      await fetchWithAuth(
        `http://localhost:8000/api/medical-history/${historyId}/`,
        config,
        'put',
        {
          diagnosis: formData.diagnosis.trim(),
          treatment: formData.treatment.trim(),
          allergies: formData.allergies.trim(),
          past_surgeries: formData.past_surgeries.trim(),
          previous_medications: formData.previous_medications.trim()
        }
      );
      
      setEditMode(null);
      fetchMedicalHistory();
      alert('Medical record updated successfully!');
    } catch (error) {
      console.error('Error updating medical history:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError(error.response?.data?.error || 'Failed to update medical history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchMedicalHistory();
  };

  const getStatusColor = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'resolved':
        return 'bg-blue-100 text-blue-800';
      case 'chronic':
        return 'bg-yellow-100 text-yellow-800';
      case 'surgery':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'active':
        return <FaCheckCircle className="text-green-500" />;
      case 'resolved':
        return <FaClock className="text-blue-500" />;
      case 'chronic':
        return <FaExclamationTriangle className="text-yellow-500" />;
      case 'surgery':
        return <FaUserMd className="text-purple-500" />;
      default:
        return <FaFileAlt className="text-gray-500" />;
    }
  };

  const tabs = userType === 'DOCTOR'
    ? ['My History', 'Chronic Diseases', 'Surgery History']
    : ['My History'];

  return (
    <>
      <Navheader />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              {userType === 'PATIENT' ? 'My Medical History' : 'Patient Medical History'}
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {userType === 'PATIENT'
                ? 'View and manage your medical history records.'
                : 'View patient medical history records.'
              }
            </p>
          </motion.div>

          {userType === 'PATIENT' ? (
            <div>
              <div className="mb-8 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <FaHistory className="text-[#77B254]" /> Medical Records
                </h2>
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#77B254] text-white rounded-lg hover:bg-green-600 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={userType !== 'PATIENT'}
                >
                  <FaPlus /> Add New Record
                </button>
              </div>

              <AnimatePresence>
                {showForm && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-gray-800">Add Medical Record</h3>
                      <button
                        onClick={() => setShowForm(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <FaTimesCircle />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                          <input
                            name="diagnosis"
                            value={formData.diagnosis}
                            onChange={handleInputChange}
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#77B254] bg-gray-50"
                            placeholder="Diagnosis details"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Treatment</label>
                          <input
                            name="treatment"
                            value={formData.treatment}
                            onChange={handleInputChange}
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#77B254] bg-gray-50"
                            placeholder="Treatment details"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                          <textarea
                            name="allergies"
                            value={formData.allergies}
                            onChange={handleInputChange}
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#77B254] bg-gray-50"
                            placeholder="Any known allergies"
                            rows="2"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Past Surgeries</label>
                          <textarea
                            name="past_surgeries"
                            value={formData.past_surgeries}
                            onChange={handleInputChange}
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#77B254] bg-gray-50"
                            placeholder="Previous surgical procedures"
                            rows="2"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Previous Medications</label>
                          <textarea
                            name="previous_medications"
                            value={formData.previous_medications}
                            onChange={handleInputChange}
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#77B254] bg-gray-50"
                            placeholder="Previously prescribed medications"
                            rows="2"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end mt-4">
                        <div className="space-x-3">
                          <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-[#77B254] text-white rounded-lg hover:bg-green-600 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FaSave /> {loading ? 'Saving...' : 'Save Record'}
                          </button>
                        </div>
                      </div>
                    </div>
                    {error && (
                      <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
                        {error}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {loading ? (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#77B254] mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading medical history...</p>
                </div>
              ) : error ? (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                  <FaExclamationTriangle className="text-5xl text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-700">Error</h3>
                  <p className="text-gray-500 mt-2">{error}</p>
                  <button
                    onClick={fetchMedicalHistory}
                    className="mt-4 px-4 py-2 bg-[#77B254] text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : medicalHistory.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                  <FaHistory className="text-5xl text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-700">No medical records found</h3>
                  <p className="text-gray-500 mt-2">You haven't added any medical records yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {medicalHistory.map((record) => (
                    <motion.div
                      key={record.history_id || record.patient_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                          <div className="bg-[#77B254]/10 p-2 rounded-lg">
                            <FaHistory className="text-[#77B254]" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-800">{record.patient_name || record.diagnosis || 'Medical Record'}</h3>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(record.diagnosis?.toLowerCase() === 'diabetes' || record.diagnosis?.toLowerCase() === 'hypertension' ? 'chronic' : record.past_surgeries ? 'surgery' : 'n/a')}`}>
                          {getStatusIcon(record.diagnosis?.toLowerCase() === 'diabetes' || record.diagnosis?.toLowerCase() === 'hypertension' ? 'chronic' : record.past_surgeries ? 'surgery' : 'n/a')}
                          {record.diagnosis?.toLowerCase() === 'diabetes' || record.diagnosis?.toLowerCase() === 'hypertension' ? 'Chronic' : record.past_surgeries ? 'Surgery' : 'N/A'}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {record.patient_id && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <FaUserMd className="text-gray-400" />
                            <span>Patient ID: {record.patient_id}</span>
                          </div>
                        )}
                        {record.created_at && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <FaCalendarAlt className="text-gray-400" />
                            <span>{new Date(record.created_at).toLocaleDateString()}</span>
                          </div>
                        )}
                        {record.diagnosis && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-700 mb-1">Diagnosis</h4>
                            <p className="text-gray-600">{record.diagnosis}</p>
                          </div>
                        )}
                        {record.treatment && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-700 mb-1">Treatment</h4>
                            <p className="text-gray-600">{record.treatment}</p>
                          </div>
                        )}
                        {record.allergies && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-700 mb-1">Allergies</h4>
                            <p className="text-gray-600">{record.allergies}</p>
                          </div>
                        )}
                        {record.past_surgeries && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-700 mb-1">Past Surgeries</h4>
                            <p className="text-gray-600">{record.past_surgeries}</p>
                          </div>
                        )}
                        {record.previous_medications && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-700 mb-1">Previous Medications</h4>
                            <p className="text-gray-600">{record.previous_medications}</p>
                          </div>
                        )}
                        {userType === 'PATIENT' && (
                          <button
                            onClick={() => {
                              setEditMode(record.history_id);
                              setFormData({
                                diagnosis: record.diagnosis || '',
                                treatment: record.treatment || '',
                                allergies: record.allergies || '',
                                past_surgeries: record.past_surgeries || '',
                                previous_medications: record.previous_medications || ''
                              });
                            }}
                            className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#77B254] text-white rounded-lg hover:bg-green-600 transition-colors"
                          >
                            <FaEdit /> Edit
                          </button>
                        )}
                        {editMode === record.history_id && (
                          <div className="mt-4 space-y-4">
                            <div className="grid grid-cols-1 gap-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                                <textarea
                                  name="diagnosis"
                                  value={formData.diagnosis}
                                  onChange={handleInputChange}
                                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#77B254] bg-gray-50"
                                  rows="2"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Treatment</label>
                                <textarea
                                  name="treatment"
                                  value={formData.treatment}
                                  onChange={handleInputChange}
                                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#77B254] bg-gray-50"
                                  rows="2"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                                <textarea
                                  name="allergies"
                                  value={formData.allergies}
                                  onChange={handleInputChange}
                                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#77B254] bg-gray-50"
                                  rows="2"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Past Surgeries</label>
                                <textarea
                                  name="past_surgeries"
                                  value={formData.past_surgeries}
                                  onChange={handleInputChange}
                                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#77B254] bg-gray-50"
                                  rows="2"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Previous Medications</label>
                                <textarea
                                  name="previous_medications"
                                  value={formData.previous_medications}
                                  onChange={handleInputChange}
                                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#77B254] bg-gray-50"
                                  rows="2"
                                />
                              </div>
                              <div className="flex justify-end mt-2">
                                <button
                                  onClick={() => handleUpdateHistory(record.history_id)}
                                  className="flex items-center gap-2 px-4 py-2 bg-[#77B254] text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  disabled={loading}
                                >
                                  <FaSave /> {loading ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                  onClick={() => setEditMode(null)}
                                  className="ml-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="mb-8 flex justify-between items-center">
                <div className="flex space-x-4">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      className={`px-4 py-2 rounded-lg transition-colors ${activeTab === tab
                        ? 'bg-[#77B254] text-white font-semibold'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaSearch className="text-[#77B254]" /> Search Filters
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                    <input
                      name="condition"
                      value={searchParams.condition}
                      onChange={handleSearchChange}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#77B254] bg-gray-50"
                      placeholder="Search by condition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      name="date"
                      value={searchParams.date}
                      onChange={handleSearchChange}
                      type="date"
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#77B254] bg-gray-50"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleSearch}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#77B254] text-white rounded-lg hover:bg-green-600 transition-colors shadow-md hover:shadow-lg"
                    >
                      <FaSearch /> Search
                    </button>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#77B254] mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading medical history...</p>
                </div>
              ) : error ? (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                  <FaExclamationTriangle className="text-5xl text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-700">Error</h3>
                  <p className="text-gray-500 mt-2">{error}</p>
                  <button
                    onClick={fetchMedicalHistory}
                    className="mt-4 px-4 py-2 bg-[#77B254] text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : medicalHistory.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                  <FaHistory className="text-5xl text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-700">No medical records found</h3>
                  <p className="text-gray-500 mt-2">No medical records match your search criteria.</p>
                </div>
              ) : (
                userType === 'DOCTOR' ? (
                  <div className="overflow-x-auto bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosis</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Past Surgeries</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {medicalHistory.map((record, idx) => (
                          <tr key={record.patient_id + '-' + idx} className="hover:bg-gray-50">
                            <td className="px-4 py-2 whitespace-nowrap font-semibold text-gray-800">{record.patient_name || '-'}</td>
                            <td className="px-4 py-2 whitespace-nowrap">{record.diagnosis || '-'}</td>
                            <td className="px-4 py-2 whitespace-nowrap">{record.past_surgeries || '-'}</td>
                            <td className="px-4 py-2 whitespace-nowrap">{record.created_at ? new Date(record.created_at).toLocaleDateString() : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {medicalHistory.map((record) => (
                      <motion.div
                        key={record.history_id || record.patient_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-2">
                            <div className="bg-[#77B254]/10 p-2 rounded-lg">
                              <FaHistory className="text-[#77B254]" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">{record.patient_name || record.diagnosis || 'Medical Record'}
                          </h3>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(record.diagnosis?.toLowerCase() === 'diabetes' || record.diagnosis?.toLowerCase() === 'hypertension' ? 'chronic' : record.past_surgeries ? 'surgery' : 'n/a')}`}>
                            {getStatusIcon(record.diagnosis?.toLowerCase() === 'diabetes' || record.diagnosis?.toLowerCase() === 'hypertension' ? 'chronic' : record.past_surgeries ? 'surgery' : 'n/a')}
                            {record.diagnosis?.toLowerCase() === 'diabetes' || record.diagnosis?.toLowerCase() === 'hypertension' ? 'Chronic' : record.past_surgeries ? 'Surgery' : 'N/A'}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {record.patient_id && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <FaUserMd className="text-gray-400" />
                              <span>Patient ID: {record.patient_id}</span>
                            </div>
                          )}
                          {record.created_at && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <FaCalendarAlt className="text-gray-400" />
                              <span>{new Date(record.created_at).toLocaleDateString()}</span>
                            </div>
                          )}
                          {record.diagnosis && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                              <h4 className="font-medium text-gray-700 mb-1">Diagnosis</h4>
                              <p className="text-gray-600">{record.diagnosis}</p>
                            </div>
                          )}
                          {record.treatment && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                              <h4 className="font-medium text-gray-700 mb-1">Treatment</h4>
                              <p className="text-gray-600">{record.treatment}</p>
                            </div>
                          )}
                          {record.allergies && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                              <h4 className="font-medium text-gray-700 mb-1">Allergies</h4>
                              <p className="text-gray-600">{record.allergies}</p>
                            </div>
                          )}
                          {record.past_surgeries && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                              <h4 className="font-medium text-gray-700 mb-1">Past Surgeries</h4>
                              <p className="text-gray-600">{record.past_surgeries}</p>
                            </div>
                          )}
                          {record.previous_medications && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                              <h4 className="font-medium text-gray-700 mb-1">Previous Medications</h4>
                              <p className="text-gray-600">{record.previous_medications}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MedicalHistory;