import google.generativeai as genai
from config import settings

class GeminiService:
    def __init__(self):
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel("gemini-3.5-flash")
        else:
            self.model = None


    def chat(self, system_prompt: str, history: list, user_message: str) -> str:
        if not self.model:
            return "AI Chatbot is not configured (missing GEMINI_API_KEY)."

        formatted_history = [
            {"role": "user", "parts": [system_prompt]},
            {"role": "model", "parts": ["Understood. I am ready to help students."]},
        ]

        for h in history:
            formatted_history.append({
                "role": h["role"],
                "parts": [h["content"]]
            })

        try:
            chat = self.model.start_chat(history=formatted_history)
            response = chat.send_message(user_message)
            return response.text
        except Exception as e:
            return f"Error connecting to AI: {str(e)}"
