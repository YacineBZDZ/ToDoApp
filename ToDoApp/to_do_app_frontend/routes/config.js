import { Platform } from 'react-native';

const MANUAL_IP = null; 
export const API_CONFIG = {

  BASE_URL: MANUAL_IP 
    ? `http://${MANUAL_IP}:8001/api`
    : Platform.OS === 'android' 
      ? 'http://10.0.2.2:8001/api' 
      : 'http://127.0.0.1:8001/api',
  ENDPOINTS: {
    TASKS: '/tasks',
  }
};

