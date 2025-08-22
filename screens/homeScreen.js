import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function homeScreen({ navigation }) {
  return (
    <LinearGradient
      colors={['#4eb8e6ff', '#87b4c4ff', '#c0e7f8ff']} 
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >

      <TouchableOpacity style={styles.LoginButton} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.SignUpButton} onPress={() => navigation.navigate('SignUp')}   >
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  LoginButton: {
    backgroundColor: '#4a90e2',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    width: '60%',
  },
  SignUpButton: {
    backgroundColor: '#82b0e4ff',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    width: '60%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
