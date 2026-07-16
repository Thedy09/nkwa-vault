#!/usr/bin/env node
/**
 * Vérifie la connexion PostgreSQL / Supabase via Prisma.
 * Usage: node scripts/check-db.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const { getConnectionStatus, closeConnection } = require('../src/config/database');

async function main() {
  const status = await getConnectionStatus();
  console.log(JSON.stringify(status, null, 2));

  await closeConnection();
  process.exit(status.connected ? 0 : 1);
}

main().catch(async (error) => {
  console.error(JSON.stringify({ connected: false, error: error.message }, null, 2));
  try {
    await closeConnection();
  } catch (_) {
    // ignore
  }
  process.exit(1);
});
