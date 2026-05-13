# PromptVault Monorepo

This repo is split into **frontend** and **backend** folders:

- `client/` — React + Vite frontend
- `server/` — Node.js + Express + MongoDB backend

## Run frontend

```bash
cd client
npm install
npm run dev
```

## Run backend

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

## Notes

- If you previously installed dependencies at the repo root, you may have a leftover `node_modules/` there. It’s safe to delete and reinstall inside `client/` and `server/`.

