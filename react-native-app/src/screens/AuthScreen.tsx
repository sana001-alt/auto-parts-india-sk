import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, doc, setDoc, db } from '../services/firebase';
import BrandLogo from '../components/BrandLogo';

export default function AuthScreen({ navigation }: any) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        navigation.navigate('Home');
      } else {
        if (!name) {
          Alert.alert('Error', 'Please enter your full name');
          setLoading(false);
          return;
        }
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCred.user.uid), {
          id: userCred.user.uid,
          email,
          name,
          phone,
          createdAt: Date.now()
        });
        navigation.navigate('Home');
      }
    } catch (err: any) {
      Alert.alert('Auth Error', err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <BrandLogo size={64} style={styles.logo} />
          <Text variant="headlineMedium" style={styles.title}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {isLogin ? 'Sign in to buy & sell automotive spare parts' : 'Join India’s trusted automotive marketplace'}
          </Text>
        </View>

        <Surface style={styles.card} elevation={2}>
          {!isLogin && (
            <>
              <TextInput
                label="Full Name"
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={styles.input}
                outlineColor="#CBD5E1"
                activeOutlineColor="#F97316"
              />
              <TextInput
                label="Phone Number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                mode="outlined"
                style={styles.input}
                outlineColor="#CBD5E1"
                activeOutlineColor="#F97316"
              />
            </>
          )}

          <TextInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            mode="outlined"
            style={styles.input}
            outlineColor="#CBD5E1"
            activeOutlineColor="#F97316"
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            mode="outlined"
            style={styles.input}
            outlineColor="#CBD5E1"
            activeOutlineColor="#F97316"
          />

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.button}
            buttonColor="#F97316"
            textColor="#FFFFFF"
          >
            {isLogin ? 'Sign In' : 'Register Account'}
          </Button>

          <Button
            mode="text"
            onPress={() => setIsLogin(!isLogin)}
            style={styles.switchButton}
            textColor="#0F172A"
          >
            {isLogin ? "Don't have an account? <Text style={{color: '#F97316', fontWeight: 'bold'}}>Sign Up</Text>" : "Already have an account? Sign In"}
          </Button>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  input: {
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
  },
  button: {
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 6,
  },
  switchButton: {
    marginTop: 16,
  },
});
