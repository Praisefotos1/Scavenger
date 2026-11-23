/**
 * #1159 / #1786: Application configuration — the single source of truth for all
 * environment variable reads in the indexer process.
 *
 * Rules:
 *  - Every `process.env` access must live in `src/config/` (enforced by the
 *    `no-restricted-syntax` ESLint rule and tests/no-direct-process-env.test.ts).
 *  - Variables are declared once in `configSchema` (typed, with defaults) and
 *    parsed by `loadConfig()`.
 *  - Other modules import the exported `config` object.
 *  - `validateConfig()` is called at startup: it throws if required vars are
 *    missing and warns about values that were rejected and replaced by defaults.
 *
 * ## Environment variables
 *
 * ### Required
 * | Variable         | Description                                  |
 * |------------------|----------------------------------------------|
 * | `DATABASE_URL`   | PostgreSQL connection string                 |
 * | `STELLAR_RPC_URL`| Soroban / Stellar RPC endpoint               |
 * | `CONTRACT_ID`    | Deployed Soroban contract address            |
 *
 * ### Optional (invalid or out-of-range values fall back to the default)
 * | Variable                  | Default  | Description                        |
 * |---------------------------|----------|------------------------------------|
 * | `STELLAR_NETWORK`         | testnet  | Stellar network identifier         |
 * | `LOG_LEVEL`               | info     | Logging verbosity                  |
 * | `LOG_FORMAT`              | json     | `json` or `pretty`                 |
 * | `API_PORT`                | 3001     | HTTP API server port (0-65535)     |
 * | `API_HOST`                | 0.0.0.0  | HTTP API server bind address       |
 * | `START_LEDGER`            | 0        | Ledger sequence to start from      |
 * | `POLL_INTERVAL_MS`        | 5000     | Stellar poll interval (ms, >= 1)   |
 * | `DB_MAX_CONNECTIONS`      | 20       | Connection pool max size           |
 * | `DB_MIN_CONNECTIONS`      | 2        | Connection pool min size           |
 * | `DB_IDLE_TIMEOUT`         | 30000    | Idle connection timeout (ms)       |
 * | `DB_IDLE_TIMEOUT_MS`      | 30000    | Alias for DB_IDLE_TIMEOUT          |
 * | `DB_CONNECTION_TIMEOUT_MS`| 5000     | Acquire connection timeout (ms)    |
 * | `DB_STATEMENT_TIMEOUT_MS` | 30000    | Query statement timeout (ms)       |
 * | `SLOW_QUERY_THRESHOLD`    | 100      | Log queries slower than N ms       |
 * | `BATCH_SIZE`              | 100      | Event processing batch size (>= 1) |
 */

import { int, oneOf, parseSchema, str } from './env-schema';
import type { EnvIssue, EnvSource } from './env-schema';

const DEFAULT_DATABASE_URL = 'postgresql://localhost/scavenger';
const DEFAULT_RPC_URL = 'https://soroban-testnet.stellar.org';

export const LOG_FORMATS = ['json', 'pretty'] as const;
export type LogFormat = (typeof LOG_FORMATS)[number];

const NON_NEGATIVE = { min: 0 };

export const configSchema = {
  database: {
    url: str('DATABASE_URL', DEFAULT_DATABASE_URL),
    maxConnections: int('DB_MAX_CONNECTIONS', 20, NON_NEGATIVE),
    minConnections: int('DB_MIN_CONNECTIONS', 2, NON_NEGATIVE),
    // Support both naming conventions; DB_IDLE_TIMEOUT_MS takes precedence
    idleTimeoutMs: int(['DB_IDLE_TIMEOUT_MS', 'DB_IDLE_TIMEOUT'], 30000, NON_NEGATIVE),
    connectionTimeoutMs: int('DB_CONNECTION_TIMEOUT_MS', 5000, NON_NEGATIVE),
    statementTimeoutMs: int('DB_STATEMENT_TIMEOUT_MS', 30000, NON_NEGATIVE),
  },
  stellar: {
    network: str('STELLAR_NETWORK', 'testnet'),
    rpcUrl: str('STELLAR_RPC_URL', DEFAULT_RPC_URL),
    contractId: str('CONTRACT_ID', ''),
  },
  logging: {
    level: str('LOG_LEVEL', 'info'),
    format: oneOf('LOG_FORMAT', LOG_FORMATS, 'json'),
  },
  performance: {
    slowQueryThreshold: int('SLOW_QUERY_THRESHOLD', 100, NON_NEGATIVE),
    batchSize: int('BATCH_SIZE', 100, { min: 1 }),
  },
  server: {
    apiPort: int('API_PORT', 3001, { min: 0, max: 65535 }),
    apiHost: str('API_HOST', '0.0.0.0'),
  },
  indexer: {
    startLedger: int('START_LEDGER', 0, NON_NEGATIVE),
    pollIntervalMs: int('POLL_INTERVAL_MS', 5000, { min: 1 }),
  },
};

/** Parse a configuration object from an environment (pure; does not read process.env). */
export function loadConfig(env: EnvSource = process.env) {
  return parseSchema(configSchema, env);
}

const loaded = loadConfig();

export const config = loaded.value;
export type Config = typeof config;

/** Values that were rejected at load time and replaced by their defaults. */
export const configIssues: readonly EnvIssue[] = loaded.issues;

/**
 * Validates that all required environment variables are present.
 * Throws an `Error` at startup if any required variable is missing, and warns
 * about optional values that were invalid and replaced by defaults.
 */
export function validateConfig(): void {
  if (!config.stellar.contractId) {
    throw new Error(
      'CONTRACT_ID environment variable is required. ' +
      'Set it to the deployed Soroban contract address.',
    );
  }
  if (!config.database.url || config.database.url === DEFAULT_DATABASE_URL) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        'DATABASE_URL environment variable is required. ' +
        'Set it to a PostgreSQL connection string.',
      );
    }
  }
  for (const issue of configIssues) {
    console.warn(`[config] ${issue.variable}: ${issue.message}`);
  }
}
