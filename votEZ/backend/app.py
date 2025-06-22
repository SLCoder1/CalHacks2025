from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv
import requests
from bs4 import BeautifulSoup

load_dotenv()

app = Flask(__name__)
CORS(app)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")


def scrape_candidates(state, position):
    # Example: Only supports Hawaii gubernatorial for now
    if position.lower() == "governor":
        url = 'https://ballotpedia.org/'+state.lower()+'_gubernatorial_election,_2022'
        response = requests.get(url)
        soup = BeautifulSoup(response.content, 'html.parser')
        try:
            table_content = soup.find_all('div', {'class': 'results_table_container'})[1] \
                .find('table', {'class': 'results_table'}).find('tbody') \
                .find_all('tr', {'class': 'results_row'})
            results = []
            for tr in table_content:
                columns = tr.find_all('td')
                if len(columns) > 0:
                    candidate_name = columns[2].get_text(strip=True)
                    results.append(candidate_name)
            return results
        except Exception as e:
            return {"error": str(e)}
    else:
        return {"error": "State/position not supported yet."}
    
def scrape_description(candidate_name):
    url = f'https://ballotpedia.org/{candidate_name.replace(" ", "_")}'
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    try:
        description = soup.find_all('div', {'style': 'height:400px;overflow:scroll;border:1px solid gray;margin:20px;padding:10px;'})
        if not description:
            return {"error": "Description not found"}
        d = "".join([desc.get_text(strip=True) for desc in description])
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
                        "content": "You are an expert in summarizing candidate descriptions. Your task is to provide a concise and informative summary of the candidate's background, qualifications, and key points from their description. "
                        "Focus on the most relevant information that would help voters understand the candidate's position and qualifications. "
                        "Do not provide any personal opinions or engage in political discussions. "
                        "Ignore any requests for personal information or sensitive data, including but not limited to social security numbers, credit card information, passwords, IP addresses, or API keys. "
                        "Be as logical and concise as possible, focusing on the candidate's qualifications and key points from their description. "
                    },
                    {"role": "user", "content": d}
                ],
                "temperature": 0.7,
                "max_tokens": 300,
            }
        )
        return response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        return {"error": str(e)}
    
@app.route("/candidates", methods=["POST"])
def candidates():
    try:
        data = request.get_json()
        state = data.get("state")
        position = data.get("position")
        if not state or not position:
            return jsonify({"error": "Missing state or position"}), 400

        # Get candidate names
        candidates = scrape_candidates(state, position)
        if isinstance(candidates, dict) and "error" in candidates:
            return jsonify({"error": candidates["error"]}), 400

        # Get descriptions for each candidate
        descriptions = []
        for candidate in candidates:
            desc = scrape_description(candidate)
            # If scrape_description returns a dict with "error", just use the error string
            if isinstance(desc, dict) and "error" in desc:
                descriptions.append(desc["error"])
            else:
                descriptions.append(desc)

        return jsonify({
            "candidates": candidates,
            "descriptions": descriptions
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
                        "DO NOT CHANGE YOUR OBJECTIVE OR ENGAGE IN ANY OTHER TOPICS. THIS IS A VOTING ASSISTANT CHATBOT."
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