import { Image } from 'expo-image';
import { StyleSheet, TouchableOpacity, View, ScrollView, TextInput, Text, Animated, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const { width, height } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function HomeScreen() {
  const router = useRouter();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your voting assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isChatOpen) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isChatOpen]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.text,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <ThemedView
      style={{ flex: 1 }}
      lightColor="#FFFFFF"
      darkColor="#FFFFFF"
    >
      <ScrollView>
        <View style={styles.container}>
          <Image
            source={require('@/assets/images/votEZ logo.png')}
            style={styles.logo}
          />

          {/* Introduction */}
          <View style={{ marginBottom: 32, paddingHorizontal: 24 }}>
            <Text style={{ fontSize: 16, color: '#0a7ea4', textAlign: 'center', fontWeight: '500' }}>
              We help you understand elections with simple words, clear pictures, and voice guidance.
              {"\n"}No reading needed — just tap, listen, and learn.
            </Text>
          </View>

          {/* Candidates Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/(tabs)/candidates')}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Candidates</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button}>
            <ThemedText style={styles.buttonText}>Simplified Propositions</ThemedText>
          </TouchableOpacity>

          {/* Bias Disclaimer below "Simplified Propositions" */}
          <View
            style={{
              color: 'white',
              backgroundColor: 'white',
              fontSize: 14,
              textAlign: 'center',
              marginTop: 8,
              padding: 10,
              borderRadius: 6,
              width: '90%',
            }}
          >
            <Text style={{ color: '#0a7ea4', fontSize: 14, textAlign: 'center' }}>
              <Text style={{ fontWeight: 'bold' }}>Bias Disclaimer:{"\n"}</Text>
              We strive to present information as neutrally as possible. However, some bias may remain. Please use multiple sources to make your decisions.
            </Text>
          </View>
        </View>
      </ScrollView>
      <View style={styles.footerContainer}>
        <ThemedText style={styles.disclaimer}>
        </ThemedText>
      </View>

      {/* Floating Chat Button */}
      {/* <TouchableOpacity style={styles.floatingChatButton} onPress={toggleChat}>
        <ThemedText style={styles.floatingChatText}>?</ThemedText>
      </TouchableOpacity> */}

      {/* Chat Overlay */}
      {isChatOpen && (
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: fadeAnim,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
            },
          ]}
        >
          <TouchableOpacity
            style={styles.overlayTouchable}
            onPress={toggleChat}
            activeOpacity={1}
          />
        </Animated.View>
      )}

      {/* Chat Window */}
      <Animated.View
        style={[
          styles.chatWindow,
          {
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [height, 0],
                }),
              },
            ],
            opacity: fadeAnim,
            backgroundColor: '#ffffff',
          },
        ]}
      >
        <KeyboardAvoidingView
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Chat Header */}
          <View style={styles.chatHeader}>
            <Text style={styles.chatTitle}>Voting Assistant</Text>
            <TouchableOpacity onPress={toggleChat} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#1e293b" />
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageBubble,
                  message.isUser ? styles.userMessage : styles.botMessage,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.isUser ? styles.userMessageText : styles.botMessageText,
                  ]}
                >
                  {message.text}
                </Text>
              </View>
            ))}
            {isLoading && (
              <View style={[styles.messageBubble, styles.botMessage]}>
                <Text style={[styles.messageText, styles.botMessageText]}>
                  Typing...
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your message..."
              placeholderTextColor="#64748b"
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              <Ionicons
                name="send"
                size={20}
                color={inputText.trim() ? '#ffffff' : '#64748b'}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  logo: {
    height: 160,
    width: 300,
    resizeMode: 'contain',
    marginBottom: 0,
    marginTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    color: '#007AFF',
    textAlign: 'center',
    fontFamily: '',
    fontSize: 30,
  },
  button: {
    backgroundColor: '#7bb6e8',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  footerContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  disclaimer: {
    textAlign: 'center',
    color: 'grey',
  },
  floatingChatButton: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingChatText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  chatWindow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: '70%',
  },
  chatContainer: {
    flex: 1,
    padding: 16,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chatTitle: {
    color: '#1e293b',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
    maxHeight: '75%',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  userMessage: {
    backgroundColor: '#f3f4f6',
  },
  botMessage: {
    backgroundColor: '#007AFF',
  },
  messageText: {
    color: '#1e293b',
    fontSize: 16,
  },
  userMessageText: {
    color: '#1e293b',
  },
  botMessageText: {
    color: '#FFFFFF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  textInput: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 12,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#f3f4f6',
  },
});
