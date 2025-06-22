import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { getApiUrl } from '@/config/api';
import { usePageContext } from './PageContext';

const { width, height } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

type AIMode = 'current-display' | 'general-knowledge' | null;

// Custom color scheme for the chatbot
const chatColors = {
  primary: '#6366f1', // Indigo
  secondary: '#8b5cf6', // Purple
  accent: '#06b6d4', // Cyan
  background: '#ffffff',
  surface: '#f8fafc',
  text: '#1e293b',
  textLight: '#64748b',
  border: '#e2e8f0',
  userBubble: '#6366f1',
  botBubble: '#f1f5f9',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [aiMode, setAiMode] = useState<AIMode>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your voting assistant. Please select how you\'d like me to help you:\n\n📋 Current Display Info: I\'ll only use information from what you\'re currently viewing\n\n🧠 General Knowledge: I can use my broader knowledge to answer your questions',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const colorScheme = useColorScheme();
  const pageContext = usePageContext();

  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading || aiMode === null) return;

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
      const API_URL = getApiUrl();
      
      // Prepare request body
      const requestBody: any = {
        message: userMessage.text,
        aiMode: aiMode,
      };

      // Include page content if in current-display mode
      if (aiMode === 'current-display') {
        const pageContent = pageContext.getPageContentAsText();
        if (pageContent) {
          requestBody.pageContent = pageContent;
        }
      }

      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
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

  const selectAIMode = (mode: AIMode) => {
    setAiMode(mode);
    const modeMessage: Message = {
      id: Date.now().toString(),
      text: mode === 'current-display' 
        ? '📋 Mode selected: I\'ll focus on information from what you\'re currently viewing. How can I help you with the current content?' 
        : '🧠 Mode selected: I can use my general knowledge to answer your questions. What would you like to know?',
      isUser: false,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, modeMessage]);
  };

  const resetChat = () => {
    setAiMode(null);
    setMessages([
      {
        id: '1',
        text: 'Hello! I\'m your voting assistant. Please select how you\'d like me to help you:\n\n📋 Current Display Info: I\'ll only use information from what you\'re currently viewing\n\n🧠 General Knowledge: I can use my broader knowledge to answer your questions',
        isUser: false,
        timestamp: new Date(),
      },
    ]);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <TouchableOpacity
        style={[
          styles.floatingButton,
          { backgroundColor: chatColors.primary },
        ]}
        onPress={toggleChat}
        activeOpacity={0.8}
      >
        <Ionicons
          name={isOpen ? 'close' : 'chatbubble-ellipses'}
          size={24}
          color="white"
        />
      </TouchableOpacity>

      {/* Chat Overlay */}
      {isOpen && (
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: fadeAnim,
              backgroundColor: chatColors.overlay,
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
            backgroundColor: chatColors.background,
          },
        ]}
      >
        <View style={[styles.chatHeader, { backgroundColor: chatColors.primary }]}>
          <Text style={styles.chatHeaderText}>Voting Assistant</Text>
          <View style={styles.chatHeaderButtons}>
            <TouchableOpacity onPress={resetChat} style={styles.resetButton}>
              <Ionicons name="refresh" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleChat}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.isUser ? styles.userMessage : styles.botMessage,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  message.isUser
                    ? [styles.userBubble, { backgroundColor: chatColors.userBubble }]
                    : [styles.botBubble, { backgroundColor: chatColors.botBubble }],
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.isUser ? styles.userText : styles.botText,
                  ]}
                >
                  {message.text}
                </Text>
              </View>
            </View>
          ))}
          {isLoading && (
            <View style={[styles.messageContainer, styles.botMessage]}>
              <View style={[styles.messageBubble, styles.botBubble, { backgroundColor: chatColors.botBubble }]}>
                <Text style={[styles.messageText, styles.botText]}>Typing...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* AI Mode Selection Buttons */}
        {aiMode === null && (
          <View style={styles.modeSelectionContainer}>
            <TouchableOpacity
              style={[styles.modeButton, { backgroundColor: chatColors.primary }]}
              onPress={() => selectAIMode('current-display')}
            >
              <Ionicons name="document-text" size={20} color="white" />
              <Text style={styles.modeButtonText}>Current Display Info</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, { backgroundColor: chatColors.secondary }]}
              onPress={() => selectAIMode('general-knowledge')}
            >
              <Ionicons name="bulb" size={20} color="white" />
              <Text style={styles.modeButtonText}>General Knowledge</Text>
            </TouchableOpacity>
          </View>
        )}

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[styles.inputContainer, { borderTopColor: chatColors.border }]}
        >
          <TextInput
            style={[styles.textInput, { 
              backgroundColor: chatColors.surface,
              borderColor: chatColors.border,
              color: chatColors.text,
              opacity: aiMode === null ? 0.5 : 1,
            }]}
            value={inputText}
            onChangeText={setInputText}
            placeholder={aiMode === null ? "Select a mode first..." : "Type your message..."}
            placeholderTextColor={chatColors.textLight}
            multiline
            maxLength={500}
            onSubmitEditing={sendMessage}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === 'Enter') {
                sendMessage();
              }
            }}
            editable={aiMode !== null}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: chatColors.primary },
              (!inputText.trim() || isLoading || aiMode === null) && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading || aiMode === null}
          >
            <Ionicons
              name="send"
              size={20}
              color={(!inputText.trim() || isLoading || aiMode === null) ? chatColors.textLight : 'white'}
            />
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Animated.View>
    </>
  );
}
const isWeb = Platform.OS === 'web';

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 40,
    right: 40,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  overlayTouchable: {
    flex: 1,
  },
  chatWindow: {
    position: 'absolute',
    bottom: 40,
    right: 40,
    height: height * 0.7,
    width: isWeb ? width / 3 : width * 0.9,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 1001,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  chatHeaderText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  chatHeaderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetButton: {
    padding: 5,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  messagesContent: {
    paddingVertical: 10,
  },
  messageContainer: {
    marginVertical: 5,
    flexDirection: 'row',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  botMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  userBubble: {
    borderBottomRightRadius: 5,
  },
  botBubble: {
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userText: {
    color: 'white',
  },
  botText: {
    color: '#1e293b',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  modeSelectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    gap: 10,
  },
  modeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  modeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 