import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomePage from './screens/HomePage';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import TitlesScreen from './screens/TitlesScreen';
import Login from './screens/Login';

const Stack = createNativeStackNavigator();

SplashScreen.preventAutoHideAsync();

function App() {
  const [fontsLoaded] = useFonts({
    FredokaLight: require('./assets/fonts/Fredoka-Light.ttf'),
    FredokaMedium: require('./assets/fonts/Fredoka-Medium.ttf'),
    FredokaBold: require('./assets/fonts/Fredoka-Bold.ttf'),
    FredokaRegular: require('./assets/fonts/Fredoka-Regular.ttf'),
    FredokaSemibold: require('./assets/fonts/Fredoka-SemiBold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Return null to avoid rendering anything before fonts are loaded
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name='Login'
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TitlesScreen"
          component={TitlesScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomePage}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
