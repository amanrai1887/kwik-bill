import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext.tsx';
import { LanguageProvider } from './src/context/LanguageContext.tsx';
import { AppNavigator } from './src/navigation/AppNavigator.tsx';
import { SplashScreen } from './src/screens/SplashScreen.tsx';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AuthProvider>
          <StatusBar style="light" />
          {showSplash ? (
            <SplashScreen onFinish={() => setShowSplash(false)} />
          ) : (
            <AppNavigator />
          )}
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}


