import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { TextInput, IconButton, Text, Surface } from 'react-native-paper';
import { db, collection, query, orderBy, onSnapshot, addDoc, doc, setDoc } from '../services/firebase';

export default function ChatRoomScreen({ route, user }: any) {
  const { chatId, part } = route.params || {};
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    if (!chatId) return;

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setMessages(list);
    });

    return () => unsubscribe();
  }, [chatId]);

  const handleSend = async () => {
    if (!inputText.trim() || !chatId || !user) return;

    const textToSend = inputText.trim();
    setInputText('');

    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(messagesRef, {
        senderId: user.uid,
        senderName: user.displayName || user.email || 'User',
        text: textToSend,
        createdAt: Date.now()
      });

      const chatDocRef = doc(db, 'chats', chatId);
      await setDoc(chatDocRef, {
        id: chatId,
        partTitle: part?.title || part?.partTitle || 'Spare Part',
        lastMessageText: textToSend,
        lastMessageAt: Date.now(),
        lastSenderId: user.uid,
        participants: [user.uid, part?.sellerId || 'seller']
      }, { merge: true });
    } catch (err) {
      console.warn('Error sending message:', err);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.senderId === user?.uid;
    return (
      <View style={[styles.messageBubbleWrapper, isMe ? styles.myBubbleWrapper : styles.theirBubbleWrapper]}>
        <Surface style={[styles.messageBubble, isMe ? styles.myBubble : styles.theirBubble]} elevation={1}>
          <Text style={isMe ? styles.myText : styles.theirText}>{item.text}</Text>
          <Text style={[styles.timeLabel, isMe ? { color: 'rgba(255,255,255,0.7)' } : { color: '#94A3B8' }]}>
            {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </Text>
        </Surface>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
      />

      <Surface style={styles.inputContainer} elevation={4}>
        <TextInput
          placeholder="Type your message..."
          value={inputText}
          onChangeText={setInputText}
          mode="outlined"
          style={styles.input}
          outlineColor="#CBD5E1"
          activeOutlineColor="#F97316"
          dense
        />
        <IconButton
          icon="send"
          iconColor="#FFFFFF"
          size={22}
          onPress={handleSend}
          style={styles.sendButton}
        />
      </Surface>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  messageList: {
    padding: 16,
  },
  messageBubbleWrapper: {
    marginVertical: 4,
  },
  myBubbleWrapper: {
    alignItems: 'flex-end',
  },
  theirBubbleWrapper: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  myBubble: {
    backgroundColor: '#F97316',
    borderTopRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  myText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  theirText: {
    color: '#0F172A',
    fontSize: 14,
  },
  timeLabel: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#F97316',
    borderRadius: 22,
    marginLeft: 8,
  },
});
