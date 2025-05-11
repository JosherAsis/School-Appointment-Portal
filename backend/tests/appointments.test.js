const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const API_URL = `http://localhost:${process.env.PORT || 5001}/api`;
let authToken = '';
let appointmentId = '';

// Test user data
const testUser = {
  email: 'student@example.com',
  password: 'password123'
};

// Test appointment data
const testAppointment = {
  date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
  time_slot_id: 1, // Assuming time slot ID 1 exists
  reason: 'Test appointment'
};

// Test functions
async function login() {
  try {
    console.log('Logging in...');
    const response = await axios.post(`${API_URL}/auth/login`, testUser);
    
    if (response.status === 200) {
      console.log('✅ Login successful');
      authToken = response.data.token;
      return true;
    } else {
      console.log('❌ Login failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Login error:', error.response?.data || error.message);
    return false;
  }
}

async function testCreateAppointment() {
  try {
    console.log('Testing appointment creation...');
    const response = await axios.post(
      `${API_URL}/appointments`,
      testAppointment,
      {
        headers: {
          'x-auth-token': authToken
        }
      }
    );
    
    if (response.status === 201) {
      console.log('✅ Appointment creation successful');
      appointmentId = response.data.id;
      return true;
    } else {
      console.log('❌ Appointment creation failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Appointment creation error:', error.response?.data || error.message);
    return false;
  }
}

async function testGetAppointments() {
  try {
    console.log('Testing get appointments...');
    const response = await axios.get(
      `${API_URL}/appointments`,
      {
        headers: {
          'x-auth-token': authToken
        }
      }
    );
    
    if (response.status === 200) {
      console.log('✅ Get appointments successful');
      console.log(`Found ${response.data.length} appointments`);
      return true;
    } else {
      console.log('❌ Get appointments failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Get appointments error:', error.response?.data || error.message);
    return false;
  }
}

async function testCancelAppointment() {
  if (!appointmentId) {
    console.log('❌ No appointment ID available for cancellation test');
    return false;
  }
  
  try {
    console.log(`Testing appointment cancellation for ID ${appointmentId}...`);
    const response = await axios.delete(
      `${API_URL}/appointments/${appointmentId}`,
      {
        headers: {
          'x-auth-token': authToken
        }
      }
    );
    
    if (response.status === 200) {
      console.log('✅ Appointment cancellation successful');
      return true;
    } else {
      console.log('❌ Appointment cancellation failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Appointment cancellation error:', error.response?.data || error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('Starting appointment tests...');
  
  // Login first
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Login failed. Stopping tests.');
    return;
  }
  
  // Test creating an appointment
  const createSuccess = await testCreateAppointment();
  if (!createSuccess) {
    console.log('❌ Appointment creation test failed. Stopping tests.');
    return;
  }
  
  // Test getting appointments
  const getSuccess = await testGetAppointments();
  if (!getSuccess) {
    console.log('❌ Get appointments test failed. Stopping tests.');
    return;
  }
  
  // Test cancelling an appointment
  const cancelSuccess = await testCancelAppointment();
  if (!cancelSuccess) {
    console.log('❌ Appointment cancellation test failed.');
    return;
  }
  
  console.log('✅ All appointment tests passed!');
}

// Run the tests
runTests().catch(error => {
  console.error('Test error:', error);
});
