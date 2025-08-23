import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_700Bold } from '@expo-google-fonts/poppins';

// Screens
import Dashboard from './screens/Dashboard';
import AddAttendance from './screens/AddAttendance';
import Timetable from './screens/Timetable';
import AdviceChat from './screens/AdviceChat';
import SplashScreenScreen from './screens/splashScreen';  // renamed to avoid conflict
import LoginScreen from './screens/loginScreen';
import SignUpScreen from './screens/SignUpScreen';
import homeScreen from './screens/homeScreen';
import StatusScreen from './screens/StatusScreen';

const Stack = createNativeStackNavigator();

// Keep splash screen visible while fonts load
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#55a0f1ff' },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontFamily: 'Poppins_700Bold',
            fontSize: 20,
          },
          headerTitleAlign: 'center',
        }}
      >
        <Stack.Screen name="AttendRight" component={SplashScreenScreen}/>
        {/*<Stack.Screen name="HOME" component={homeScreen}/>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />*/}
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="Add Attendance" component={AddAttendance} />
        <Stack.Screen name="Timetable" component={Timetable} />
        <Stack.Screen name="Advice Chat" component={AdviceChat} />
        <Stack.Screen name="Status" component={StatusScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
