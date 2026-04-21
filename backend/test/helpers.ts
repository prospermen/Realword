import fs from 'node:fs';
import path from 'node:path';
import type { AddressInfo } from 'node:net';

const backendDir = path.resolve(__dirname, '..');
const sourceDbPath = path.resolve(backendDir, 'prisma', 'dev.db');
const testDbPath = path.resolve(backendDir, 'test', 'test.db');
const testDbJournalPath = `${testDbPath}-journal`;
const databaseUrl = `file:${testDbPath.replace(/\\/g, '/')}`;

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'integration-test-secret';
process.env.DATABASE_URL = databaseUrl;

cleanupTestDatabaseFiles();
fs.copyFileSync(sourceDbPath, testDbPath);

let baseUrl = '';
let server: any = null;
let prisma: any;
let app: any;

export async function setupTestServer() {
  if (!app || !prisma) {
    const appModule = await import('../src/app');
    const dbModule = await import('../src/config/db');
    app = appModule.default;
    prisma = dbModule.prisma;
  }

  server = app.listen(0);
  await new Promise<void>((resolve) => {
    server!.once('listening', () => resolve());
  });
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
}

export async function resetDatabase() {
  await prisma.favorite.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.articleTag.deleteMany();
  await prisma.article.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();
}

export async function teardownTestServer() {
  if (server) {
    await new Promise<void>((resolve, reject) => {
      server!.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  await prisma.$disconnect();
  cleanupTestDatabaseFiles();
}

function cleanupTestDatabaseFiles() {
  for (const filePath of [testDbPath, testDbJournalPath]) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

export async function apiRequest(pathname: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);

  if (!headers.has('content-type') && typeof init.body === 'string') {
    headers.set('content-type', 'application/json');
  }

  return fetch(`${baseUrl}${pathname}`, {
    ...init,
    headers,
  });
}

export async function readJson<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

export function getBaseUrl() {
  return baseUrl;
}

export function authHeader(token: string) {
  return { Authorization: `Token ${token}` };
}
