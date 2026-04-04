# 🧠 ThoughtNet – Your AI-Powered Second Brain

> **ToughtNet** is a state-of-the-art Personal Knowledge Management (PKM) platform that captures, summarizes, and connects everything you know. Seamlessly bridge your digital consumption with your memory using cutting-edge AI.

---

## 🚀 Core Features

### 🌍 Omni-Channel Capture
*   **One-Click Saving:** Captured directly into your private brain from Articles, YouTube videos (with automatic metadata), X/Twitter threads, and PDFs.
*   **Custom Chrome Extension:** Save any page browsing session without leaving your current tab.

### 🤖 AI Engine (Google Gemini)
*   **Automatic Summarization:** Every item you save is processed by Google Gemini Flash to generate concise, human-like summaries.
*   **Key Insights:** Automatically extracts the 3-5 most critical takeaways so you don't have to re-read original long-form content.
*   **Semantic Tagging:** Smart tags are generated based on the *meaning* of the content, not just keywords.

### 🔗 Semantic Connectivity (Qdrant)
*   **Concept-Based Search:** Uses the **Qdrant Vector Database** to find information based on conceptual themes, not just text matching.
*   **Deep Relationships:** Automatically suggests related notes from your history that share conceptual bridges.

### 🕸️ Interactive Knowledge Graph
*   **3D Discovery:** A beautiful, real-time visual map displaying how your ideas, tags, and collections are interconnected.
*   **Visual Exploration:** Click through nodes to rediscover hidden patterns in your data.

### 📊 Smart Dashboard
*   **Resurfaced Memories:** Intelligent algorithm to re-introduce "forgotten" knowledge to the surface to reinforce long-term learning.
*   **Real-time Analytics:** Track your learning streak, top tags, and content breakdown at a glance.

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, Framer Motion, GSAP (Physics).
- **Backend:** Node.js, Express, BullMQ (Task Queuing).
- **Database:** MongoDB (Metadata), Qdrant (Vector/Semantic Search).
- **AI:** Google Gemini 1.5 Flash (LLM), Vector Embeddings.
- **Hosting:** Vercel (Front) & Render (Back).

---

## 📦 Installation Guide

### Prerequisites
- **Node.js** (v18+)
- **MongoDB** (Atlas or Local)
- **Redis** (For background worker queue)
- **Google Gemini API Key**
- **Qdrant URL & API Key** (Cloud or Local)

### 1. Clone & Setup Backend
```bash
cd backend
npm install
```
Create a `.env` file in `backend/`:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
REDIS_URL=your_redis_url
GEMINI_API_KEY=your_gemini_key
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_key
FRONTEND_URL=http://localhost:5173
```
Run Backend: `npm run dev`

### 2. Setup Frontend
```bash
cd ../frontend
npm install
```
Create a `.env` file in `frontend/`:
```env
VITE_BACKEND_URL=http://localhost:5000/api
```
Run Frontend: `npm run dev`

### 3. Setup Chrome Extension
1. Open Chrome and go to `chrome://extensions/`.
2. Enable **Developer Mode** (top-right).
3. Click **Load unpacked** and select the `/extension` folder from this project.
4. Click the ToughtNet icon in your browser and enter your **Backend URL** (e.g., `https://your-api.onrender.com`).

---

## 📖 How to Use
1. **Register** an account on the ThoughtNet web app.
2. **Install the Extension** and log in through the main app first.
3. **Save Content:** Click the ToughtNet icon while browsing any webpage or YouTube video.
4. **AI Processing:** Wait a few seconds while the AI summarizes and tags your content in the background.
5. **Explore:** Visit your **Dashboard** to see the summary, insights, and the interactive **Knowledge Graph**.

---

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more information.

---

*Built with ❤️ by [Uday Vaidya]*
