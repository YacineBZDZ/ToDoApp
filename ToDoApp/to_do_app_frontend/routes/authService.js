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
      
      if (data.success && data.data) {
        await AsyncStorage.setItem('access_token', data.data.access_token);
        await AsyncStorage.setItem('refresh_token', data.data.refresh_token);
        await AsyncStorage.setItem('user', JSON.stringify(data.data.user));
        await AsyncStorage.setItem('isAuthenticated', 'true');
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
      
      if (data.success && data.data) {
        await AsyncStorage.setItem('access_token', data.data.access_token);
        await AsyncStorage.setItem('refresh_token', data.data.refresh_token);
        await AsyncStorage.setItem('user', JSON.stringify(data.data.user));
        await AsyncStorage.setItem('isAuthenticated', 'true');
      }
      
      return data.data;
    } catch (error) {
      throw error;
    }
  }

  static async logout() {
    try {
      const token = await AsyncStorage.getItem('access_token');
      
      if (token) {
        await fetch(`${BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      }
      
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('isAuthenticated');
      
      return true;
    } catch (error) {
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('isAuthenticated');
      throw error;
    }
  }

  static async refreshToken() {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Token refresh failed');
      }

      if (data.success && data.data) {
        await AsyncStorage.setItem('access_token', data.data.access_token);
        return data.data.access_token;
      }

      throw new Error('Invalid refresh response');
    } catch (error) {
      await this.logout();
      throw error;
    }
  }

  static async getValidAccessToken() {
    try {
      const token = await AsyncStorage.getItem('access_token');
      
      if (!token) {
        return null;
      }

      const response = await fetch(`${BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        return token;
      }

      if (response.status === 401) {
        try {
          return await this.refreshToken();
        } catch (refreshError) {
          return null;
        }
      }

      return null;
    } catch (error) {
      return null;
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
      const token = await this.getValidAccessToken();
      const isAuthenticatedFlag = await AsyncStorage.getItem('isAuthenticated');
      return token !== null && isAuthenticatedFlag === 'true';
    } catch (error) {
      return false;
    }
  }
}

export default AuthService;
