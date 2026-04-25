# 🎙️ AI Meeting Assistant

An intelligent real-time meeting assistant that helps users actively participate in conversations by generating smart suggestions, tracking transcripts, and enabling interactive chat.

---

## 🚀 Features

* 🎤 **Live Speech-to-Text Transcript**

  * Records and converts speech into real-time text.

* 💡 **AI-Powered Suggestions**

  * Generates 3 types of suggestions:

    * **Answer** → What you can say
    * **Question** → What you can ask
    * **Insight** → Hidden observations

* 💬 **Interactive Chat Panel**

  * Click suggestions to instantly send them into chat.
  * Ask custom questions based on conversation.

* 📄 **Export Functionality**

  * Export transcript, suggestions, and chat as JSON.

* ⚡ **Real-Time Experience**

  * Suggestions update dynamically as conversation progresses.

---

## 🏗️ Tech Stack

* **Frontend:** React (Next.js), Tailwind CSS
* **Backend:** Next.js API Routes
* **AI Model:** Groq API (LLM-based suggestions)
* **Speech Recognition:** Web Speech API

---

## 📂 Project Structure

```
/src
 ├── /app
 │   ├── page.js              # Main UI
 │   ├── /api
 │   │   ├── suggestions      # AI suggestion API
 │   │   ├── chat             # Chat API
 │   │   ├── transcribe       # Speech-to-text API
 │
 ├── /hooks
 │   ├── useMic.js            # Microphone + transcript logic
 │
 ├── /lib
 │   ├── getSuggestions.js    # Fetch suggestions
 │   ├── chat.js              # Chat handler
```

---

## 🔑 Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-link>
cd <your-project>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the project

```bash
npm run dev
```

---

## 🔐 API Key Setup

This project uses **Groq API**.

* Enter your API key in the input field at the top of the app
* The key is stored locally in your browser (`localStorage`)
* It is used for generating suggestions and chat responses

---

## 🧠 How It Works

1. User speaks → transcript updates in real time
2. Transcript is sent to AI
3. AI returns 3 structured suggestions:

   * Answer
   * Question
   * Insight
4. User clicks suggestion → goes to chat
5. Chat response generated using full context

---

## 🎯 Use Cases

* 📌 Meetings & Discussions
* 📌 Interview Preparation
* 📌 Public Speaking Assistance
* 📌 Brainstorming Sessions

---

## ⚠️ Notes

* Ensure microphone permissions are enabled
* Suggestions depend on conversation quality
* API key must be valid for AI features to work

---

## 📌 Future Improvements

* 🔄 Streaming suggestions
* 📊 Analytics on conversations
* 🎯 Mode switching (Interview / Business / Debate)
* 📱 Mobile responsiveness improvements

---

## 👨‍💻 Author

**Onkesh Gupta**