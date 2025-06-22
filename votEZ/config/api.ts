// API Configuration
// This file can be modified for different environments

export const API_CONFIG = {
  // Development - localhost (simulator/emulator)
  development: 'http://localhost:3001',
  
  // Production - replace with your deployed backend URL
  production: 'https://your-backend-url.railway.app', // Replace with your Railway URL
  
  // For testing on physical devices, replace with your computer's IP
  // Example: 'http://192.168.1.100:3001'
  localNetwork: 'http://192.168.29.130:3001', // Your computer's IP
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
  
  // For physical device testing, use localNetwork
  // For simulator/emulator, use development
  // For production, use production URL
  if (env === 'development') {
    // Use localNetwork for physical device testing
    return API_CONFIG.localNetwork;
  }
  
  return API_CONFIG[env];
}; 