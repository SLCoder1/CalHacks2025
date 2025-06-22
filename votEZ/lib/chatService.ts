import { supabase } from './supabase';

export interface ChatSession {
  id: string;
  user_id: string;
  session_name: string;
  ai_mode: 'current-display' | 'general-knowledge';
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  message_text: string;
  is_user: boolean;
  timestamp: string;
  ai_mode: 'current-display' | 'general-knowledge';
  page_content?: string;
  page_metadata?: any;
}

export interface CreateSessionParams {
  session_name?: string;
  ai_mode: 'current-display' | 'general-knowledge';
}

export interface SaveMessageParams {
  session_id: string;
  message_text: string;
  is_user: boolean;
  ai_mode: 'current-display' | 'general-knowledge';
  page_content?: string;
  page_metadata?: any;
}

class ChatService {
  // Get current user
  private async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      throw new Error('User not authenticated');
    }
    return user;
  }

  // Create a new chat session
  async createSession(params: CreateSessionParams): Promise<ChatSession> {
    const user = await this.getCurrentUser();
    
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: user.id,
        session_name: params.session_name || 'Chat Session',
        ai_mode: params.ai_mode,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create session: ${error.message}`);
    }

    return data;
  }

  // Get all chat sessions for the current user
  async getSessions(): Promise<ChatSession[]> {
    const user = await this.getCurrentUser();
    
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch sessions: ${error.message}`);
    }

    return data || [];
  }

  // Get messages for a specific session
  async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }

    return data || [];
  }

  // Save a message to a session
  async saveMessage(params: SaveMessageParams): Promise<ChatMessage> {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        session_id: params.session_id,
        message_text: params.message_text,
        is_user: params.is_user,
        ai_mode: params.ai_mode,
        page_content: params.page_content,
        page_metadata: params.page_metadata,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save message: ${error.message}`);
    }

    // Update the session's updated_at timestamp
    await supabase
      .from('chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', params.session_id);

    return data;
  }

  // Delete a chat session
  async deleteSession(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from('chat_sessions')
      .update({ is_active: false })
      .eq('id', sessionId);

    if (error) {
      throw new Error(`Failed to delete session: ${error.message}`);
    }
  }

  // Rename a chat session
  async renameSession(sessionId: string, newName: string): Promise<void> {
    const { error } = await supabase
      .from('chat_sessions')
      .update({ session_name: newName })
      .eq('id', sessionId);

    if (error) {
      throw new Error(`Failed to rename session: ${error.message}`);
    }
  }

  // Get the most recent active session for the current user
  async getCurrentSession(): Promise<ChatSession | null> {
    const user = await this.getCurrentUser();
    
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw new Error(`Failed to fetch current session: ${error.message}`);
    }

    return data;
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  }
}

export const chatService = new ChatService(); 