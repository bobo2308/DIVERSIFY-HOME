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
      <td>${escapeHtml(a.phone || '')}<br>${escapeHtml(a.email || '')}</td>
      <td>${escapeHtml(a.referral_code)}<br><a href="#" data-act="copy" data-url="${url}" style="color:var(--gold);font-size:.7rem">copier le lien</a></td>
      <td><span class="pill">${AFF_LABEL[a.status] || a.status}</span></td>
      <td>${a.total_clicks || 0}</td><td>${a.total_orders || 0}</td>
      <td>${fcfa(a.pending_commission)}</td><td>${fcfa(a.paid_commission)}</td>
      <td style="white-space:nowrap">
        ${a.status !== 'active' ? `<button class="btn" data-act="active" data-id="${a.id}">Activer</button>` : ''}
        ${a.status !== 'suspended' ? `<button class="btn" data-act="suspended" data-id="${a.id}">Suspendre</button>` : ''}
        <button class="btn" data-act="orders" data-id="${a.id}">Commandes</button>
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
  if (act === 'copy') { await navigator.clipboard.writeText(b.dataset.url); b.textContent = 'copié ✓'; return; }
  if (act === 'active' || act === 'suspended') res = await supabaseClient.rpc('admin_set_affiliate_status', { p_id: id, p_status: act });
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
