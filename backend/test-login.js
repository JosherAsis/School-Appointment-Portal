const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login with admin credentials...');
    const response = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });

    console.log('Login response status:', response.status);
    console.log('Login response data:', JSON.stringify(response.data, null, 2));
    
    // Check if the response contains token and user data
    if (response.data.token) {
      console.log('✅ Token received successfully');
    } else {
      console.log('❌ No token in response');
    }
    
    if (response.data.user) {
      console.log('✅ User data received successfully');
      console.log('User role:', response.data.user.role);
    } else {
      console.log('❌ No user data in response');
    }
  } catch (error) {
    console.error('Login failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testLogin();
