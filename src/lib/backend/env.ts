// Ensures OS env + local `.env` are loaded on plain Node runtimes (e.g.
// `vite dev`, where Vite does not populate process.env from `.env`).
// Vercel/production already inject env — there this is a silent no-op.

let loaded = false;

export async function ensureEnv(): Promise<void> {
  if (loaded) return;
  loaded = true;
  try {
    await import("dotenv/config");
  } catch {
    // dotenv unavailable or no .env file — platform env is used as-is.
  }
}
