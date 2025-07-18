# DSaaS Platform

This project provides a simple Data Science as a Service platform. Users can upload a CSV file and interact with an AI assistant that suggests optimization models and trains them.

## Local Development

### Prerequisites
- Node.js 18+
- npm

### Install Dependencies

```bash
# from the repo root
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### Run the Backend

```bash
cd server
npm run build
node dist/server.js
```

The server listens on port `10000` by default.

### Run the Frontend

```bash
cd client
npm run dev
```

The Vite dev server will start on <http://localhost:3000>.

## Environment Variables

- `GROQ_API_KEY` – API key for the Groq model (backend)
- `VITE_API_URL` – URL of the backend API (frontend). Defaults to `http://localhost:10000` if not set.

