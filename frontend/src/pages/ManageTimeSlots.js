import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import '../styles/ManageTimeSlots.css';

const ManageTimeSlots = () => {
  const { currentUser } = useContext(AuthContext);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState({
    day_of_week: 1, // Monday by default
    start_time: '09:00:00',
    end_time: '10:00:00',
    max_appointments: 1,
    is_available: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState(null);

  // Days of the week for display
  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        const response = await api.get('/time-slots');
        setTimeSlots(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching time slots:', error);
        setError('Failed to load time slots. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser && currentUser.role === 'admin') {
      fetchTimeSlots();
    }
  }, [currentUser]);

  // Group time slots by day of week
  const timeSlotsByDay = timeSlots.reduce((acc, slot) => {
    const day = slot.day_of_week;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(slot);
    return acc;
  }, {});

  // Sort time slots within each day by start time
  Object.keys(timeSlotsByDay).forEach(day => {
    timeSlotsByDay[day].sort((a, b) => {
      return a.start_time.localeCompare(b.start_time);
    });
  });

  // Open modal for adding a new time slot
  const openAddModal = () => {
    setModalMode('add');
    setFormData({
      day_of_week: 1,
      start_time: '09:00:00',
      end_time: '10:00:00',
      max_appointments: 1,
      is_available: true
    });
    setFormErrors({});
    setShowModal(true);
  };

  // Open modal for editing an existing time slot
  const openEditModal = (slot) => {
    setModalMode('edit');
    setSelectedSlot(slot);
    setFormData({
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
      max_appointments: slot.max_appointments,
      is_available: slot.is_available
    });
    setFormErrors({});
    setShowModal(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};
    
    // Check if end time is after start time
    if (formData.start_time >= formData.end_time) {
      errors.time = 'End time must be after start time';
    }
    
    // Check if max appointments is a positive number
    if (formData.max_appointments < 1) {
      errors.max_appointments = 'Maximum appointments must be at least 1';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit form to create or update a time slot
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitLoading(true);
    try {
      if (modalMode === 'add') {
        // Create new time slot
        const response = await api.post('/time-slots', formData);
        setTimeSlots([...timeSlots, response.data]);
      } else {
        // Update existing time slot
        await api.put(`/time-slots/${selectedSlot.id}`, formData);
        setTimeSlots(timeSlots.map(slot => 
          slot.id === selectedSlot.id ? { ...slot, ...formData } : slot
        ));
      }
      
      setShowModal(false);
      setSelectedSlot(null);
    } catch (error) {
      console.error('Error saving time slot:', error);
      
      if (error.response && error.response.data) {
        if (error.response.data.msg) {
          setFormErrors({ api: error.response.data.msg });
        } else if (error.response.data.errors) {
          const apiErrors = {};
          error.response.data.errors.forEach(err => {
            apiErrors[err.param] = err.msg;
          });
          setFormErrors(apiErrors);
        }
      } else {
        setFormErrors({ api: 'Failed to save time slot. Please try again.' });
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // Open delete confirmation modal
  const openDeleteConfirm = (slot) => {
    setSlotToDelete(slot);
    setShowDeleteConfirm(true);
  };

  // Delete a time slot
  const handleDelete = async () => {
    if (!slotToDelete) return;
    
    try {
      await api.delete(`/time-slots/${slotToDelete.id}`);
      setTimeSlots(timeSlots.filter(slot => slot.id !== slotToDelete.id));
      setShowDeleteConfirm(false);
      setSlotToDelete(null);
    } catch (error) {
      console.error('Error deleting time slot:', error);
      setError('Failed to delete time slot. Please try again.');
    }
  };

  // Format time for display (HH:MM:SS -> HH:MM AM/PM)
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (loading) {
    return <div className="loading">Loading time slots...</div>;
  }

  return (
    <div className="manage-time-slots">
      <h2>Manage Time Slots</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="actions">
        <button className="btn btn-primary" onClick={openAddModal}>
          Add New Time Slot
        </button>
      </div>
      
      <div className="time-slots-container">
        {daysOfWeek.map(day => (
          <div key={day.value} className="day-section">
            <h3>{day.label}</h3>
            
            {timeSlotsByDay[day.value] && timeSlotsByDay[day.value].length > 0 ? (
              <div className="time-slots-list">
                {timeSlotsByDay[day.value].map(slot => (
                  <div 
                    key={slot.id} 
                    className={`time-slot-card ${!slot.is_available ? 'unavailable' : ''}`}
                  >
                    <div className="time-slot-info">
                      <div className="time-range">
                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                      </div>
                      <div className="slot-details">
                        <span className="max-appointments">
                          Max appointments: {slot.max_appointments}
                        </span>
                        <span className={`availability-badge ${slot.is_available ? 'available' : 'unavailable'}`}>
                          {slot.is_available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </div>
                    <div className="time-slot-actions">
                      <button 
                        className="btn btn-sm btn-secondary"
                        onClick={() => openEditModal(slot)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => openDeleteConfirm(slot)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-slots">No time slots configured for {day.label}</p>
            )}
          </div>
        ))}
      </div>
      
      {/* Add/Edit Time Slot Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{modalMode === 'add' ? 'Add New Time Slot' : 'Edit Time Slot'}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                {formErrors.api && (
                  <div className="alert alert-danger">{formErrors.api}</div>
                )}
                
                <div className="form-group">
                  <label>Day of Week:</label>
                  <select 
                    name="day_of_week" 
                    value={formData.day_of_week} 
                    onChange={handleInputChange}
                    required
                  >
                    {daysOfWeek.map(day => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Start Time:</label>
                  <input 
                    type="time" 
                    name="start_time" 
                    value={formData.start_time.substring(0, 5)} 
                    onChange={(e) => handleInputChange({
                      target: { name: 'start_time', value: e.target.value + ':00' }
                    })}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>End Time:</label>
                  <input 
                    type="time" 
                    name="end_time" 
                    value={formData.end_time.substring(0, 5)} 
                    onChange={(e) => handleInputChange({
                      target: { name: 'end_time', value: e.target.value + ':00' }
                    })}
                    required
                  />
                  {formErrors.time && (
                    <div className="error-message">{formErrors.time}</div>
                  )}
                </div>
                
                <div className="form-group">
                  <label>Maximum Appointments:</label>
                  <input 
                    type="number" 
                    name="max_appointments" 
                    value={formData.max_appointments} 
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                  {formErrors.max_appointments && (
                    <div className="error-message">{formErrors.max_appointments}</div>
                  )}
                </div>
                
                <div className="form-group checkbox-group">
                  <label>
                    <input 
                      type="checkbox" 
                      name="is_available" 
                      checked={formData.is_available} 
                      onChange={handleInputChange}
                    />
                    Available for booking
                  </label>
                </div>
                
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={submitLoading}
                  >
                    {submitLoading ? 'Saving...' : 'Save Time Slot'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && slotToDelete && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Confirm Delete</h3>
              <button 
                className="close-btn"
                onClick={() => setShowDeleteConfirm(false)}
              >
                &times;
              </button>
            </div>
            
            <div className="modal-body">
              <p>
                Are you sure you want to delete the time slot for {daysOfWeek.find(d => d.value === slotToDelete.day_of_week)?.label} 
                from {formatTime(slotToDelete.start_time)} to {formatTime(slotToDelete.end_time)}?
              </p>
              <p className="warning">
                This action cannot be undone. Any appointments scheduled for this time slot will be affected.
              </p>
              
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTimeSlots;
