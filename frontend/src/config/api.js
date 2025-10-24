const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
};

export const getApiUrl = (endpoint) => {
  const base = API_CONFIG.baseURL;
  return `${base}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export default API_CONFIG;