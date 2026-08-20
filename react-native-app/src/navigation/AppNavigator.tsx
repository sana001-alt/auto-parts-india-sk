import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { IconButton, Text } from 'react-native-paper';

import HomeScreen from '../screens/HomeScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import SellPartScreen from '../screens/SellPartScreen';
import ChatsScreen from '../screens/ChatsScreen';
import ChatRoomScreen from '../screens/ChatRoomScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AuthScreen from '../screens/AuthScreen';
import SellerProfileScreen from '../screens/SellerProfileScreen';
import AdminScreen from '../screens/AdminScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator({ user }: { user: any }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#002F36', // OLX Deep Teal Active
        tabBarInactiveTintColor: '#64748B', // Medium Gray Inactive
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginBottom: 6,
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF', // OLX White Background
          borderTopColor: '#E2E8F0',
          borderTopWidth: 1,
          height: 68,
          paddingBottom: 8,
          paddingTop: 6,
          elevation: 12,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        options={{ 
          title: 'Home',
          tabBarIcon: ({ color, focused, size }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabActiveContainer]}>
              <IconButton 
                icon={focused ? 'home' : 'home-outline'} 
                iconColor={color} 
                size={22} 
                style={styles.iconBtn} 
              />
            </View>
          )
        }}
      >
        {(props) => <HomeScreen {...props} user={user} />}
      </Tab.Screen>

      <Tab.Screen 
        name="ChatsTab" 
        options={{ 
          title: 'Chat',
          tabBarIcon: ({ color, focused, size }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabActiveContainer]}>
              <IconButton 
                icon={focused ? 'message-text' : 'message-text-outline'} 
                iconColor={color} 
                size={22} 
                style={styles.iconBtn} 
              />
            </View>
          )
        }}
      >
        {(props) => <ChatsScreen {...props} user={user} />}
      </Tab.Screen>

      <Tab.Screen 
        name="SellTab" 
        options={{ 
          title: 'SELL',
          tabBarIcon: ({ color, focused, size }) => (
            <View style={styles.sellTabButtonWrapper}>
              <View style={styles.sellTabButton}>
                <IconButton 
                  icon="camera" 
                  iconColor="#F97316" 
                  size={26} 
                  style={styles.iconBtn} 
                />
              </View>
            </View>
          ),
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '900',
            color: '#F97316',
            marginBottom: 6,
          }
        }}
      >
        {(props) => <SellPartScreen {...props} user={user} />}
      </Tab.Screen>

      <Tab.Screen 
        name="MyAdsTab" 
        options={{ 
          title: 'My Ads',
          tabBarIcon: ({ color, focused, size }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabActiveContainer]}>
              <IconButton 
                icon={focused ? 'package-variant-closed' : 'package-variant'} 
                iconColor={color} 
                size={22} 
                style={styles.iconBtn} 
              />
            </View>
          )
        }}
      >
        {(props) => <ProfileScreen {...props} user={user} initialTab="my_listings" />}
      </Tab.Screen>

      <Tab.Screen 
        name="ProfileTab" 
        options={{ 
          title: 'Account',
          tabBarIcon: ({ color, focused, size }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabActiveContainer]}>
              <IconButton 
                icon={focused ? 'account' : 'account-outline'} 
                iconColor={color} 
                size={22} 
                style={styles.iconBtn} 
              />
            </View>
          )
        }}
      >
        {(props) => <ProfileScreen {...props} user={user} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function AppNavigator({ user }: { user: any }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0F172A' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold', fontSize: 17 },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        options={{ headerShown: false }}
      >
        {(props) => <TabNavigator {...props} user={user} />}
      </Stack.Screen>

      <Stack.Screen 
        name="ProductDetail" 
        options={{ title: 'Part Details' }}
      >
        {(props) => <ProductDetailScreen {...props} user={user} />}
      </Stack.Screen>

      <Stack.Screen 
        name="ChatRoom" 
        options={{ title: 'Conversation' }}
      >
        {(props) => <ChatRoomScreen {...props} user={user} />}
      </Stack.Screen>

      <Stack.Screen 
        name="Auth" 
        component={AuthScreen}
        options={{ title: 'Account Sign In' }}
      />

      <Stack.Screen 
        name="SellerProfile" 
        component={SellerProfileScreen}
        options={{ title: 'Seller Profile' }}
      />

      <Stack.Screen 
        name="Admin" 
        component={AdminScreen}
        options={{ title: 'Admin Moderation' }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  iconBtn: {
    margin: 0,
    padding: 0,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 34,
    borderRadius: 17,
  },
  tabActiveContainer: {
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    paddingHorizontal: 12,
  },
  sellTabButtonWrapper: {
    top: -10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellTabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#F97316',
  },
});

