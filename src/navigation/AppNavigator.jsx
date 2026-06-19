import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

import HomeScreen from '../screens/HomeScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import TransactionDetailScreen from '../screens/TransactionDetailScreen';
import TransactionListScreen from '../screens/TransactionListScreen';
import EditTransactionScreen from '../screens/EditTransactionScreen';
import ScanScreen from '../screens/ScanScreen';
import ProfileScreen from '../screens/ProfileScreen';

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
  HistoryTab: { focused: 'receipt-sharp', unfocused: 'receipt-outline' },
  ScanTab: { focused: 'scan-sharp', unfocused: 'scan-outline' },
  ProfileTab: { focused: 'person-sharp', unfocused: 'person-outline' },
};

export default function AppNavigator() {
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
      <Tab.Screen name="HistoryTab" component={HistoryStackScreen} options={{ title: 'History' }} />
      <Tab.Screen name="ScanTab" component={ScanScreen} options={{ title: 'Scan' }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
