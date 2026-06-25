declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string | null;
      user?: Record<string, unknown>;
    }
  }
}

export {};
