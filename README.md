# ToughtNet - AI Knowledge Memory App

Your personal second brain powered by AI.

## Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in your MongoDB, Redis, OpenAI, Qdrant credentials in .env
npm run dev          # Terminal 1 - API server
npm run worker       # Terminal 2 - Background AI worker
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Browser Extension
1. Open Chrome -> Extensions -> Developer Mode ON
2. Load Unpacked -> select the `extension/` folder
3. Set your API URL in the popup (default: http://localhost:5000)

## API Endpoints

### Content
- POST   /api/content          - Save content
- GET    /api/content          - List all (filter by type, tag, category)
- GET    /api/content/:id      - Get one
- PUT    /api/content/:id      - Update
- DELETE /api/content/:id      - Delete
- PATCH  /api/content/:id/favorite  - Toggle favorite
- PATCH  /api/content/:id/archive   - Toggle archive
- GET    /api/content/stats         - Dashboard stats
- GET    /api/content/resurface     - Get forgotten memories

### Collections
- POST   /api/collections            - Create
- GET    /api/collections            - List all
- GET    /api/collections/:id        - Get one with items
- PUT    /api/collections/:id        - Update
- DELETE /api/collections/:id        - Delete
- POST   /api/collections/:id/add    - Add content to collection
- DELETE /api/collections/:id/remove/:contentId - Remove

### Search
- GET    /api/search?q=query         - Semantic + text search
- GET    /api/search/related/:id     - Related items
- GET    /api/search/tags            - All tags with counts
- GET    /api/search/graph           - Graph nodes and links

## Tech Stack
- Backend: Node.js, Express, MongoDB, BullMQ, Redis
- AI: OpenAI GPT-3.5 (tagging), text-embedding-3-small (vectors)
- Vector DB: Qdrant
- Frontend: React, Tailwind CSS, Framer Motion, D3.js
- Extension: Chrome Manifest V3
