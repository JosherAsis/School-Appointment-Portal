import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import '../styles/StudentDirectory.css';

const StudentDirectory = () => {
  const { currentUser } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'asc'
  });
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentAppointments, setStudentAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get('/students');
        setStudents(response.data);
        setFilteredStudents(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching students:', error);
        setError('Failed to load student directory. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser && currentUser.role === 'admin') {
      fetchStudents();
    }
  }, [currentUser]);

  // Get unique departments and years for filtering
  const departments = [...new Set(students.map(student => student.department).filter(Boolean))];
  const years = [...new Set(students.map(student => student.year_level).filter(Boolean))];

  // Apply filters and sorting
  useEffect(() => {
    let result = [...students];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(student =>
        student.name?.toLowerCase().includes(searchLower) ||
        student.student_id?.toLowerCase().includes(searchLower) ||
        student.email?.toLowerCase().includes(searchLower)
      );
    }

    // Apply department filter
    if (departmentFilter !== 'all') {
      result = result.filter(student => student.department === departmentFilter);
    }

    // Apply year filter
    if (yearFilter !== 'all') {
      result = result.filter(student => student.year_level === parseInt(yearFilter));
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (!a[sortConfig.key]) return 1;
        if (!b[sortConfig.key]) return -1;

        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredStudents(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, departmentFilter, yearFilter, students, sortConfig]);

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get current students for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // View student details
  const viewStudentDetails = async (student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
    setLoadingAppointments(true);

    try {
      // Fetch student's appointments
      const response = await api.get(`/appointments?student_id=${student.id}`);
      setStudentAppointments(response.data);
    } catch (error) {
      console.error('Error fetching student appointments:', error);
      setStudentAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get status badge class
  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  if (loading) {
    return <div className="loading">Loading student directory...</div>;
  }

  return (
    <div className="student-directory">
      <h2>Student Directory</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="filters-container">
        <div className="search-group">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, ID, or email"
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <label>Department:</label>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Year Level:</label>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
          >
            <option value="all">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <button
          className="btn btn-warning"
          onClick={() => {
            setSearchTerm('');
            setDepartmentFilter('all');
            setYearFilter('all');
          }}
        >
          Clear Filters
        </button>
      </div>

      {filteredStudents.length === 0 ? (
        <p>No students found matching the current filters.</p>
      ) : (
        <>
          <div className="table-responsive">
            <table className="students-table">
              <thead>
                <tr>
                  <th onClick={() => requestSort('student_id')}>
                    Student ID {sortConfig.key === 'student_id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => requestSort('name')}>
                    Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => requestSort('email')}>
                    Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => requestSort('department')}>
                    Department {sortConfig.key === 'department' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => requestSort('year_level')}>
                    Year {sortConfig.key === 'year_level' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentStudents.map(student => (
                  <tr key={student.id}>
                    <td>{student.student_id}</td>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    <td>{student.department || 'N/A'}</td>
                    <td>{student.year_level || 'N/A'}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => viewStudentDetails(student)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="btn btn-sm"
            >
              Previous
            </button>

            {Array.from({ length: Math.ceil(filteredStudents.length / itemsPerPage) }).map((_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`btn btn-sm ${currentPage === index + 1 ? 'btn-active' : ''}`}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === Math.ceil(filteredStudents.length / itemsPerPage)}
              className="btn btn-sm"
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Student Details Modal */}
      {showStudentModal && selectedStudent && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <div className="modal-header">
              <h3>Student Details</h3>
              <button
                className="close-btn"
                onClick={() => setShowStudentModal(false)}
              >
                &times;
              </button>
            </div>

            <div className="modal-body">
              <div className="student-details">
                <div className="detail-group">
                  <h4>Personal Information</h4>
                  <p><strong>Name:</strong> {selectedStudent.name}</p>
                  <p><strong>Student ID:</strong> {selectedStudent.student_id}</p>
                  <p><strong>Email:</strong> {selectedStudent.email}</p>
                  <p><strong>Department:</strong> {selectedStudent.department || 'Not specified'}</p>
                  <p><strong>Year Level:</strong> {selectedStudent.year_level || 'Not specified'}</p>
                </div>

                <div className="detail-group">
                  <h4>Appointment History</h4>
                  {loadingAppointments ? (
                    <p>Loading appointments...</p>
                  ) : studentAppointments.length === 0 ? (
                    <p>No appointments found for this student.</p>
                  ) : (
                    <div className="appointments-list">
                      {studentAppointments.map(appointment => (
                        <div key={appointment.id} className="appointment-item">
                          <div className="appointment-header">
                            <span className="appointment-date">
                              {formatDate(appointment.date)}
                            </span>
                            <span className={`status-badge ${getStatusClass(appointment.status)}`}>
                              {appointment.status}
                            </span>
                          </div>
                          <p><strong>Time:</strong> {appointment.start_time} - {appointment.end_time}</p>
                          <p><strong>Reason:</strong> {appointment.reason}</p>
                          {appointment.admin_notes && (
                            <p><strong>Admin Notes:</strong> {appointment.admin_notes}</p>
                          )}
                          <Link
                            to={`/appointment/${appointment.id}`}
                            className="btn btn-sm btn-secondary"
                          >
                            View Details
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowStudentModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDirectory;
