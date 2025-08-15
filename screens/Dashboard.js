import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

export default function Dashboard({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Dashboard Screen</Text>
      <Button title="Go to Add Attendance" onPress={() => navigation.navigate('Add Attendance')} />
      <Button title="Go to Timetable" onPress={() => navigation.navigate('Timetable')} />
      <Button title="Go to Advice Chat" onPress={() => navigation.navigate('Advice Chat')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, marginBottom: 10 }
});
