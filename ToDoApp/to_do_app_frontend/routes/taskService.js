import { API_CONFIG } from './config';

const BASE_URL = API_CONFIG.BASE_URL;

class TaskService {
  
  static async testConnection() {
    try {
      const response = await fetch(`${BASE_URL}/tasks`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      return response.ok;
    } catch (error) {
      return false;
    }
  }
  
  static async getAllTasks() {
    try {
      const response = await fetch(`${BASE_URL}/tasks`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.data?.tasks || [];
    } catch (error) {
      throw error;
    }
  }

  static async createTask(taskContent) {
    try {
      const requestBody = {
        title: taskContent.trim()
      };
      
      const response = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(requestBody),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 422 && data.errors) {
          const validationErrors = Object.entries(data.errors)
            .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
            .join('\n');
          throw new Error(`Validation errors:\n${validationErrors}`);
        }
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return data.data.task;
    } catch (error) {
      throw error;
    }
  }

  static async updateTask(id, updates) {
    try {
      const response = await fetch(`${BASE_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update task');
      }
      
      return data.data.task;
    } catch (error) {
      throw error;
    }
  }

  static async deleteTask(id) {
    try {
      const response = await fetch(`${BASE_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete task');
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async toggleTask(id) {
    try {
      const response = await fetch(`${BASE_URL}/tasks/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to toggle task');
      }
      
      return data.data.task;
    } catch (error) {
      throw error;
    }
  }
}

export default TaskService;
