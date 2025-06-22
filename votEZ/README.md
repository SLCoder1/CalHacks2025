# votEZ - Your AI-Powered Voting Assistant 🗳️

votEZ is a comprehensive voting assistant app that helps users understand elections, candidates, and ballot measures through AI-powered conversations and simplified information presentation.

## 🌟 Features

### 🤖 AI Chatbot
- **Dual AI Modes**: 
  - **Current Display Mode**: Answers based on what you're currently viewing
  - **General Knowledge Mode**: Broader voting and election information
- **Context-Aware**: Understands your current page and provides relevant answers
- **Chat History**: Saves conversations per user with Supabase integration

### 👥 Candidate Information
- **Comprehensive Profiles**: Detailed candidate information with agendas and policy positions
- **Side-by-Side Comparison**: Compare two candidates directly
- **Multi-State Support**: Governor candidates for all US states
- **Presidential Candidates**: Information on presidential and vice-presidential candidates

### 📋 Ballot Measures
- **Simplified Propositions**: Complex ballot measures explained in simple terms
- **Bias Disclaimer**: Transparent about potential information bias
- **Easy Navigation**: Clear, accessible information presentation

### 🔐 User Management
- **Secure Authentication**: User login system with Supabase
- **Personalized Experience**: Chat history and preferences saved per user
- **Cross-Platform**: Works on iOS, Android, and Web

## 🛠️ Tech Stack

### Frontend
- **React Native** with **Expo SDK 53**
- **TypeScript** for type safety
- **Expo Router** for navigation
- **Supabase** for authentication and database
- **React Navigation** for UI components

### Backend
- **Python Flask** server
- **OpenAI API** for AI chatbot functionality
- **BeautifulSoup4** for web scraping
- **CORS** enabled for cross-platform access

## 📋 Prerequisites

Before setting up votEZ, make sure you have:

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **Git**

## 🚀 Setup Instructions

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd votEZ
```

### 2. Frontend Setup

#### Install Dependencies
```bash
npm install
```

#### Environment Configuration
Create a `.env` file in the root directory:
```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API URL (for local development)
EXPO_PUBLIC_API_URL=http://localhost:3001
```

### 3. Backend Setup

#### Navigate to Backend Directory
```bash
cd backend
```

#### Install Python Dependencies
```bash
pip install -r requirements.txt
```

#### Environment Configuration
Create a `.env` file in the `backend` directory:
```bash
# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=1
```

### 4. Database Setup (Supabase)

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and anon key

#### Run Database Schema
Execute the SQL schema in your Supabase SQL editor:

```sql
-- Chat Sessions Table
CREATE TABLE chat_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Messages Table
CREATE TABLE chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    ai_mode TEXT CHECK (ai_mode IN ('current-display', 'general-knowledge')),
    page_context JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policies
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies for chat_sessions
CREATE POLICY "Users can view their own chat sessions" ON chat_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat sessions" ON chat_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions" ON chat_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat sessions" ON chat_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for chat_messages
CREATE POLICY "Users can view messages from their sessions" ON chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_sessions 
            WHERE chat_sessions.id = chat_messages.session_id 
            AND chat_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages to their sessions" ON chat_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM chat_sessions 
            WHERE chat_sessions.id = chat_messages.session_id 
            AND chat_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update messages from their sessions" ON chat_messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM chat_sessions 
            WHERE chat_sessions.id = chat_messages.session_id 
            AND chat_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete messages from their sessions" ON chat_messages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM chat_sessions 
            WHERE chat_sessions.id = chat_messages.session_id 
            AND chat_sessions.user_id = auth.uid()
        )
    );
```

### 5. Data Setup

#### Candidate Data
The app uses candidate data from JSON files in the `data` directory:
- `Governers - Sheet1.json`: Governor candidates by state
- `Propositions 2024 - Sheet1.json`: Ballot measures

Make sure these files are present and properly formatted.

## 🏃‍♂️ Running the Application

### Development Mode

#### Option 1: Run Both Frontend and Backend Together
```bash
npm run dev
```

#### Option 2: Run Separately

**Backend (Terminal 1):**
```bash
cd backend
python app.py
```

**Frontend (Terminal 2):**
```bash
npm start
```

### Production Mode

#### Backend Deployment
```bash
cd backend
gunicorn app:app
```

#### Frontend Build
```bash
npm run build
```

## 📱 Using the App

### 1. Authentication
- Sign up or log in using the authentication system
- Your chat history will be saved and synced across devices

### 2. Navigation
- **Home**: Overview and main navigation
- **Candidates**: Browse and compare political candidates
- **Propositions**: View simplified ballot measures
- **Explore**: Additional voting resources

### 3. AI Chatbot
- **Current Display Mode**: Ask questions about what you're currently viewing
- **General Knowledge Mode**: Ask broader voting and election questions
- **Chat History**: View and manage your previous conversations

### 4. Candidate Comparison
1. Navigate to the Candidates tab
2. Select an office (Governor, President, etc.)
3. Choose a state (for governors)
4. Select up to 2 candidates to compare
5. View detailed side-by-side comparison

## 🔧 Configuration

### API Keys Required
- **OpenAI API Key**: For AI chatbot functionality
- **Supabase URL & Key**: For authentication and database

### Environment Variables
See the setup sections above for required environment variables.

## 🐛 Troubleshooting

### Common Issues

1. **Backend Connection Error**
   - Ensure the Flask server is running on port 3001
   - Check that `EXPO_PUBLIC_API_URL` is correctly set

2. **Supabase Connection Issues**
   - Verify your Supabase URL and anon key
   - Check that RLS policies are properly configured

3. **AI Chatbot Not Working**
   - Verify your OpenAI API key is valid
   - Check that the backend is receiving requests

4. **Build Errors**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`

## 📁 Project Structure

```
votEZ/
├── app/                    # Expo Router app directory
│   ├── (tabs)/            # Tab navigation screens
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Entry point
├── backend/               # Python Flask backend
│   ├── app.py            # Main Flask application
│   ├── requirements.txt  # Python dependencies
│   └── scraper.py        # Web scraping utilities
├── components/           # Reusable React components
│   ├── ChatBot.tsx      # AI chatbot component
│   ├── ChatHistory.tsx  # Chat history management
│   └── PageContext.tsx  # Page context provider
├── data/                # JSON data files
├── lib/                 # Utility libraries
│   ├── chatService.ts   # Chat service for Supabase
│   └── supabase.ts      # Supabase client configuration
└── config/              # Configuration files
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built for CalHacks 2025
- Uses OpenAI's GPT models for AI functionality
- Powered by Supabase for backend services
- Built with Expo and React Native

## 📞 Support

For support or questions:
- Create an issue in the repository
- Check the troubleshooting section above
- Review the Expo and React Native documentation

---

**Happy Voting! 🗳️** 