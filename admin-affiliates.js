// ============================================================================
// DIVERSIFY HOME — Admin : gestion des affiliés (activer, suspendre, payer, supprimer)
// Toutes les actions passent par des RPC qui vérifient is_admin() côté Supabase.
// ============================================================================
const AFF_LABEL = { pending: 'En attente', active: 'Actif', suspended: 'Suspendu' };
const fcfa = n => Number(n || 0).toLocaleString('fr-FR') + ' F';
let affList = [];

async function loadAffiliates() {
  const body = document.getElementById('affiliatesBody');
  const { data, error } = await supabaseClient.from('affiliates').select('*').order('created_at', { ascending: false });
  if (error) { body.innerHTML = `<tr><td colspan="9" class="empty-state">Erreur : ${escapeHtml(error.message)}</td></tr>`; return; }
  affList = data || [];
  body.innerHTML = affList.map(a => {
    const url = location.origin.replace('/admin', '') + '/?ref=' + a.referral_code;
    return `<tr>
      <td class="strong">${escapeHtml(a.name)}</td>
      <td>${escapeHtml(a.phone || '')}<br>${escapeHtml(a.email || '')}
        <br>${a.payout_number ? `<span class="pill">${{ tmoney: 'T-Money', flooz: 'Flooz', autre: 'Autre' }[a.payout_method] || 'Mobile Money'}</span> ${escapeHtml(a.payout_number)} <a href="#" data-act="copynum" data-num="${escapeHtml(a.payout_number)}" style="color:var(--gold);font-size:.7rem">copier</a>` : '<span style="color:#e57373;font-size:.7rem">Mobile Money non renseigné</span>'}</td>
      <td>${escapeHtml(a.referral_code)}<br><a href="#" data-act="copy" data-url="${url}" style="color:var(--gold);font-size:.7rem">copier le lien</a></td>
      <td><span class="pill">${AFF_LABEL[a.status] || a.status}</span></td>
      <td>${a.total_clicks || 0}</td><td>${a.total_orders || 0}</td>
      <td>${fcfa(a.pending_commission)}</td><td>${fcfa(a.paid_commission)}</td>
      <td style="white-space:nowrap">
        ${a.status !== 'active' ? `<button class="btn" data-act="active" data-id="${a.id}">Activer</button>` : ''}
        ${a.status !== 'suspended' ? `<button class="btn" data-act="suspended" data-id="${a.id}">Suspendre</button>` : ''}
        <button class="btn" data-act="orders" data-id="${a.id}">Commandes</button>
        <button class="btn" data-act="resetpw" data-id="${a.id}">Mot de passe</button>
        ${Number(a.pending_commission) > 0 ? `<button class="btn" data-act="pay" data-id="${a.id}">Marquer payé</button>` : ''}
        <button class="btn btn-danger" data-act="delete" data-id="${a.id}">Supprimer</button>
      </td></tr>`;
  }).join('') || '<tr><td colspan="9" class="empty-state">Aucun affilié.</td></tr>';
}

document.getElementById('affiliatesBody').addEventListener('click', async (e) => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  e.preventDefault();
  const id = b.dataset.id, act = b.dataset.act, a = affList.find(x => x.id === id);
  let res;
  if (act === 'copynum') { await navigator.clipboard.writeText(b.dataset.num); b.textContent = 'copié ✓'; return; }
  if (act === 'copy') { await navigator.clipboard.writeText(b.dataset.url); b.textContent = 'copié ✓'; return; }
  if (act === 'active' || act === 'suspended') res = await supabaseClient.rpc('admin_set_affiliate_status', { p_id: id, p_status: act });
  if (act === 'resetpw') {
    if (!confirm(`Créer un nouveau mot de passe temporaire pour ${a.name} ? L'ancien ne marchera plus.`)) return;
    const { data: pw, error: pe } = await supabaseClient.rpc('admin_reset_affiliate_password', { p_id: id });
    if (pe || !pw) return alert('Impossible de réinitialiser : ' + (pe ? pe.message : 'erreur'));
    showTempPassword(a, pw);
    return;
  }
  if (act === 'pay') {
    if (!confirm(`Marquer ${fcfa(a.pending_commission)} comme PAYÉ à ${a.name} ?`)) return;
    res = await supabaseClient.rpc('admin_pay_commissions', { p_affiliate: id });
  }
  if (act === 'delete') {
    if (!confirm(`Supprimer définitivement ${a.name} (${a.referral_code}) et son compte de connexion ?\nSes commandes sont conservées.`)) return;
    res = await supabaseClient.rpc('admin_delete_affiliate', { p_id: id, p_force: false });
    if (res.error && /pending_commissions/.test(res.error.message)) {
      if (!confirm('Cet affilié a des commissions NON PAYÉES. Supprimer quand même ?')) return;
      res = await supabaseClient.rpc('admin_delete_affiliate', { p_id: id, p_force: true });
    }
  }
  if (act === 'orders') return showAffOrders(id, a);
  if (res && res.error) return alert('Erreur : ' + res.error.message);
  loadAffiliates();
});

