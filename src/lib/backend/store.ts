// Server-only JSON file store. Works in local/Node dev (`bun run dev`) — this
// repo's Vite config defaults to a Cloudflare Workers build target, and
// Workers have no filesystem, so this store won't persist in that kind of
// production deploy. Fine for previewing the dashboard locally; swap for a
// real database (D1, Turso, etc.) before deploying for real.
import { promises as fs } from "node:fs";
import path from "node:path";

const DATA_DIR = path.resolve(process.cwd(), "data");

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readCollection<T>(name: string): Promise<T[]> {
  await ensureDataDir();
  const file = path.join(DATA_DIR, `${name}.json`);
  try {
    const raw = await fs.readFile(file, "utf-8");
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

async function writeCollection<T>(name: string, items: T[]): Promise<void> {
  await ensureDataDir();
  const file = path.join(DATA_DIR, `${name}.json`);
  await fs.writeFile(file, JSON.stringify(items, null, 2), "utf-8");
}

export async function listItems<T>(name: string): Promise<T[]> {
  return readCollection<T>(name);
}

export async function appendItem<T extends { id: string; createdAt: string }>(
  name: string,
  item: T,
): Promise<T> {
  const items = await readCollection<T>(name);
  items.unshift(item);
  await writeCollection(name, items);
  return item;
}

export async function deleteItem(name: string, id: string): Promise<void> {
  const items = await readCollection<{ id: string }>(name);
  await writeCollection(
    name,
    items.filter((i) => i.id !== id),
  );
}

export function makeId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
