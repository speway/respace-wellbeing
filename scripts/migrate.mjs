import { pool, auth } from '../server/auth.ts';
import { getMigrations } from 'better-auth/db/migration';
const migrations=await getMigrations(auth.options);
await migrations.runMigrations();
await pool.query(`CREATE TABLE IF NOT EXISTS respace_progress (
  user_id text PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  payload jsonb NOT NULL,
  revision integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
)`);
console.log('Auth and progress schema ready.');
await pool.end();
