import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { validateJWT } from './middleware/validateJWT';
import { attachUser } from './middleware/attachUser';
import { errorHandler } from './middleware/errorHandler';
import healthRouter from './routes/health';

const app = express();
const PORT = process.env.PORT ?? 3000;

// ── Global middleware ──────────────────────────────────────────
app.use(cors());
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);
app.use(express.json());

// ── Public routes ──────────────────────────────────────────────
app.use('/health', healthRouter);

// ── Auth middleware (applies to all routes below) ──────────────
app.use(validateJWT);
app.use(attachUser);

// ── Protected routes ───────────────────────────────────────────
// (future route modules go here)

// ── Global error handler ───────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`duaplan-api running on http://localhost:${PORT}`);
});

export default app;
