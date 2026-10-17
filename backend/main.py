
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI(title="CareBridge")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STYLES = {
    "simple": """
Use everyday English and short, clear sentences.
Explain the original information in plain language.
""",
    "bullets": """
Organize the explanation into concise bullet points.
Highlight the main ideas and important instructions.
Keep related information together.
""",
    "terms": """
Focus on identifying difficult medical terms.
For each term, provide its meaning in plain English
and explain how it is used in the supplied text.
Also preserve any important instructions and warnings.
""",
    "beginner": """
Explain the information for someone unfamiliar with
healthcare. Introduce unfamiliar concepts clearly,
provide helpful context, and avoid unnecessary jargon.
""",
}


@app.get("/")
def home():
    return {"message": "CareBridge is running!"}


@app.post("/simplify")
def simplify(data: dict):
    text = data.get("text", "").strip()
    mode = data.get("mode", "simplify")
    style = data.get("style", "simple")

    if not text:
        return {
            "error": "Please enter some healthcare information."
        }

    if mode == "question":
        task = """
Answer the user's general healthcare question in simple,
easy-to-understand language.

Rules:
- Provide educational information, not a diagnosis.
- Do not prescribe treatment or recommend medication changes.
- Explain medical terms clearly.
- Do not invent facts.
- If the question needs personal medical advice, explain
  that a qualified healthcare professional can help.
- If symptoms suggest an emergency, advise seeking emergency help.
- Keep the answer focused on the question.
"""
    else:
        if style not in STYLES:
            style = "simple"

        task = f"""
Simplify the healthcare text for educational purposes.

Selected explanation style:
{STYLES[style]}

Return these four sections:

SIMPLE EXPLANATION:
Explain the information using the selected style.

IMPORTANT INSTRUCTIONS:
List important instructions without changing their meaning.
If none are provided, say so.

MEDICAL TERMS:
Explain difficult terms simply.

QUESTIONS TO ASK A HEALTHCARE PROFESSIONAL:
Suggest useful clarification questions.

Safety rules:
- Preserve the original meaning.
- Never change medication doses, timing, or instructions.
- Do not diagnose or recommend treatment.
- Do not invent facts or remove important warnings.
- If something is unclear, say it is unclear.
- If a term or instruction is ambiguous, do not guess.
"""

    prompt = f"""
You are CareBridge, an assistant that makes healthcare
information easier to understand.

{task}

User input:
{text}
"""

    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3.2",
                "prompt": prompt,
                "stream": False,
            },
            timeout=180,
        )
        response.raise_for_status()
        result = response.json()

        return {
            "original": text,
            "result": result["response"],
        }

    except requests.exceptions.ConnectionError:
        return {
            "error": "Ollama is not running. Open Ollama and try again."
        }

    except requests.exceptions.Timeout:
        return {
            "error": "The AI took too long. Please try again."
        }

    except Exception:
        return {
            "error": "Something went wrong. Check that Ollama is running."
        }
