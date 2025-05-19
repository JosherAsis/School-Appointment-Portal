const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const API_URL = `http://localhost:${process.env.PORT || 5001}/api`;
let authToken = '';

// Test admin user data
const adminUser = {
  email: 'admin@example.com',
  password: 'password123'
};

// Test functions
async function loginAsAdmin() {
  try {
    console.log('Logging in as admin...');
    const response = await axios.post(`${API_URL}/auth/login`, adminUser);
    
    if (response.status === 200 && response.data.user.role === 'admin') {
      console.log('✅ Admin login successful');
      authToken = response.data.token;
      return true;
    } else {
      console.log('❌ Admin login failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Admin login error:', error.response?.data || error.message);
    return false;
  }
}

async function testEmailService() {
  try {
    console.log('Testing email service...');
    const response = await axios.post(
      `${API_URL}/notifications/test`,
      { email: 'test@example.com' },
      {
        headers: {
          'x-auth-token': authToken
        }
      }
    );
    
    if (response.status === 200) {
      console.log('✅ Email service test successful');
      return true;
    } else {
      console.log('❌ Email service test failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Email service test error:', error.response?.data || error.message);
    return false;
  }
}

async function testSendNotification() {
  try {
    console.log('Testing send notification...');
    const notificationData = {
      type: 'appointment_confirmation',
      recipient: 'test@example.com',
      subject: 'Test Notification',
      appointmentData: {
        date: new Date().toLocaleDateString(),
        time: '10:00 AM - 11:00 AM',
        reason: 'Test appointment'
      }
    };
    
    const response = await axios.post(
      `${API_URL}/notifications/email`,
      notificationData,
      {
        headers: {
          'x-auth-token': authToken
        }
      }
    );
    
    if (response.status === 200) {
      console.log('✅ Send notification successful');
      return true;
    } else {
      console.log('❌ Send notification failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Send notification error:', error.response?.data || error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('Starting notification tests...');
  
  // Login as admin first
  const loginSuccess = await loginAsAdmin();
  if (!loginSuccess) {
    console.log('❌ Admin login failed. Stopping tests.');
    return;
  }
  
  // Test email service
  const emailServiceSuccess = await testEmailService();
  if (!emailServiceSuccess) {
    console.log('❌ Email service test failed. Stopping tests.');
    return;
  }
  
  // Test sending notification
  const notificationSuccess = await testSendNotification();
  if (!notificationSuccess) {
    console.log('❌ Send notification test failed.');
    return;
  }
  
  console.log('✅ All notification tests passed!');
}

// Run the tests
runTests().catch(error => {
  console.error('Test error:', error);
});
