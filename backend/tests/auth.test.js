const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const API_URL = `http://localhost:${process.env.PORT || 5001}/api`;
let authToken = '';
let userId = '';

// Test user data
const testUser = {
  name: 'Test User',
  email: `test${Date.now()}@example.com`,
  password: 'password123',
  student_id: `S${Date.now()}`,
  department: 'Computer Science',
  year_level: 2
};

// Test functions
async function testRegister() {
  try {
    console.log('Testing user registration...');
    const response = await axios.post(`${API_URL}/auth/register`, testUser);
    
    if (response.status === 201 || response.status === 200) {
      console.log('✅ Registration successful');
      authToken = response.data.token;
      userId = response.data.user.id;
      return true;
    } else {
      console.log('❌ Registration failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Registration error:', error.response?.data || error.message);
    return false;
  }
}

async function testLogin() {
  try {
    console.log('Testing user login...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
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

async function testForgotPassword() {
  try {
    console.log('Testing forgot password...');
    const response = await axios.post(`${API_URL}/auth/forgot-password`, {
      email: testUser.email
    });
    
    if (response.status === 200) {
      console.log('✅ Forgot password request successful');
      return response.data.resetToken;
    } else {
      console.log('❌ Forgot password request failed');
      return null;
    }
  } catch (error) {
    console.error('❌ Forgot password error:', error.response?.data || error.message);
    return null;
  }
}

async function testResetPassword(resetToken) {
  try {
    console.log('Testing password reset...');
    const newPassword = 'newpassword123';
    
    const response = await axios.post(`${API_URL}/auth/reset-password/${resetToken}`, {
      password: newPassword
    });
    
    if (response.status === 200) {
      console.log('✅ Password reset successful');
      
      // Try logging in with the new password
      try {
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
          email: testUser.email,
          password: newPassword
        });
        
        if (loginResponse.status === 200) {
          console.log('✅ Login with new password successful');
          return true;
        }
      } catch (loginError) {
        console.error('❌ Login with new password failed:', loginError.response?.data || loginError.message);
      }
      
      return true;
    } else {
      console.log('❌ Password reset failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Password reset error:', error.response?.data || error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('Starting authentication tests...');
  
  // Test registration
  const registerSuccess = await testRegister();
  if (!registerSuccess) {
    console.log('❌ Registration test failed. Stopping tests.');
    return;
  }
  
  // Test login
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('❌ Login test failed. Stopping tests.');
    return;
  }
  
  // Test forgot password
  const resetToken = await testForgotPassword();
  if (!resetToken) {
    console.log('❌ Forgot password test failed. Stopping tests.');
    return;
  }
  
  // Test reset password
  const resetSuccess = await testResetPassword(resetToken);
  if (!resetSuccess) {
    console.log('❌ Reset password test failed.');
    return;
  }
  
  console.log('✅ All authentication tests passed!');
}

// Run the tests
runTests().catch(error => {
  console.error('Test error:', error);
});
