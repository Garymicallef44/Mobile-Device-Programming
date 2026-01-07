// app/_layout.tsx

import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { StripeProvider } from "@stripe/stripe-react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider } from "./contexts/AuthContext";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const stripePk = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!stripePk) {
    // This will help you immediately notice if .env isn't being read
    console.warn(
      "Missing EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY. Add it to your .env and restart Expo with `npx expo start -c`."
    );
  }

  return (
    <AuthProvider>
      <StripeProvider publishableKey={stripePk ?? ""}>
        <SafeAreaProvider>
          <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <Stack screenOptions={{ headerShown: true }}>
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
