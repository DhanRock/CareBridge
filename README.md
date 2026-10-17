# CareBridge 🩺
## Preview

![CareBridge application screenshot](<img width="707" height="1068" alt="Screenshot 2026-10-17 151826" src="https://github.com/user-attachments/assets/340bcfae-c071-4543-b4d5-fee20af25eb5" />
)

**Making healthcare information easier to understand through AI and accessible design.**

## About

CareBridge is an AI-powered application designed to make complicated healthcare information easier to understand. Medical documents often contain complex terminology that can be difficult for people to interpret. CareBridge helps bridge this gap by turning medical text into clearer explanations.

The goal of CareBridge is to make healthcare information more approachable and accessible while helping users better understand the information they read.

## Features

- **Simple Language:** Converts complex medical text into easier-to-understand explanations.
- **Bullet-Point Summaries:** Organizes important information into concise bullet points.
- **Medical Term Explanations:** Helps users understand unfamiliar healthcare terminology.
- **Beginner-Friendly Mode:** Explains medical information for people without a medical background.
- **Healthcare Question Mode:** Provides educational explanations of general healthcare questions.
- **Text-to-Speech:** Reads explanations aloud with playback controls.
- **Accessibility Options:** Includes adjustable text sizes and a high-contrast setting.

## Technologies Used

- React
- TypeScript
- Vite
- Python
- FastAPI
- Ollama
- Llama 3.2

## How It Works

1. The user enters medical text or asks a general healthcare question.
2. The frontend sends the input to the Python FastAPI backend.
3. The backend prepares instructions for the locally running AI model through Ollama.
4. The AI generates an explanation in the selected style.
5. CareBridge displays the response so the user can read or listen to it.

## Running CareBridge Locally

### Prerequisites

Install the following:

- [Python](https://www.python.org/downloads/)
- [Node.js](https://nodejs.org/)
- [Ollama](https://ollama.com/)

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd CareBridge
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with the URL of this repository.

### 2. Set up the backend

From the project root, install the Python dependencies:

```bash
py -m pip install -r backend/requirements.txt
```

Download the AI model:

```bash
ollama pull llama3.2
```

Start the backend:

```bash
py -m uvicorn main:app --reload --app-dir backend
```

Keep this terminal running.

### 3. Set up the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed in the terminal, usually `http://localhost:5173`.

Make sure Ollama is running while using the AI features.

## Accessibility and Safety

CareBridge is designed to make healthcare information easier to understand through multiple explanation styles, adjustable text sizes, high contrast, and text-to-speech.

AI-generated explanations may contain errors or omit important context. Always verify important medical information with a qualified healthcare professional.

**CareBridge is an educational tool and does not replace professional medical advice, diagnosis, or treatment.** It should not be used to make medical decisions or change prescribed medication instructions.

## Project Purpose

CareBridge explores how artificial intelligence and accessible interface design can help address the challenge of understanding complex healthcare information.

## License

This project is available under the MIT License. See the `LICENSE` file for details.
