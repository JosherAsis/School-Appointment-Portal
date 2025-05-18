import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import '../styles/Profile.css';

const Profile = () => {
  const { currentUser, refreshUserData } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    student_id: '',
    department: '',
    year_level: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [studentData, setStudentData] = useState(null);

  // Fetch student profile data
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await api.get('/students');
        setStudentData(response.data);

        // Pre-fill form with current user data
        setFormData({
          name: currentUser?.name || '',
          email: currentUser?.email || '',
          student_id: response.data.student_id || '',
          department: response.data.department || '',
          year_level: response.data.year_level || ''
        });
      } catch (error) {
        console.error('Error fetching student data:', error);
        setMessage({
          type: 'error',
          text: 'Failed to load profile data. Please try again later.'
        });
      }
    };

    if (currentUser) {
      fetchStudentData();
    }

    // Set page title
    document.title = 'My Profile | School Appointment Portal';
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Update user profile (name, email, student_id)
      await api.put('/auth/update-profile', {
        name: formData.name,
        email: formData.email,
        student_id: formData.student_id
      });

      // Update student profile (department and year_level)
      await api.put('/students', {
        department: formData.department,
        year_level: parseInt(formData.year_level, 10) || 0
      });

      // Show success message
      setMessage({
        type: 'success',
        text: 'Profile updated successfully!'
      });

      // Refresh user data in context
      await refreshUserData();

      // Reset loading state
      setLoading(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.msg || error.response?.data?.message || 'Failed to update profile. Please try again.'
      });
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <h2>My Profile</h2>

      {message.text && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
          {message.text}
        </div>
      )}

      <div className="profile-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-control"
              required
            />
            <small className="form-text text-muted">
              This email will be used for all communications.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="student_id">Student ID</label>
            <input
              type="text"
              id="student_id"
              name="student_id"
              value={formData.student_id}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="department">Department</label>
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="year_level">Year Level</label>
            <select
              id="year_level"
              name="year_level"
              value={formData.year_level}
              onChange={handleChange}
              className="form-control"
              required
            >
              <option value="">Select Year Level</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
              <option value="5">5th Year</option>
              <option value="6">Graduate Student</option>
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/student-dashboard')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
