/**
 * Métadonnées publiques du projet Supabase Nkwa Vault.
 * Les secrets (password DB, service role) restent dans les variables d'environnement.
 */
const SUPABASE_PROJECT_REF =
  process.env.SUPABASE_PROJECT_REF || 'umbzegdpebbfatrwozvp';

const SUPABASE_URL =
  process.env.SUPABASE_URL || `https://${SUPABASE_PROJECT_REF}.supabase.co`;

function getSupabaseConfig() {
  return {
    projectRef: SUPABASE_PROJECT_REF,
    url: SUPABASE_URL,
    anonKeyConfigured: Boolean(process.env.SUPABASE_ANON_KEY),
    serviceRoleConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    databaseUrlConfigured: Boolean(process.env.DATABASE_URL),
    directUrlConfigured: Boolean(process.env.DIRECT_URL)
  };
}

module.exports = {
  SUPABASE_PROJECT_REF,
  SUPABASE_URL,
  getSupabaseConfig
};
