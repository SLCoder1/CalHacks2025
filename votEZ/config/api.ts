// API Configuration
// This file can be modified for different environments

export const API_CONFIG = {
  // Development - localhost
  development: 'http://localhost:3001',
  
  // Production - replace with your deployed backend URL
  production: 'https://your-backend-url.com',
  
  // For testing on physical devices, replace with your computer's IP
  // Example: 'http://192.168.1.100:3001'
  localNetwork: 'http://localhost:3001',
};

// Get the current environment
const getEnvironment = () => {
  if (__DEV__) {
    return 'development';
  }
  return 'production';
};

// Export the current API URL
export const getApiUrl = () => {
  const env = getEnvironment();
  return API_CONFIG[env];
}; 