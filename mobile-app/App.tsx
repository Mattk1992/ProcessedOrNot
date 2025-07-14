import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import ProductScreen from './src/screens/ProductScreen';
import SearchScreen from './src/screens/SearchScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Import providers
import { ThemeProvider } from './src/context/ThemeContext';
import { ApiProvider } from './src/context/ApiContext';

const Stack = createStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <ApiProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator 
            initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#3B82F6',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen 
              name="Home" 
              component={HomeScreen} 
              options={{ title: 'ProcessedOrNot Scanner' }}
            />
            <Stack.Screen 
              name="Scanner" 
              component={ScannerScreen} 
              options={{ title: 'Scan Barcode' }}
            />
            <Stack.Screen 
              name="Product" 
              component={ProductScreen} 
              options={{ title: 'Product Details' }}
            />
            <Stack.Screen 
              name="Search" 
              component={SearchScreen} 
              options={{ title: 'Search Products' }}
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen} 
              options={{ title: 'Settings' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ApiProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});