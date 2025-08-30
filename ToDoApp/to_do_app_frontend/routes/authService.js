import { API_CONFIG } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = API_CONFIG.BASE_URL;

class AuthService {
  
  static async login(email, password) {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 422 && data.errors) {
          const validationErrors = Object.entries(data.errors)
            .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
            .join('\n');
          throw new Error(`Validation errors:\n${validationErrors}`);
        }
        throw new Error(data.message || 'Login failed');
      }
      
      if (data.data && data.data.user) {
        await AsyncStorage.setItem('user', JSON.stringify(data.data.user));
        await AsyncStorage.setItem('isLoggedIn', 'true');
      }
      
      return data.data;
    } catch (error) {
      throw error;
    }
  }

  static async register(username, name, email, password, password_confirmation) {
    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          username,
          name,
          email,
          password,
          password_confirmation,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 422 && data.errors) {
          const validationErrors = Object.entries(data.errors)
            .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
            .join('\n');
          throw new Error(`Validation errors:\n${validationErrors}`);
        }
        throw new Error(data.message || 'Registration failed');
      }
      
      if (data.data && data.data.user) {
        await AsyncStorage.setItem('user', JSON.stringify(data.data.user));
        await AsyncStorage.setItem('isLoggedIn', 'true');
      }
      
      return data.data;
    } catch (error) {
      throw error;
    }
  }

  static async logout() {
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('isLoggedIn');
      
      return true;
    } catch (error) {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('isLoggedIn');
      throw error;
    }
  }

  static async getUser() {
    try {
      const userString = await AsyncStorage.getItem('user');
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      return null;
    }
  }

  static async isAuthenticated() {
    try {
      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
      return isLoggedIn === 'true';
    } catch (error) {
      return false;
    }
  }
}

export default AuthService;
