import { API_CONFIG } from './config';
import AuthService from './authService';

const BASE_URL = API_CONFIG.BASE_URL;

class TaskService {
  
  static async getAuthHeaders() {
    const token = await AuthService.getValidAccessToken();
    if (!token) {
      throw new Error('No valid authentication token available');
    }
    
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  static async makeAuthenticatedRequest(url, options = {}) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (response.status === 401) {
        try {
          const newToken = await AuthService.refreshToken();
          const retryHeaders = {
            ...headers,
            'Authorization': `Bearer ${newToken}`,
          };
          
          return await fetch(url, {
            ...options,
            headers: {
              ...retryHeaders,
              ...options.headers,
            },
          });
        } catch (refreshError) {
          await AuthService.logout();
          throw new Error('Session expired. Please login again.');
        }
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  static async testConnection() {
    try {
      const response = await this.makeAuthenticatedRequest(`${BASE_URL}/auth/me`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  static async getAllTasks() {
    try {
      const response = await this.makeAuthenticatedRequest(`${BASE_URL}/tasks`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch tasks');
      }
      
      const data = await response.json();
      
      if (data.success && data.data && data.data.tasks) {
        return data.data.tasks;
      }
      
      return [];
    } catch (error) {
      throw error;
    }
  }

  static async createTask(title, description = '') {
    try {
      const taskData = { title };
      
      if (description && description.trim()) {
        taskData.description = description.trim();
      }

      const response = await this.makeAuthenticatedRequest(`${BASE_URL}/tasks`, {
        method: 'POST',
        body: JSON.stringify(taskData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 422 && data.errors) {
          const validationErrors = Object.entries(data.errors)
            .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
            .join('\n');
          throw new Error(`Validation errors:\n${validationErrors}`);
        }
        throw new Error(data.message || 'Failed to create task');
      }
      
      if (data.success && data.data && data.data.task) {
        return data.data.task;
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      throw error;
    }
  }

  static async updateTask(taskId, updates) {
    try {
      const response = await this.makeAuthenticatedRequest(`${BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 422 && data.errors) {
          const validationErrors = Object.entries(data.errors)
            .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
            .join('\n');
          throw new Error(`Validation errors:\n${validationErrors}`);
        }
        throw new Error(data.message || 'Failed to update task');
      }
      
      if (data.success && data.data && data.data.task) {
        return data.data.task;
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      throw error;
    }
  }

  static async deleteTask(taskId) {
    try {
      const response = await this.makeAuthenticatedRequest(`${BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 404) {
          throw new Error('Task not found');
        }
        throw new Error(errorData.message || 'Failed to delete task');
      }
      
      const data = await response.json();
      return data.success;
    } catch (error) {
      throw error;
    }
  }

  static async toggleTaskCompletion(taskId) {
    try {
      const response = await this.makeAuthenticatedRequest(`${BASE_URL}/tasks/${taskId}/toggle`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Task not found');
        }
        throw new Error(data.message || 'Failed to toggle task completion');
      }
      
      if (data.success && data.data && data.data.task) {
        return data.data.task;
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      throw error;
    }
  }

  static async getTaskById(taskId) {
    try {
      const response = await this.makeAuthenticatedRequest(`${BASE_URL}/tasks/${taskId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 404) {
          throw new Error('Task not found');
        }
        throw new Error(errorData.message || 'Failed to fetch task');
      }
      
      const data = await response.json();
      
      if (data.success && data.data && data.data.task) {
        return data.data.task;
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      throw error;
    }
  }

  static async getCompletedTasks() {
    try {
      const response = await this.makeAuthenticatedRequest(`${BASE_URL}/tasks?status=completed`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch completed tasks');
      }
      
      const data = await response.json();
      
      if (data.success && data.data && data.data.tasks) {
        return data.data.tasks;
      }
      
      return [];
    } catch (error) {
      throw error;
    }
  }

  static async getPendingTasks() {
    try {
      const response = await this.makeAuthenticatedRequest(`${BASE_URL}/tasks?status=pending`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch pending tasks');
      }
      
      const data = await response.json();
      
      if (data.success && data.data && data.data.tasks) {
        return data.data.tasks;
      }
      
      return [];
    } catch (error) {
      throw error;
    }
  }

  static async searchTasks(query) {
    try {
      const response = await this.makeAuthenticatedRequest(`${BASE_URL}/tasks?search=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to search tasks');
      }
      
      const data = await response.json();
      
      if (data.success && data.data && data.data.tasks) {
        return data.data.tasks;
      }
      
      return [];
    } catch (error) {
      throw error;
    }
  }
}

export default TaskService;