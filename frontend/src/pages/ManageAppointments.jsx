import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaCalendarAlt, FaClock, FaUserMd, FaUser, FaEdit, FaTrash, FaSpinner, FaHome, FaFilter, FaSearch, FaTimes } from 'react-icons/fa';
import api from '../api';
import Navheader from '../Components/Navheader';

const ManageAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [userType, setUserType] = useState(localStorage.getItem('user_type') || 'PATIENT');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    appointment_date: '',
    symptoms: '',
    notes: '',
    status: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (editingAppointment) {
      // Format the date for the input field (YYYY-MM-DDTHH:MM)
      const appointmentDate = new Date(editingAppointment.appointment_date);
      const formattedDate = appointmentDate.toISOString().slice(0, 16);
      
      setEditFormData({
        appointment_date: formattedDate,
        symptoms: editingAppointment.symptoms || '',
        notes: editingAppointment.notes || '',
        status: editingAppointment.status || 'SCHEDULED'
      });
      setIsEditModalOpen(true);
    }
  }, [editingAppointment]);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/api/appointments/');
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAppointment = async (appointmentId, updatedData) => {
    try {
      const response = await api.patch(`/api/appointments/${appointmentId}/update/`, updatedData);
      if (response.status === 200) {
        setAppointments(appointments.map(appointment => 
          appointment.id === appointmentId ? response.data : appointment
        ));
        setEditingAppointment(null);
        setIsEditModalOpen(false);
        toast.success('Appointment updated successfully');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error(error.response?.data?.error || 'Failed to update appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await handleUpdateAppointment(appointmentId, { status: 'CANCELLED' });
      toast.success('Appointment cancelled successfully');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Format the date for the API
      const appointmentDate = new Date(editFormData.appointment_date);
      const formattedDate = appointmentDate.toISOString();
      
      await handleUpdateAppointment(editingAppointment.id, {
        appointment_date: formattedDate,
        symptoms: editFormData.symptoms,
        notes: editFormData.notes,
        status: editFormData.status
      });
    } catch (error) {
      console.error('Error submitting edit form:', error);
      toast.error('Failed to update appointment');
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingAppointment(null);
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      (appointment.doctor_name && appointment.doctor_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (appointment.patient_name && appointment.patient_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (appointment.symptoms && appointment.symptoms.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = filterStatus === 'ALL' || appointment.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-6xl text-[#77B254] mx-auto mb-4" />
          <p className="text-xl text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navheader />
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Manage Appointments</h1>
            <p className="text-xl text-gray-600">View and manage your appointments</p>
          </div>

          {/* Search and Filter Section */}
          <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-1/3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search appointments..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#77B254] focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-500" />
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-[#77B254] focus:border-[#77B254] rounded-md"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <FaCalendarAlt className="text-6xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-600">You don't have any appointments scheduled.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-[#77B254]"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {appointment.consultation_type || 'General Consultation'}
                      </h3>
                      <p className={`text-sm font-medium px-2 py-1 rounded-full inline-block ${
                        appointment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {appointment.status}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingAppointment(appointment)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors"
                        title="Edit Appointment"
                      >
                        <FaEdit />
                      </button>
                      {appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleCancelAppointment(appointment.id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors"
                          title="Cancel Appointment"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <FaCalendarAlt className="mr-2 text-[#77B254]" />
                      <span>{formatDate(appointment.appointment_date)}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaClock className="mr-2 text-[#77B254]" />
                      <span>{formatTime(appointment.appointment_date)}</span>
                    </div>
                    {userType === 'PATIENT' && (
                      <div className="flex items-center text-gray-600">
                        <FaUserMd className="mr-2 text-[#77B254]" />
                        <span>{appointment.doctor_name}</span>
                      </div>
                    )}
                    {userType === 'DOCTOR' && (
                      <div className="flex items-center text-gray-600">
                        <FaUser className="mr-2 text-[#77B254]" />
                        <span>{appointment.patient_name}</span>
                      </div>
                    )}
                  </div>

                  {appointment.symptoms && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Symptoms</h4>
                      <p className="text-sm text-gray-600">{appointment.symptoms}</p>
                    </div>
                  )}

                  {appointment.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Notes</h4>
                      <p className="text-sm text-gray-600">{appointment.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Appointment Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 ease-in-out animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Appointment</h2>
              <button 
                onClick={closeEditModal}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <FaTimes size={24} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-5">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="appointment_date">
                  Appointment Date & Time
                </label>
                <input
                  type="datetime-local"
                  id="appointment_date"
                  name="appointment_date"
                  value={editFormData.appointment_date}
                  onChange={handleInputChange}
                  className="shadow-sm border border-gray-300 rounded-lg w-full py-2.5 px-3.5 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#77B254] focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={editFormData.status}
                  onChange={handleInputChange}
                  className="shadow-sm border border-gray-300 rounded-lg w-full py-2.5 px-3.5 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#77B254] focus:border-transparent transition-all duration-200"
                >
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="symptoms">
                  Symptoms
                </label>
                <textarea
                  id="symptoms"
                  name="symptoms"
                  value={editFormData.symptoms}
                  onChange={handleInputChange}
                  className="shadow-sm border border-gray-300 rounded-lg w-full py-2.5 px-3.5 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#77B254] focus:border-transparent transition-all duration-200"
                  rows="3"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={editFormData.notes}
                  onChange={handleInputChange}
                  className="shadow-sm border border-gray-300 rounded-lg w-full py-2.5 px-3.5 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#77B254] focus:border-transparent transition-all duration-200"
                  rows="3"
                />
              </div>
              
              <div className="flex items-center justify-end pt-4 space-x-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all duration-200"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#77B254] hover:bg-green-600 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 flex items-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    'Update Appointment'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ManageAppointments; 