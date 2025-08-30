import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import TodoApp from './components/TodoApp';
import AuthService from './routes/authService';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await AuthService.isAuthenticated();
      setIsAuthenticated(authenticated);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (userData) => {
    setIsAuthenticated(true);
    setShowRegister(false);
  };

  const handleRegisterSuccess = (userData) => {
    setIsAuthenticated(true);
    setShowRegister(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowRegister(false);
  };

  const switchToRegister = () => {
    setShowRegister(true);
  };

  const switchToLogin = () => {
    setShowRegister(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#55BCF6" />
        <StatusBar style="auto" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <TodoApp onLogout={handleLogout} />;
  }

  if (showRegister) {
    return (
      <RegisterScreen 
        onRegisterSuccess={handleRegisterSuccess}
        onSwitchToLogin={switchToLogin}
      />
    );
  }

  return (
    <LoginScreen 
      onLoginSuccess={handleLoginSuccess}
      onSwitchToRegister={switchToRegister}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#B1E2F0',
  },
});
