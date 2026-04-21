import path from 'node:path';

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function parsePort(value: string | undefined): number {
  if (!value) {
    return 3000;
  }

  const port = Number(value);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`Invalid PORT value: ${value}`);
  }

  return port;
}

function parseNodeEnv(value: string | undefined): 'development' | 'test' | 'production' {
  if (!value) {
    return 'development';
  }

  if (value === 'development' || value === 'test' || value === 'production') {
    return value;
  }

  throw new Error(`Invalid NODE_ENV value: ${value}`);
}

function parsePositiveInt(value: string | undefined, fallback: number, name: string) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid ${name} value: ${value}`);
  }

  return parsed;
}

function parseLogLevel(value: string | undefined): 'debug' | 'info' | 'warn' | 'error' {
  if (!value) {
    return 'info';
  }

  if (value === 'debug' || value === 'info' || value === 'warn' || value === 'error') {
    return value;
  }

  throw new Error(`Invalid LOG_LEVEL value: ${value}`);
}

function parseOptionalString(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function parseTrustProxy(value: string | undefined): boolean | number | string {
  const trimmed = value?.trim();

  if (!trimmed || trimmed === 'false') {
    return false;
  }

  if (trimmed === 'true') {
    return true;
  }

  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed);
  }

  return trimmed;
}

function parseCorsOrigins(value: string | undefined) {
  const trimmed = value?.trim();

  if (!trimmed || trimmed === '*') {
    return '*' as const;
  }

  const origins = trimmed
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    throw new Error(`Invalid CORS_ORIGIN value: ${value}`);
  }

  return origins;
}

export const env = {
  PORT: parsePort(process.env.PORT),
  JWT_SECRET: requireEnv('JWT_SECRET'),
  NODE_ENV: parseNodeEnv(process.env.NODE_ENV),
  LOG_LEVEL: parseLogLevel(process.env.LOG_LEVEL),
  RATE_LIMIT_WINDOW_MS: parsePositiveInt(
    process.env.RATE_LIMIT_WINDOW_MS,
    60_000,
    'RATE_LIMIT_WINDOW_MS'
  ),
  RATE_LIMIT_MAX_REQUESTS: parsePositiveInt(
    process.env.RATE_LIMIT_MAX_REQUESTS,
    20,
    'RATE_LIMIT_MAX_REQUESTS'
  ),
  CORS_ORIGINS: parseCorsOrigins(process.env.CORS_ORIGIN),
  TRUST_PROXY: parseTrustProxy(process.env.TRUST_PROXY),
  PUBLIC_APP_URL: parseOptionalString(process.env.PUBLIC_APP_URL),
  UPLOADS_DIR: path.resolve(parseOptionalString(process.env.UPLOADS_DIR) ?? './public/uploads'),
};
