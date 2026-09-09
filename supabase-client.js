// ============================================================================
// DIVERSIFY HOME — Connexion Supabase
// ============================================================================
// Remplace les deux valeurs ci-dessous par celles de TON projet Supabase :
// Dashboard Supabase → Project Settings → API
//   - "Project URL"      → SUPABASE_URL
//   - "anon public" key  → SUPABASE_ANON_KEY
//
// ⚠️ Ne mets JAMAIS la clé "service_role" ici : cette clé est secrète et ne
// doit exister que côté dashboard admin protégé, jamais dans un fichier
// chargé par le navigateur d'un visiteur.
// ============================================================================

const SUPABASE_URL = 'https://zhxkmmbrbhkcgylubijm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_YXIsoR1cNBCvB6dw2y3wIg_k3UxHkIY';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
