import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StripeProvider } from "@stripe/stripe-react-native";
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './contexts/AuthContext';

import { useColorScheme } from '@/hooks/use-color-scheme';
// import { AuthProvider } from './contexts/AuthContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

const stripePk = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <StripeProvider publishableKey={stripePk!}> 
        <SafeAreaProvider>
          <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen 
                name="modal" 
                options={{ presentation: "modal", title: "Modal" }} 
              />
            </Stack>

            <StatusBar style="auto" />
          </ThemeProvider>
        </SafeAreaProvider>
      </StripeProvider>
    </AuthProvider>
  );
}
