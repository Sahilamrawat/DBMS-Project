export const normalizeEmergencyData = (data) => ({
    id: data.id || null,
    patient_id: data.patient_id || null,
    doctor_id: data.doctor_id || null,
    emergency_type: data.emergency_type || 'Not specified',
    severity: data.severity || 'MEDIUM',
    symptoms: data.symptoms || 'Not specified',
    treatment_given: data.treatment_given || 'Not started',
    status: data.status || 'PENDING',
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
    patient_name: data.patient_name || 'Not specified',
    patient_unique_id: data.patient_unique_id || 'Not specified',
    patient_adhaar: data.patient_adhaar || 'Not specified',
    patient_type: data.patient_type || 'Not specified',
    patient_phone: data.patient_phone || 'Not specified',
    patient_address: data.patient_address || 'Not specified',
    patient_emergency_contact: data.patient_emergency_contact || 'Not specified',
    doctor_name: data.doctor_name || 'Not assigned',
    doctor_unique_id: data.doctor_unique_id || 'Not assigned',
    doctor_specialization: data.doctor_specialization || 'Not specified',
    doctor_fee: data.doctor_fee || 'Not specified',
    doctor_experience: data.doctor_experience || 'Not specified',
    ambulance_assign_status: data.ambulance_assign_status || 'No',
    ambulance_assigned: data.ambulance_assigned || 'Not assigned',
    driver_name: data.driver_name || 'Not assigned',
    driver_contact_num: data.driver_contact_num || 'Not available',
    arrival_time_in_hospital: data.arrival_time_in_hospital || null
  });
  
  export const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  export const getSeverityColor = (severity) => {
    switch (severity) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };