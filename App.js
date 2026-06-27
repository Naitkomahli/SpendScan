import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

// Cegah splash hilang otomatis — kita kendalikan manual
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      // Tunggu sebentar agar native splash sempat tampil
      await new Promise((resolve) => setTimeout(resolve, 800));
      setAppReady(true);
      await SplashScreen.hideAsync();
    }
    prepare();
  }, []);

  if (!appReady) return null;

  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
