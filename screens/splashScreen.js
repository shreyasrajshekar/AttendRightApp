import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace('Dashboard');
    }, 2000); // 2 sec splash
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚀 My App</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#4eb8e6' },
  title: { fontSize: 32, color: '#fff', fontWeight: 'bold' },
});
