// Simple test script to verify order status update functionality
const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:8000/api';
const ORDER_ID = '18'; // Replace with a valid order ID
const AUTH_TOKEN = ''; // Replace with your auth token
const NEW_STATUS = 'processing'; // One of: pending, processing, shipped, delivered, cancelled, etc.

async function testOrderStatusUpdate() {
  console.log(`Testing order status update for order ${ORDER_ID} to status "${NEW_STATUS}"...`);
  
  try {
    // First, get the current order status
    const getResponse = await axios({
      method: 'GET',
      url: `${API_URL}/orders/${ORDER_ID}/`,
      headers: {
        'Authorization': `Token ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Current order status: ${getResponse.data.status}`);
    console.log(`Order total amount: ${getResponse.data.total_amount}`);
    
    // Now update the status
    console.log(`Sending update request with status: ${NEW_STATUS}`);
    const updateResponse = await axios({
      method: 'PUT',
      url: `${API_URL}/orders/${ORDER_ID}/status/`,
      headers: {
        'Authorization': `Token ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      },
      data: { status: NEW_STATUS }
    });
    
    console.log('Update response:', updateResponse.data);
    console.log('Status update successful!');
    
    // Verify the update
    const verifyResponse = await axios({
      method: 'GET',
      url: `${API_URL}/orders/${ORDER_ID}/`,
      headers: {
        'Authorization': `Token ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Updated order status: ${verifyResponse.data.status}`);
    console.log(`Order total amount after update: ${verifyResponse.data.total_amount}`);
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Run the test
// testOrderStatusUpdate();
console.log('To run the test, replace the AUTH_TOKEN with your token and uncomment the testOrderStatusUpdate() call'); 