import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { useAuth } from '../contexts/AuthContext';

import HomeScreen from '../screens/HomeScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import TransactionDetailScreen from '../screens/TransactionDetailScreen';
import TransactionListScreen from '../screens/TransactionListScreen';
import EditTransactionScreen from '../screens/EditTransactionScreen';
import ScanScreen from '../screens/ScanScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ReportScreen from '../screens/ReportScreen';
import LoginScreen from '../screens/LoginScreen';

// ----- Stack Navigator untuk Tab Home -----
const HomeStack = createNativeStackNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen
        name="AddTransaction"
        component={AddTransactionScreen}
        options={{ headerShown: true, title: 'Tambah Transaksi', headerTintColor: colors.text }}
      />
      <HomeStack.Screen
        name="TransactionDetail"
        component={TransactionDetailScreen}
        options={{ headerShown: true, title: 'Detail Transaksi', headerTintColor: colors.text }}
      />
      <HomeStack.Screen
        name="EditTransaction"
        component={EditTransactionScreen}
        options={{ headerShown: true, title: 'Edit Transaksi', headerTintColor: colors.text }}
      />
      <HomeStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: true, title: 'Profil', headerTintColor: colors.text }}
      />
      <HomeStack.Screen
        name="Report"
        component={ReportScreen}
        options={{ headerShown: false }}
      />
    </HomeStack.Navigator>
  );
}

// ----- Stack Navigator untuk Tab History -----
const HistoryStack = createNativeStackNavigator();

function HistoryStackScreen() {
  return (
    <HistoryStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <HistoryStack.Screen name="TransactionList" component={TransactionListScreen} />
      <HistoryStack.Screen
        name="TransactionDetail"
        component={TransactionDetailScreen}
        options={{ headerShown: true, title: 'Detail Transaksi', headerTintColor: colors.text }}
      />
      <HistoryStack.Screen
        name="EditTransaction"
        component={EditTransactionScreen}
        options={{ headerShown: true, title: 'Edit Transaksi', headerTintColor: colors.text }}
      />
    </HistoryStack.Navigator>
  );
}

// ----- Bottom Tab Utama -----
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  HomeTab: { focused: 'home-sharp', unfocused: 'home-outline' },
  ScanTab: { focused: 'scan-sharp', unfocused: 'scan-outline' },
  HistoryTab: { focused: 'receipt-sharp', unfocused: 'receipt-outline' },
};

export default function AppNavigator() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 80,
          paddingBottom: 12,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size, focused }) => {
          const name = TAB_ICONS[route.name]?.[focused ? 'focused' : 'unfocused'] || 'help-outline';
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStackScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="ScanTab" component={ScanScreen} options={{ title: 'Scan' }} />
      <Tab.Screen name="HistoryTab" component={HistoryStackScreen} options={{ title: 'History' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
