import { PrismaClient } from "@/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// The Neon serverless driver speaks WebSocket, which Node.js doesn't provide
// natively (unlike edge/browser runtimes) — wire in the `ws` package. This
// (rather than the HTTP-only adapter) is required because the app relies on
// Prisma upserts/transactions, which Neon's HTTP mode does not support.
neonConfig.webSocketConstructor = ws;

declare global {
  var __prisma: PrismaClient | undefined;
}

function createClient() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const db = globalThis.__prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = db;
}
