import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { List, Avatar, Text, Divider } from 'react-native-paper';
import { db, collection, query, where, onSnapshot } from '../services/firebase';

export default function ChatsScreen({ navigation, user }: any) {
  const [chats, setChats] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setChats(list);
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
        <Text variant="titleMedium" style={styles.text}>Sign in to view your conversations</Text>
      </View>
    );
  }

  const renderChatItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('ChatRoom', { chatId: item.id, part: { title: item.partTitle } })}
      activeOpacity={0.7}
    >
      <List.Item
        title={item.partTitle || 'Spare Part Discussion'}
        titleStyle={styles.chatTitle}
        description={item.lastMessageText || 'Tap to open chat conversation'}
        descriptionStyle={styles.chatDesc}
        left={(props) => (
          <Avatar.Image 
            {...props} 
            size={50}
            source={{ uri: item.partImageUrl || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=100' }} 
            style={styles.chatAvatar}
          />
        )}
        right={(props) => (
          <View style={styles.rightContainer}>
            <Text variant="bodySmall" style={styles.timeText}>
              {item.lastMessageAt ? new Date(item.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </Text>
          </View>
        )}
        style={styles.listItem}
      />
      <Divider style={{ backgroundColor: '#F1F5F9' }} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>Messages</Text>
        <Text variant="bodySmall" style={styles.headerSubtitle}>Direct buyer & seller chats</Text>
      </View>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <Avatar.Icon icon="message-outline" size={64} style={{ backgroundColor: '#FFEDD5' }} color="#F97316" />
            <Text variant="titleMedium" style={{ color: '#0F172A', fontWeight: 'bold', marginTop: 12 }}>
              No conversations yet
            </Text>
            <Text variant="bodySmall" style={styles.text}>
              When you message sellers or buyers, your chats will appear here.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#94A3B8',
    marginTop: 2,
  },
  centerContainer: {
    flex: 1,
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  text: {
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  listItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  chatTitle: {
    fontWeight: 'bold',
    color: '#0F172A',
    fontSize: 15,
  },
  chatDesc: {
    color: '#64748B',
    fontSize: 13,
  },
  chatAvatar: {
    backgroundColor: '#E2E8F0',
  },
  rightContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  timeText: {
    color: '#94A3B8',
    fontSize: 11,
  },
});
