import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  Keyboard, 
  KeyboardAvoidingView, 
  TouchableOpacity, 
  Platform, 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import Task from './task';
import TaskService from '../routes/taskService';
import AuthService from '../routes/authService';

const TodoApp = ({ onLogout }) => {
  const [task, setTask] = useState('');
  const [taskItems, setTaskItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [completingTasks, setCompletingTasks] = useState(new Set());
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUserAndTasks();
  }, []);

  const loadUserAndTasks = async () => {
    try {
      const userData = await AuthService.getUser();
      setUser(userData);
      await loadTasks();
    } catch (error) {
      Alert.alert('Error', 'Failed to load user data');
    }
  };

  const loadTasks = async () => {
    try {
      setIsLoadingTasks(true);
      
      const isConnected = await TaskService.testConnection();
      
      if (!isConnected) {
        Alert.alert(
          'Connection Error', 
          'Cannot connect to the backend server. Please make sure:\n\n• Your Laravel server is running on port 8001\n• You are using the correct IP address\n• For Android emulator: Backend should be accessible at 10.0.2.2:8001\n• For physical device: Use your computer\'s local IP address'
        );
        return;
      }
      
      const tasks = await TaskService.getAllTasks();
      setTaskItems(tasks);
      
    } catch (error) {
      Alert.alert('Error', `Failed to load tasks: ${error.message}`);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const handleAddTask = async () => {
    if (!task.trim()) {
      Alert.alert('Error', 'Please enter a task');
      return;
    }

    try {
      setIsLoading(true);
      Keyboard.dismiss();
      
      const newTask = await TaskService.createTask(task.trim());
      
      setTaskItems([...taskItems, newTask]);
      setTask('');
      
    } catch (error) {
      Alert.alert(
        'Error', 
        `Failed to add task:\n\n${error.message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const completeTask = async (index) => {
    const taskToDelete = taskItems[index];
    
    try {
      setCompletingTasks(prev => new Set([...prev, taskToDelete.id]));
      
      setTimeout(async () => {
        try {
          await TaskService.deleteTask(taskToDelete.id);
          
          let itemsCopy = [...taskItems];
          itemsCopy.splice(index, 1);
          setTaskItems(itemsCopy);
          
          setCompletingTasks(prev => {
            const newSet = new Set(prev);
            newSet.delete(taskToDelete.id);
            return newSet;
          });
          
        } catch (error) {
          setCompletingTasks(prev => {
            const newSet = new Set(prev);
            newSet.delete(taskToDelete.id);
            return newSet;
          });
          Alert.alert('Error', 'Failed to delete task. Please try again.');
        }
      }, 500);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to delete task. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      onLogout();
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome, {user?.name || 'User'}!
        </Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.taskListContainer}>
        <Text style={styles.sectionTitle}>Today's Tasks</Text>

        <View style={styles.items}>
          {isLoadingTasks ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#55BCF6" />
              <Text style={styles.loadingText}>Loading tasks...</Text>
            </View>
          ) : (
            taskItems.map((item, index) => {
              return (
                <Task 
                  key={item.id || index} 
                  text={item.title || item.text || item}
                  onComplete={() => completeTask(index)}
                  isCompleting={completingTasks.has(item.id)}
                />
              )
            })
          )}
        </View>

        <StatusBar style="auto" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "android" ? "padding" : "height"}
        style={styles.WriteTaskWrapper}
      >
        <TextInput 
          style={styles.input} 
          placeholder={"Write a task"} 
          value={task} 
          onChangeText={text => setTask(text)}
        />
        <TouchableOpacity onPress={() => handleAddTask()} disabled={isLoading}>
          <View style={[styles.addWrapper, isLoading && styles.addWrapperDisabled]}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.addText}>+</Text>
            )}
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B1E2F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  taskListContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  items: {
    marginTop: 30,
    flex: 1,
  },
  WriteTaskWrapper: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    padding: 10,
    borderRadius: 60,
    backgroundColor: '#FFF',
    borderColor: '#55BCF6',
    borderWidth: 1,
    width: '80%',
    height: 60,
    marginBottom: 10,
    marginRight: 20,
  },
  addWrapper: {
    backgroundColor: '#55BCF6',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    width: 200,
    height: 40,
  },
  addText: {
    color: '#FFF',
    fontSize: 24,
  },
  addWrapperDisabled: {
    backgroundColor: '#cccccc',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#55BCF6',
    fontSize: 16,
  },
});

export default TodoApp;
