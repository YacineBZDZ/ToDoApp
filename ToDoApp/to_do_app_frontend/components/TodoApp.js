import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
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
      
      const tasks = await TaskService.getAllTasks();
      setTaskItems(tasks);
      
    } catch (error) {
      if (error.message.includes('Session expired') || error.message.includes('authentication')) {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please login again.',
          [{
            text: 'OK',
            onPress: () => onLogout()
          }]
        );
      } else {
        Alert.alert('Error', `Failed to load tasks: ${error.message}`);
      }
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
      if (error.message.includes('Session expired') || error.message.includes('authentication')) {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please login again.',
          [{
            text: 'OK',
            onPress: () => onLogout()
          }]
        );
      } else {
        Alert.alert(
          'Error', 
          `Failed to add task:\n\n${error.message}`
        );
      }
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
          
          if (error.message.includes('Session expired') || error.message.includes('authentication')) {
            Alert.alert(
              'Session Expired',
              'Your session has expired. Please login again.',
              [{
                text: 'OK',
                onPress: () => onLogout()
              }]
            );
          } else {
            Alert.alert('Error', 'Failed to delete task. Please try again.');
          }
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
      Alert.alert('Error', 'Failed to logout properly, but you will be logged out.');
      onLogout();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>
            Welcome, {user?.name || user?.username || 'User'}!
          </Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: '#55BCF6',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  taskListContainer: {
    padding: 20,
    paddingTop: 30,
    flex: 1,
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