async function showAffOrders(id, a) {
  const panel = document.getElementById('affOrdersPanel');
  const { data } = await supabaseClient.from('commandes')
    .select('id, amount, status, commission_rate, commission_amount, commission_status, created_at, clients(full_name), services(name)')
    .eq('affiliate_id', id).order('created_at', { ascending: false });
  panel.innerHTML = `<h3 style="color:var(--gold)">Commandes de ${escapeHtml(a.name)}</h3><div class="table-wrap"><table>
    <thead><tr><th>Date</th><th>Client</th><th>Service</th><th>Montant</th><th>Taux</th><th>Commission</th><th>Statut cmd</th><th>Commission</th><th></th></tr></thead><tbody>` +
    ((data || []).map(o => `<tr><td>${formatDate(o.created_at)}</td><td>${escapeHtml(o.clients?.full_name || '—')}</td><td>${escapeHtml(o.services?.name || '—')}</td>
      <td>${o.amount ? fcfa(o.amount) : '—'}</td><td>${o.commission_rate ?? '—'}%</td><td>${fcfa(o.commission_amount)}</td>
      <td>${STATUS_LABELS[o.status] || o.status}</td><td>${o.commission_status}</td>
      <td>${o.commission_status === 'pending' ? `<button class="btn" data-pay-order="${o.id}">Payer</button>` : ''}</td></tr>`).join('') || '<tr><td colspan="9" class="empty-state">Aucune commande.</td></tr>') +
    '</tbody></table></div>';
  panel.querySelectorAll('[data-pay-order]').forEach(btn => btn.onclick = async () => {
    const { error } = await supabaseClient.rpc('admin_pay_commissions', { p_affiliate: id, p_order: btn.dataset.payOrder });
    if (error) return alert(error.message);
    loadAffiliates(); showAffOrders(id, a);
  });
}
document.getElementById('refreshAffiliates').addEventListener('click', loadAffiliates);


// Fenêtre « mot de passe temporaire » (affiché une seule fois)
function showTempPassword(a, pw) {
  const num = String(a.phone || '').replace(/\D/g, '');
  const msg = `Bonjour ${a.name}, voici votre mot de passe temporaire pour l'espace affilié DIVERSIFY HOME : ${pw}\nConnectez-vous, puis changez-le dans votre espace (Changer mon mot de passe).`;
  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px';
  ov.innerHTML = `<div style="background:#111;border:1px solid #c9a84c;max-width:380px;width:100%;padding:28px;color:#f5f5f0;font-family:inherit">
    <div style="font-size:.7rem;letter-spacing:2px;color:#c9a84c;margin-bottom:8px">MOT DE PASSE TEMPORAIRE</div>
    <div style="font-size:.85rem;color:#ccc;margin-bottom:12px">Pour <b>${escapeHtml(a.name)}</b>. Il ne sera plus affiché après fermeture : copiez-le ou envoyez-le maintenant.</div>
    <div style="font-size:1.6rem;letter-spacing:4px;color:#e2c07a;font-weight:700;margin-bottom:16px">${escapeHtml(pw)}</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn" id="tpCopy">Copier</button>
      <a class="btn" id="tpWa" target="_blank" rel="noopener" style="background:#1fa855;color:#fff;text-decoration:none" href="https://wa.me/${num}?text=${encodeURIComponent(msg)}">Envoyer sur WhatsApp</a>
      <button class="btn" id="tpClose">Fermer</button>
    </div></div>`;
  document.body.appendChild(ov);
  ov.querySelector('#tpCopy').onclick = async e => { await navigator.clipboard.writeText(pw); e.target.textContent = 'Copié ✓'; };
  ov.querySelector('#tpClose').onclick = () => ov.remove();
}
