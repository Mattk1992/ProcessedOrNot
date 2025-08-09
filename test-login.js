const fetch = require('node-fetch');

async function testLogin() {
  try {
    // Test registration first
    console.log('Testing registration...');
    const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser',
        email: 'testuser@example.com', 
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User'
      })
    });
    
    const registerData = await registerResponse.json();
    console.log('Registration response:', registerResponse.status, registerData);
    
    // Test login
    console.log('\nTesting login...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser',
        password: 'TestPassword123!',
        keepLoggedIn: false
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginResponse.status, loginData);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testLogin();
