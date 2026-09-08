import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts as useCormorant, CormorantGaramond_400Regular, CormorantGaramond_400Regular_Italic, CormorantGaramond_500Medium, CormorantGaramond_600SemiBold } from '@expo-google-fonts/cormorant-garamond';
import { useFonts as useDmSans, DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { AcademyProvider } from './src/state/AcademyContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/theme/colors';

export default function App() {
  const [cormorantLoaded] = useCormorant({
    CormorantGaramond_400Regular,
    CormorantGaramond_400Regular_Italic,
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
  });
  const [dmSansLoaded] = useDmSans({ DMSans_400Regular, DMSans_500Medium, DMSans_700Bold });

  if (!cormorantLoaded || !dmSansLoaded) {
    // Keep this simple — swap in an Expo splash-screen hold if you'd rather not flash blank.
    return <View style={{ flex: 1, backgroundColor: colors.ivory }} />;
  }

  return (
    <SafeAreaProvider>
      <AcademyProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <RootNavigator />
        </NavigationContainer>
      </AcademyProvider>
    </SafeAreaProvider>
  );
}
