import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, FileText, Users, Send, Settings, Repeat } from 'lucide-react-native';

import { useMobileAuth } from '../context/AuthContext.tsx';
import { AuthScreen } from '../screens/AuthScreen.tsx';
import { DashboardScreen } from '../screens/DashboardScreen.tsx';
import { InvoicesScreen } from '../screens/InvoicesScreen.tsx';
import { InvoiceCreateScreen } from '../screens/InvoiceCreateScreen.tsx';
import { InvoiceDetailScreen } from '../screens/InvoiceDetailScreen.tsx';
import { ClientsScreen } from '../screens/ClientsScreen.tsx';
import { RemindersScreen } from '../screens/RemindersScreen.tsx';
import { SettingsScreen } from '../screens/SettingsScreen.tsx';
import { RecurringScreen } from '../screens/RecurringScreen.tsx';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

import { useLanguage } from '../context/LanguageContext.tsx';

function MainTabNavigator() {
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#ffffff',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#f1f5f9',
        },
        headerTitleStyle: {
          fontWeight: '900',
          color: '#0f172a',
          fontSize: 18,
          letterSpacing: -0.3,
        },
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10.5,
          fontWeight: '800',
          letterSpacing: 0.2,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: t('tab_workspace', 'Workspace'),
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <LayoutDashboard size={focused ? 22 : 20} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tab.Screen
        name="Invoices"
        component={InvoicesScreen}
        options={{
          title: t('tab_invoices', 'Invoices'),
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <FileText size={focused ? 22 : 20} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tab.Screen
        name="Recurring"
        component={RecurringScreen}
        options={{
          title: t('tab_autobill', 'Auto-Bill'),
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Repeat size={focused ? 22 : 20} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tab.Screen
        name="Clients"
        component={ClientsScreen}
        options={{
          title: t('tab_directory', 'Directory'),
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Users size={focused ? 22 : 20} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tab.Screen
        name="Reminders"
        component={RemindersScreen}
        options={{
          title: t('tab_reminders', 'Reminders'),
          headerShown: false,
          tabBarItemStyle: { display: 'none' },
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: t('tab_settings', 'Settings'),
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Settings size={focused ? 22 : 20} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}



export const AppNavigator: React.FC = () => {
  const { user, token, loading } = useMobileAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#090d16', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <NavigationContainer>

      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#ffffff' },
          headerTitleStyle: { fontWeight: '800', color: '#0f172a' },
          headerTintColor: '#4f46e5',
        }}
      >
        {!token ? (
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Main"
              component={MainTabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="InvoiceCreate"
              component={InvoiceCreateScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="InvoiceDetail"
              component={InvoiceDetailScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="RecurringList"
              component={RecurringScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};




