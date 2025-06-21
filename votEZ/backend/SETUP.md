# Backend Setup Guide

## Current Status ✅
- Backend server is running on port 3001
- Health endpoint is working: http://localhost:3001/health
- Chat endpoint is ready: http://localhost:3001/chat

## What You Need to Do

### 1. Get a Groq API Key
1. Go to [Groq Console](https://console.groq.com/)
2. Sign up or log in
3. Create a new API key
4. Copy the API key

### 2. Configure the API Key
1. Open the `.env` file in the `backend` folder
2. Replace `your_groq_api_key_here` with your actual Groq API key:
   ```
   GROQ_API_KEY=gsk_your_actual_api_key_here
   ```

### 3. Restart the Backend
After updating the `.env` file, restart the backend:
```bash
cd votEZ/backend
python app.py
```

### 4. Test the Chat
Once configured, you can test the chat by:
1. Opening your app
2. Tapping the floating chat button (bottom right)
3. Typing a message like "How do I register to vote?"

## Troubleshooting

### If you get "GROQ_API_KEY not configured":
- Make sure the `.env` file exists in the backend folder
- Check that the API key is correctly formatted
- Restart the backend server

### If you get "Failed to connect to AI service":
- Check your internet connection
- Verify your Groq API key is valid
- Make sure you have credits in your Groq account

### If the chat button doesn't appear:
- Make sure the frontend is running: `npm start` in the votEZ folder
- Check that the ChatBot component is imported in `app/_layout.tsx`

## API Endpoints

- **Health Check**: `GET http://localhost:3001/health`
- **Chat**: `POST http://localhost:3001/chat`
  - Body: `{"message": "your question here"}`
  - Response: `{"response": "AI response here"}`

## Model Used
- **Groq Model**: `llama3-70b-8192`
- **Temperature**: 0.7 (balanced creativity)
- **Max Tokens**: 300 (concise responses) 