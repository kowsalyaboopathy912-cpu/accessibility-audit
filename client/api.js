/**
 * api.js - Service module for external REST API calls
 */
const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

export async function fetchSystemAlerts() {
  try {
    const response = await fetch(`${API_BASE_URL}/todos?_limit=10`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Fetch Error:', error);
    throw error;
  }
}
