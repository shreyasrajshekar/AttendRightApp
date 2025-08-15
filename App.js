import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Dashboard from './screens/Dashboard';
import AddAttendance from './screens/AddAttendance';
import Timetable from './screens/Timetable';
import AdviceChat from './screens/AdviceChat';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Dashboard">
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="Add Attendance" component={AddAttendance} />
        <Stack.Screen name="Timetable" component={Timetable} />
        <Stack.Screen name="Advice Chat" component={AdviceChat} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
