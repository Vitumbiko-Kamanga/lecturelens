import { useLayoutEffect } from "react";
import { setAuthTokenGetter } from "../services/api";

import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { Stack } from 'expo-router';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    'Missing Clerk publishable key. Check your .env file.'
  );
}


function RootNavigator() {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  useLayoutEffect(() => {
    // Register the function that retrieves the actual Clerk token.
    setAuthTokenGetter(getToken);

    return () => {
      setAuthTokenGetter(null);
    };
  }, [getToken]);

  if (!isLoaded) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        animationDuration: 220,
        gestureEnabled: true,
        contentStyle: {
          backgroundColor: "#F5F7FA",
        },
      }}
    >
      {/* Screens available only to signed-in students */}
      <Stack.Protected guard={isSignedIn === true}>
        <Stack.Screen name="home" />
        <Stack.Screen name="notes" />
        <Stack.Screen name="references" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="security" />
        <Stack.Screen name="api-test" />
        <Stack.Screen name="modules" />
      </Stack.Protected>

      {/* Screens available only to signed-out users */}
      <Stack.Protected guard={isSignedIn === false}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack.Protected>
    </Stack>
  );
}


export default function Layout() {
  return (
    <ClerkProvider
      publishableKey={publishableKey}
      tokenCache={tokenCache}
    >
      <RootNavigator />
    </ClerkProvider>
  );
}
