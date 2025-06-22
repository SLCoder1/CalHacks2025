import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Text, View, Alert } from 'react-native';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    const { error, data: { session }, } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    
    if (error) {
      Alert.alert('Login failed', error.message);
    } else if (session) {
      // Only redirect to home page if login is successful
      router.replace('/(tabs)');
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ThemedView style={styles.container} lightColor="#f8fbff" darkColor="#1a2633">
        <ThemedText type="title" style={styles.title}>
          Welcome to votEZ
        </ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#7bb6e8"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#7bb6e8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Log In'}</Text>
        </TouchableOpacity>
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/+not-found')}>
            <Text style={styles.signupLink}> Sign up</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8fbff',
  },
  title: {
    marginBottom: 32,
    color: '#1e90ff',
  },
  input: {
    width: '100%',
    maxWidth: 340,
    height: 48,
    borderColor: '#b3e0ff',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    color: '#1e90ff',
    fontSize: 16,
  },
  button: {
    width: '100%',
    maxWidth: 340,
    height: 48,
    backgroundColor: '#7bb6e8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  signupContainer: {
    flexDirection: 'row',
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupText: {
    color: '#0a7ea4',
    fontSize: 15,
  },
  signupLink: {
    color: '#1e90ff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});