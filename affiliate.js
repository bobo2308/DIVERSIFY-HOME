// ============================================================================
// DIVERSIFY HOME — Programme d'affiliation (Supabase Auth + RPC sécurisées)
// Dépend de : supabaseClient (supabase-client.js), showToast/escapeHtml (main.js / site-data.js)
// ============================================================================
(function () {
  const KEY = 'dh_referral_code';
  const fmt = n => Number(n || 0).toLocaleString('fr-FR') + ' FCFA';
  const SYN = phone => 'aff.' + phone.replace(/\D/g, '') + '@diversifyhome.app';
  const link = code => location.origin + '/?ref=' + code;
  const $ = id => document.getElementById(id);
  const STATUS = { pending: 'En attente de validation', active: 'Actif', suspended: 'Suspendu' };
  const OSTAT = { none: '—', pending: 'À payer', paid: 'Payée', cancelled: 'Annulée' };

  // ---- 1) Attribution : capture, validation serveur, persistance (localStorage + sessionStorage) ----
  async function captureReferral() {
    const ref = (new URLSearchParams(location.search).get('ref') || '').trim().toUpperCase();
    if (ref) {
      const { data } = await supabaseClient.rpc('track_affiliate_click', { p_code: ref });
      if (data === true) {
        localStorage.setItem(KEY, ref); sessionStorage.setItem(KEY, ref);
        if (typeof showToast === 'function') showToast('Vous avez été recommandé par notre partenaire.');
      } else { localStorage.removeItem(KEY); sessionStorage.removeItem(KEY); }
    } else {
      const saved = localStorage.getItem(KEY);          // conserve l'attribution entre les visites/pages
      if (saved) sessionStorage.setItem(KEY, saved);    // order-form.js / wizard lisent sessionStorage
    }
  }

  // ---- 2) Interface (modale construite dynamiquement, styles dans affiliate.css) ----
  function overlay() {
    let o = $('affOverlay');
    if (!o) {
      o = document.createElement('div'); o.id = 'affOverlay'; o.className = 'aff-overlay';
      o.innerHTML = '<div class="aff-box"><button class="aff-close" aria-label="Fermer">✕</button><div id="affBody"></div></div>';
      document.body.appendChild(o);
      o.addEventListener('click', e => { if (e.target === o || e.target.classList.contains('aff-close')) close(); });
    }
    return o;
  }
  function close() { $('affOverlay').classList.remove('open'); if (location.hash === '#affilie') history.replaceState(null, '', location.pathname); }
  function show(html) { overlay().classList.add('open'); $('affBody').innerHTML = html; }

  function registerView() {
    show(`<span class="section-tag">Programme d'affiliation</span><h3 class="aff-title">Rejoindre le programme</h3>
    <form id="affRegForm" novalidate>
      <div class="form-group"><label>Nom complet *</label><input id="arName" autocomplete="name"></div>
      <div class="form-group"><label>Téléphone / WhatsApp *</label><input id="arPhone" type="tel" placeholder="+228 XX XX XX XX" autocomplete="tel"></div>
      <div class="form-group"><label>Email</label><input id="arEmail" type="email" autocomplete="email"></div>
      <div class="form-group"><label>Mot de passe * (8 caractères min.)</label><input id="arPw" type="password" autocomplete="new-password"></div>
      <div class="form-group"><label>Confirmer le mot de passe *</label><input id="arPw2" type="password" autocomplete="new-password"></div>
      <p class="aff-error" id="affErr"></p>
      <button class="form-submit" id="arBtn" type="submit">Créer mon compte →</button>
    </form>
    <p class="aff-alt">Déjà affilié ? <a href="#" id="toLogin">Se connecter</a></p>`);
    $('toLogin').onclick = e => { e.preventDefault(); loginView(); };
    $('affRegForm').onsubmit = register;
  }
  function loginView() {
    show(`<span class="section-tag">Espace affilié</span><h3 class="aff-title">Connexion</h3>
    <form id="affLoginForm" novalidate>
      <div class="form-group"><label>Email ou téléphone</label><input id="alId" autocomplete="username"></div>
      <div class="form-group"><label>Mot de passe</label><input id="alPw" type="password" autocomplete="current-password"></div>
      <p class="aff-error" id="affErr"></p>
      <button class="form-submit" id="alBtn" type="submit">Se connecter →</button>
    </form>
    <p class="aff-alt">Pas encore inscrit ? <a href="#" id="toReg">Rejoindre le programme</a></p>`);
    $('toReg').onclick = e => { e.preventDefault(); registerView(); };
    $('affLoginForm').onsubmit = login;
  }

  async function register(e) {
    e.preventDefault();
    const name = $('arName').value.trim(), phone = $('arPhone').value.trim(), email = $('arEmail').value.trim();
    const pw = $('arPw').value, err = $('affErr');
    if (!name || phone.replace(/\D/g, '').length < 8) return err.textContent = 'Nom et numéro WhatsApp valides requis.';
    if (email && !/^\S+@\S+\.\S+$/.test(email)) return err.textContent = 'Email invalide.';
    if (pw.length < 8) return err.textContent = 'Le mot de passe doit contenir au moins 8 caractères.';
    if (pw !== $('arPw2').value) return err.textContent = 'Les mots de passe ne correspondent pas.';
    const btn = $('arBtn'); btn.disabled = true; btn.textContent = 'Création…'; err.textContent = '';
    const { data, error } = await supabaseClient.auth.signUp({
      email: email || SYN(phone), password: pw,
      options: { data: { is_affiliate: 'true', name, phone, contact_email: email } }
    });
    btn.disabled = false; btn.textContent = 'Créer mon compte →';
    if (error) return err.textContent = /registered|exists/i.test(error.message) ? 'Ce compte existe déjà. Connectez-vous.' : 'Inscription impossible : ' + error.message;
    if (!data.session) return show('<h3 class="aff-title">Vérifiez votre email</h3><p class="aff-note">Un lien de confirmation vous a été envoyé. Cliquez dessus puis connectez-vous.</p>');
    dashboard();
  }

  async function login(e) {
    e.preventDefault();
    const id = $('alId').value.trim(), err = $('affErr'), btn = $('alBtn');
    btn.disabled = true; err.textContent = '';
    const { error } = await supabaseClient.auth.signInWithPassword({ email: id.includes('@') ? id : SYN(id), password: $('alPw').value });
    btn.disabled = false;
    if (error) return err.textContent = 'Identifiants incorrects.';
    dashboard();
  }

  async function dashboard() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return loginView();
    show('<p class="aff-note">Chargement…</p>');
    const [{ data: s }, { data: orders }] = await Promise.all([
      supabaseClient.rpc('my_affiliate_stats'), supabaseClient.rpc('my_affiliate_orders')]);
    if (!s) { await supabaseClient.auth.signOut(); return show('<p class="aff-note">Ce compte n\'est pas un compte affilié.</p>'); }
    const url = link(s.code);
    const rows = (orders || []).map(o => `<tr><td>${new Date(o.created_at).toLocaleDateString('fr-FR')}</td><td>${escapeHtml(o.client || '—')}</td>
      <td>${escapeHtml(o.service || '—')}</td><td>${o.amount ? fmt(o.amount) : '—'}</td><td>${o.commission ? fmt(o.commission) : '—'}</td>
      <td>${OSTAT[o.commission_status] || o.status}</td></tr>`).join('') || '<tr><td colspan="6" class="aff-note">Aucune commande pour le moment.</td></tr>';
    const stat = (l, v) => `<div class="aff-stat"><b>${v}</b><span>${l}</span></div>`;
    show(`<span class="section-tag">Mon espace affilié</span><h3 class="aff-title">Bonjour, ${escapeHtml(s.name)}</h3>
      <p class="aff-badge aff-${s.status}">${STATUS[s.status]}</p>
      ${s.status !== 'active' ? '<p class="aff-note">Votre lien deviendra actif dès validation de votre compte par DIVERSIFY HOME.</p>' : ''}
      <label class="aff-label">Mon lien de parrainage</label>
      <div class="aff-link"><input readonly id="affUrl" value="${url}"></div>
      <div class="aff-actions"><button class="form-submit" id="affCopy">Copier mon lien</button>
        <button class="form-submit aff-wa" id="affWa">Partager sur WhatsApp</button></div>
      <div class="aff-stats">${stat('Clics', s.clicks)}${stat('Commandes', s.orders)}${stat('Validées', s.validated)}
        ${stat('En attente', fmt(s.pending))}${stat('Gagnée', fmt(s.earned))}${stat('Déjà payée', fmt(s.paid))}</div>
      <label class="aff-label">Historique</label>
      <div class="aff-table"><table><thead><tr><th>Date</th><th>Client</th><th>Service</th><th>Montant</th><th>Commission</th><th>Statut</th></tr></thead><tbody>${rows}</tbody></table></div>
      <p class="aff-alt"><a href="#" id="affOut">Se déconnecter</a></p>`);
    $('affCopy').onclick = async () => {
      try { await navigator.clipboard.writeText(url); } catch (_) { $('affUrl').select(); document.execCommand('copy'); }
      showToast('Lien copié !');
    };
    $('affWa').onclick = () => window.open('https://wa.me/?text=' + encodeURIComponent('Découvrez les services de DIVERSIFY HOME.\n👉 ' + url), '_blank');
    $('affOut').onclick = async e => { e.preventDefault(); await supabaseClient.auth.signOut(); loginView(); };
  }

  window.openAffiliateModal = registerView;
  window.openAffiliateSpace = async () => {
    const { data: { session } } = await supabaseClient.auth.getSession();
    session ? dashboard() : loginView();
  };

  document.addEventListener('DOMContentLoaded', () => {
    captureReferral();
    document.querySelectorAll('.js-aff-join').forEach(el => el.addEventListener('click', e => { e.preventDefault(); registerView(); }));
    document.querySelectorAll('.js-aff-space').forEach(el => el.addEventListener('click', e => { e.preventDefault(); closeMobSafe(); openAffiliateSpace(); }));
    if (location.pathname.replace(/\/$/, '') === '/affiliate' || location.hash === '#affilie') openAffiliateSpace();
  });
  function closeMobSafe() { if (typeof closeMob === 'function') closeMob(); }
})();
