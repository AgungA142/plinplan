# duaplan-api

Backend REST API untuk aplikasi duaplan — dibangun dengan Node.js, Express, dan TypeScript.

## Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Express.js + TypeScript
- **Database**: PostgreSQL via Supabase
- **Validation**: Zod
- **Testing**: Vitest + Supertest

## Setup

```bash
cp .env.example .env
# isi nilai di .env

npm install
npm run dev     # dev server di http://localhost:3000
npm run build   # compile TypeScript
npm test        # jalankan unit tests
npm run lint    # linting
```

## Health Check

```
GET http://localhost:3000/health
→ { "status": "ok" }
```

## Environment Variables

Lihat `.env.example` untuk daftar variabel yang dibutuhkan.
