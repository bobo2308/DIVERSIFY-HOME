// ============================================================================
// DIVERSIFY HOME — Admin : authentification
// ============================================================================

const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const loginBtn = document.getElementById('loginBtn');
const adminNameEl = document.getElementById('adminName');

// Vérifie que l'utilisateur connecté est bien un admin actif (table admin_users).
// Si ce n'est pas le cas, l'accès aux données est de toute façon bloqué par les
// policies RLS côté Supabase — ceci ne fait que déterminer quoi afficher ici.
async function checkAdminAndShowDashboard(user) {
  const { data, error } = await supabaseClient
    .from('admin_users')
    .select('full_name, is_active')
    .eq('id', user.id)
    .maybeSingle();

  if (error || !data || !data.is_active) {
    await supabaseClient.auth.signOut();
    loginError.textContent = "Ce compte n'a pas accès au dashboard admin.";
    showLogin();
    return;
  }

  adminNameEl.textContent = data.full_name;
  showDashboard();
}

function showLogin() {
  loginScreen.style.display = 'flex';
  dashboardScreen.style.display = 'none';
}

function showDashboard() {
  loginScreen.style.display = 'none';
  dashboardScreen.style.display = 'flex';
  if (typeof loadOrders === 'function') loadOrders();
}

// Vérifie la session existante au chargement de la page
(async function initAuth() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session && session.user) {
    await checkAdminAndShowDashboard(session.user);
  } else {
    showLogin();
  }
})();

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';
  loginBtn.disabled = true;
  loginBtn.textContent = 'Connexion…';

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

  loginBtn.disabled = false;
  loginBtn.textContent = 'Se connecter';

  if (error) {
    loginError.textContent = 'Email ou mot de passe incorrect.';
    return;
  }

  await checkAdminAndShowDashboard(data.user);
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
  showLogin();
});

// ── Navigation entre vues (Commandes / Services) ──
document.querySelectorAll('.sidebar nav a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = link.dataset.view;

    document.querySelectorAll('.sidebar nav a').forEach(a => a.classList.remove('active'));
    link.classList.add('active');

    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.getElementById('view-' + target).style.display = 'block';

    if (target === 'services' && typeof loadServices === 'function') loadServices();
    if (target === 'commandes' && typeof loadOrders === 'function') loadOrders();
  });
});
