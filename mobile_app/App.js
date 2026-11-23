import React, { createContext, useState, useContext, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";

// Context for Auth.
export const AuthContext = createContext(null);

// Screens (we will create these next)
import LoginScreen from "./src/screens/LoginScreen";
import SignupScreen from "./src/screens/SignupScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import MessageScannerScreen from "./src/screens/MessageScannerScreen";
import URLScannerScreen from "./src/screens/URLScannerScreen";
import ScreenshotScannerScreen from "./src/screens/ScreenshotScannerScreen";
import ChatScreen from "./src/screens/ChatScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

const Stack = createStackNavigator();

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const authContextValue = {
    token,
    setToken,
    user,
    setUser,
    logout: () => {
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: "#090d16",
              borderBottomWidth: 1,
              borderBottomColor: "#1e293b",
            },
            headerTintColor: "#06b6d4",
            headerTitleStyle: {
              fontWeight: "bold",
              color: "#ffffff",
            },
            cardStyle: { backgroundColor: "#080c14" },
          }}
        >
          {token === null ? (
            // Auth Stack
            <>
              <Stack.Screen 
                name="Login" 
                component={LoginScreen} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="Signup" 
                component={SignupScreen} 
                options={{ headerShown: false }}
              />
            </>
          ) : (
            // Main App Stack
            <>
              <Stack.Screen 
                name="Dashboard" 
                component={DashboardScreen} 
                options={{ title: "Sentinel Control Control" }}
              />
              <Stack.Screen 
                name="MessageScanner" 
                component={MessageScannerScreen} 
                options={{ title: "Linguistic Scanner" }}
              />
              <Stack.Screen 
                name="URLScanner" 
                component={URLScannerScreen} 
                options={{ title: "URL Rep. Analyzer" }}
              />
              <Stack.Screen 
                name="ScreenshotScanner" 
                component={ScreenshotScannerScreen} 
                options={{ title: "Screenshot Scanner (OCR)" }}
              />
              <Stack.Screen 
                name="Chat" 
                component={ChatScreen} 
                options={{ title: "AI Cyber Assistant" }}
              />
              <Stack.Screen 
                name="Settings" 
                component={SettingsScreen} 
                options={{ title: "Configuration Settings" }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
