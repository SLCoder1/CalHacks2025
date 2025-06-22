import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { chatService, ChatSession, ChatMessage } from '@/lib/chatService';

interface ChatHistoryProps {
  isVisible: boolean;
  onClose: () => void;
  onLoadSession: (session: ChatSession, messages: ChatMessage[]) => void;
}

export default function ChatHistory({ isVisible, onClose, onLoadSession }: ChatHistoryProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [sessionMessages, setSessionMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (isVisible) {
      loadSessions();
    }
  }, [isVisible]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const userSessions = await chatService.getSessions();
      setSessions(userSessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      Alert.alert('Error', 'Failed to load chat history.');
    } finally {
      setLoading(false);
    }
  };

  const loadSessionMessages = async (session: ChatSession) => {
    try {
      const messages = await chatService.getSessionMessages(session.id);
      setSessionMessages(messages);
      setSelectedSession(session);
    } catch (error) {
      console.error('Failed to load session messages:', error);
      Alert.alert('Error', 'Failed to load session messages.');
    }
  };

  const deleteSession = async (sessionId: string) => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this chat session? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await chatService.deleteSession(sessionId);
              await loadSessions();
              if (selectedSession?.id === sessionId) {
                setSelectedSession(null);
                setSessionMessages([]);
              }
            } catch (error) {
              console.error('Failed to delete session:', error);
              Alert.alert('Error', 'Failed to delete session.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getAIModeIcon = (mode: string) => {
    return mode === 'current-display' ? 'document-text' : 'bulb';
  };

  const getAIModeColor = (mode: string) => {
    return mode === 'current-display' ? '#6366f1' : '#8b5cf6';
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chat History</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#1e293b" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading chat history...</Text>
          </View>
        ) : (
          <View style={styles.content}>
            {/* Sessions List */}
            {!selectedSession && (
              <ScrollView style={styles.sessionsList}>
                {sessions.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="chatbubbles-outline" size={48} color="#ccc" />
                    <Text style={styles.emptyStateText}>No chat history yet</Text>
                    <Text style={styles.emptyStateSubtext}>Start a conversation to see it here</Text>
                  </View>
                ) : (
                  sessions.map((session) => (
                    <TouchableOpacity
                      key={session.id}
                      style={styles.sessionItem}
                      onPress={() => loadSessionMessages(session)}
                    >
                      <View style={styles.sessionHeader}>
                        <View style={styles.sessionInfo}>
                          <Ionicons
                            name={getAIModeIcon(session.ai_mode)}
                            size={20}
                            color={getAIModeColor(session.ai_mode)}
                          />
                          <Text style={styles.sessionName}>{session.session_name}</Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => deleteSession(session.id)}
                          style={styles.deleteButton}
                        >
                          <Ionicons name="trash-outline" size={16} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.sessionDate}>
                        {formatDate(session.updated_at)}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            )}

            {/* Session Messages */}
            {selectedSession && (
              <View style={styles.messagesContainer}>
                <View style={styles.messagesHeader}>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedSession(null);
                      setSessionMessages([]);
                    }}
                    style={styles.backButton}
                  >
                    <Ionicons name="arrow-back" size={20} color="#1e293b" />
                    <Text style={styles.backButtonText}>Back to Sessions</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      onLoadSession(selectedSession, sessionMessages);
                      onClose();
                    }}
                    style={styles.loadButton}
                  >
                    <Text style={styles.loadButtonText}>Load Session</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.messagesList}>
                  {sessionMessages.map((message) => (
                    <View
                      key={message.id}
                      style={[
                        styles.messageItem,
                        message.is_user ? styles.userMessage : styles.botMessage,
                      ]}
                    >
                      <Text style={styles.messageText}>{message.message_text}</Text>
                      <Text style={styles.messageTime}>
                        {formatDate(message.timestamp)}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  content: {
    flex: 1,
  },
  sessionsList: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
  },
  sessionItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 8,
  },
  deleteButton: {
    padding: 8,
  },
  sessionDate: {
    fontSize: 14,
    color: '#64748b',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 8,
  },
  loadButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  loadButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  messagesList: {
    flex: 1,
    padding: 16,
  },
  messageItem: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
  },
  userMessage: {
    backgroundColor: '#f1f5f9',
    alignSelf: 'flex-end',
    marginLeft: 40,
  },
  botMessage: {
    backgroundColor: '#f8fafc',
    alignSelf: 'flex-start',
    marginRight: 40,
  },
  messageText: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
}); 