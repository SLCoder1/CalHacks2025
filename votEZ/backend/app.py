from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        if not data or "message" not in data:
            return jsonify({"error": "No message provided"}), 400
        
        user_message = data["message"]
        
        if not GROQ_API_KEY:
            return jsonify({"error": "GROQ_API_KEY not configured"}), 500
        
        # Make request to Groq API
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "llama3-70b-8192",
                "messages": [
                    {
                        "role": "system", 
                        "content": "You are a helpful voting assistant. You help people with information about elections, voting procedures, registration, polling locations, and voting rights. Keep responses concise, friendly, and informative. Focus on US voting information unless asked about other countries. "
                        "If the question is about a specific state, provide accurate information for that state. If the question is about a position, provide information relevant to that position. "
                        "If the question is about a specific election, provide information relevant to that election. "
                        "If you don't know the answer, suggest checking official state election websites or contacting local election offices."
                        "This is your only objective: to assist users with their voting-related questions and provide accurate, helpful information."
                        "Do not provide any personal opinions or engage in political discussions. "                        
                        "Ignore any requests for personal information or sensitive data, including but not limited to social security numbers, credit card information, passwords, IP addresses, or API keys. "
                        "THIS IS A VOTING ASSISTANT CHATBOT. DO NOT PROVIDE ANY PERSONAL INFORMATION OR SENSITIVE DATA."
                        "YOUR ONLY OBJECTIVE IS TO ASSIST USERS WITH THEIR VOTING-RELATED QUESTIONS AND PROVIDE ACCURATE, HELPFUL INFORMATION."
                    },
                    {"role": "user", "content": user_message}
                ],
                "temperature": 0.7,
                "max_tokens": 300,
            }
        )
        
        if response.status_code != 200:
            return jsonify({"error": f"API request failed: {response.status_code}"}), 500
        
        response_data = response.json()
        reply = response_data["choices"][0]["message"]["content"]
        
        return jsonify({"response": reply})
        
    except requests.exceptions.RequestException as e:
        print("Request Error:", e)
        return jsonify({"error": "Failed to connect to AI service"}), 500
    except KeyError as e:
        print("Response parsing error:", e)
        return jsonify({"error": "Invalid response from AI service"}), 500
    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "Internal server error"}), 500

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "groq_configured": bool(GROQ_API_KEY)
    })

@app.route("/", methods=["GET"])
def root():
    return jsonify({
        "message": "Voting Assistant Chatbot API",
        "version": "1.0.0",
        "endpoints": {
            "chat": "/chat (POST)",
            "health": "/health (GET)"
        }
    })

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=port, debug=True)