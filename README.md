# plinplan (duaplan)

Aplikasi perencanaan keuangan dan kehidupan bersama untuk pasangan. Mencakup kalender bersama, rutinitas harian, pencatatan pengeluaran & pemasukan, tabungan & investasi, dan manajemen masalah.

## Struktur Monorepo

```
plinplan/
├── duaplan-web/     ← Frontend  (React 18 + TypeScript + Vite)
├── duaplan-api/     ← Backend   (Node.js + Express + TypeScript)
├── .gitignore
└── README.md
```

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Zustand, TanStack Query |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth (JWT + Google OAuth) |
| Real-time | Supabase Realtime (WebSocket) |
| Storage | Supabase Storage |
| Deploy FE | Vercel |
| Deploy BE | Render.com |

## Quick Start

### Prerequisites
- Node.js >= 20
- npm >= 10
- Akun Supabase

### Frontend

```bash
cd duaplan-web
cp .env.example .env
# isi nilai di .env
npm install
npm run dev
```

### Backend

```bash
cd duaplan-api
cp .env.example .env
# isi nilai di .env
npm install
npm run dev
```

## Environment Variables

Lihat masing-masing `.env.example` di `duaplan-web/` dan `duaplan-api/`.

## Dokumentasi

- [Architecture Document](.claude/skills/Architecture-duaplan.md)
- [PRD — Product Requirements](.claude/skills/PRD-duaplan.md)
