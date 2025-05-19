import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import '../styles/ExportReports.css';

const ExportReports = () => {
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportType, setReportType] = useState('appointments');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [exportFormat, setExportFormat] = useState('csv');
  const [previewData, setPreviewData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    // Get unique departments for filtering
    const fetchDepartments = async () => {
      try {
        const response = await api.get('/students');
        const depts = [...new Set(response.data.map(student => student.department).filter(Boolean))];
        setDepartments(depts);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };

    if (currentUser && currentUser.role === 'admin') {
      fetchDepartments();
    }
  }, [currentUser]);

  // Handle date range changes
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  // Generate report preview
  const generatePreview = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      setError('Please select both start and end dates');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let endpoint = '/appointments';
      let params = {
        start_date: dateRange.startDate,
        end_date: dateRange.endDate
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (departmentFilter !== 'all') {
        params.department = departmentFilter;
      }

      const response = await api.get(endpoint, { params });
      
      // Process data based on report type
      let processedData = [];
      
      if (reportType === 'appointments') {
        processedData = response.data.map(appointment => ({
          id: appointment.id,
          student_name: appointment.name || appointment.student_name,
          student_id: appointment.student_id,
          date: new Date(appointment.date).toLocaleDateString(),
          time: `${appointment.start_time} - ${appointment.end_time}`,
          reason: appointment.reason,
          status: appointment.status,
          created_at: new Date(appointment.created_at).toLocaleString()
        }));
      } else if (reportType === 'appointments-by-status') {
        // Group by status
        const groupedByStatus = response.data.reduce((acc, appointment) => {
          const status = appointment.status;
          if (!acc[status]) {
            acc[status] = 0;
          }
          acc[status]++;
          return acc;
        }, {});
        
        processedData = Object.entries(groupedByStatus).map(([status, count]) => ({
          status,
          count
        }));
      } else if (reportType === 'appointments-by-day') {
        // Group by day of week
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const groupedByDay = response.data.reduce((acc, appointment) => {
          const date = new Date(appointment.date);
          const day = days[date.getDay()];
          if (!acc[day]) {
            acc[day] = 0;
          }
          acc[day]++;
          return acc;
        }, {});
        
        processedData = Object.entries(groupedByDay).map(([day, count]) => ({
          day,
          count
        }));
      } else if (reportType === 'appointments-by-department') {
        // Group by department
        const groupedByDept = response.data.reduce((acc, appointment) => {
          const dept = appointment.department || 'Not Specified';
          if (!acc[dept]) {
            acc[dept] = 0;
          }
          acc[dept]++;
          return acc;
        }, {});
        
        processedData = Object.entries(groupedByDept).map(([department, count]) => ({
          department,
          count
        }));
      }
      
      setPreviewData(processedData);
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating report preview:', error);
      setError('Failed to generate report preview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Export report
  const exportReport = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      setError('Please select both start and end dates');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      // In a real application, this would call a backend endpoint to generate the report
      // For now, we'll simulate the export by creating a downloadable file from the preview data
      
      let content = '';
      let filename = `${reportType}_${dateRange.startDate}_to_${dateRange.endDate}`;
      
      if (exportFormat === 'csv') {
        // Generate CSV content
        if (previewData.length > 0) {
          const headers = Object.keys(previewData[0]);
          content = headers.join(',') + '\n';
          
          previewData.forEach(row => {
            content += headers.map(header => {
              let cell = row[header] || '';
              // Escape commas and quotes in CSV
              if (cell.toString().includes(',') || cell.toString().includes('"')) {
                cell = `"${cell.toString().replace(/"/g, '""')}"`;
              }
              return cell;
            }).join(',') + '\n';
          });
        }
        
        filename += '.csv';
      } else if (exportFormat === 'json') {
        // Generate JSON content
        content = JSON.stringify(previewData, null, 2);
        filename += '.json';
      }
      
      // Create a downloadable file
      const blob = new Blob([content], { type: exportFormat === 'csv' ? 'text/csv' : 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Show success message
      alert('Report exported successfully!');
    } catch (error) {
      console.error('Error exporting report:', error);
      setError('Failed to export report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  // Render table headers based on report type
  const renderTableHeaders = () => {
    if (!previewData.length) return null;
    
    const headers = Object.keys(previewData[0]);
    
    return (
      <tr>
        {headers.map(header => (
          <th key={header}>
            {header.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </th>
        ))}
      </tr>
    );
  };

  // Render table rows based on report type
  const renderTableRows = () => {
    if (!previewData.length) return null;
    
    return previewData.map((row, index) => (
      <tr key={index}>
        {Object.values(row).map((value, i) => (
          <td key={i}>{value}</td>
        ))}
      </tr>
    ));
  };

  return (
    <div className="export-reports">
      <h2>Export Reports</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="report-form">
        <div className="form-group">
          <label>Report Type:</label>
          <select 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="appointments">All Appointments</option>
            <option value="appointments-by-status">Appointments by Status</option>
            <option value="appointments-by-day">Appointments by Day of Week</option>
            <option value="appointments-by-department">Appointments by Department</option>
          </select>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Start Date:</label>
            <input 
              type="date" 
              name="startDate" 
              value={dateRange.startDate} 
              onChange={handleDateChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>End Date:</label>
            <input 
              type="date" 
              name="endDate" 
              value={dateRange.endDate} 
              onChange={handleDateChange}
              min={dateRange.startDate}
              required
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Status Filter:</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Department Filter:</label>
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
        </div>
        
        <div className="form-group">
          <label>Export Format:</label>
          <div className="radio-group">
            <label>
              <input 
                type="radio" 
                name="exportFormat" 
                value="csv" 
                checked={exportFormat === 'csv'} 
                onChange={() => setExportFormat('csv')}
              />
              CSV
            </label>
            <label>
              <input 
                type="radio" 
                name="exportFormat" 
                value="json" 
                checked={exportFormat === 'json'} 
                onChange={() => setExportFormat('json')}
              />
              JSON
            </label>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            className="btn btn-secondary"
            onClick={generatePreview}
            disabled={loading || !dateRange.startDate || !dateRange.endDate}
          >
            {loading ? 'Generating Preview...' : 'Generate Preview'}
          </button>
          
          <button 
            className="btn btn-primary"
            onClick={exportReport}
            disabled={generating || !showPreview || previewData.length === 0}
          >
            {generating ? 'Exporting...' : 'Export Report'}
          </button>
        </div>
      </div>
      
      {showPreview && (
        <div className="report-preview">
          <h3>Report Preview</h3>
          
          {previewData.length === 0 ? (
            <p>No data found for the selected criteria.</p>
          ) : (
            <div className="table-responsive">
              <table className="report-table">
                <thead>
                  {renderTableHeaders()}
                </thead>
                <tbody>
                  {renderTableRows()}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExportReports;
