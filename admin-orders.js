// ============================================================================
// DIVERSIFY HOME — Admin : commandes
// ============================================================================

const STATUS_LABELS = {
  nouveau: 'Nouveau', confirme: 'Confirmé', en_cours: 'En cours',
  livre: 'Livré', annule: 'Annulé'
};

let currentOrders = [];
let allOrders = [];

async function loadOrders() {
  const tbody = document.getElementById('ordersBody');
  tbody.innerHTML = '<tr><td colspan="8" class="loading-state">Chargement des commandes…</td></tr>';

  const statusFilter = document.getElementById('statusFilter').value;

  let query = supabaseClient
    .from('commandes')
    .select(`
      id, message, amount, status, created_at,
      clients ( full_name, phone ),
      services ( name ),
      affiliates ( referral_code )
    `)
    .order('created_at', { ascending: false });

  if (statusFilter) query = query.eq('status', statusFilter);

  const { data, error } = await query;

  if (error) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-state">Erreur de chargement : ${error.message}</td></tr>`;
    return;
  }

  allOrders = data || [];
  fillServiceFilter();
  renderOrders();
  rememberSeen(allOrders);
}

// Filtres côté navigateur : recherche, service, période
function filteredOrders() {
  const q = (document.getElementById('orderSearch').value || '').trim().toLowerCase();
  const svc = document.getElementById('serviceFilter').value;
  const per = document.getElementById('periodFilter').value;
  let since = null;
  if (per === 'today') { since = new Date(); since.setHours(0, 0, 0, 0); }
  else if (per) { since = new Date(Date.now() - Number(per) * 86400000); }
  return allOrders.filter(o => {
    if (svc && (o.services?.name || '') !== svc) return false;
    if (since && new Date(o.created_at) < since) return false;
    if (!q) return true;
    const hay = [o.clients?.full_name, o.clients?.phone, o.services?.name, o.message, o.affiliates?.referral_code]
      .map(v => String(v || '').toLowerCase()).join(' | ');
    return hay.includes(q);
  });
}

function fillServiceFilter() {
  const sel = document.getElementById('serviceFilter');
  const keep = sel.value;
  const names = [...new Set(allOrders.map(o => o.services?.name).filter(Boolean))].sort();
  sel.innerHTML = '<option value="">Tous les services</option>' + names.map(n => `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`).join('');
  sel.value = names.includes(keep) ? keep : '';
}

function renderOrders() {
  const tbody = document.getElementById('ordersBody');
  currentOrders = filteredOrders();
  document.getElementById('ordersCount').textContent =
    currentOrders.length + ' commande(s)' + (currentOrders.length !== allOrders.length ? ' sur ' + allOrders.length : '');

  if (currentOrders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty-state">Aucune commande pour ces filtres.</td></tr>';
    return;
  }

  tbody.innerHTML = currentOrders.map(o => `
    <tr data-id="${o.id}" class="order-row" style="cursor:pointer;">
      <td class="strong">${escapeHtml(o.clients?.full_name || '—')}</td>
      <td>${escapeHtml(o.clients?.phone || '—')}</td>
      <td>${escapeHtml(o.services?.name || '—')}</td>
      <td class="cell-msg">${escapeHtml(truncate(o.message, 60))}</td>
      <td>${o.amount ? Number(o.amount).toLocaleString('fr-FR') + ' F' : '—'}</td>
      <td><span class="pill pill-${o.status}">${STATUS_LABELS[o.status] || o.status}</span></td>
      <td>${o.affiliates?.referral_code || '—'}</td>
      <td>${formatDate(o.created_at)}</td>
    </tr>
  `).join('');

  document.querySelectorAll('.order-row').forEach(row => {
    row.addEventListener('click', () => openOrderModal(row.dataset.id));
  });
}

// ── Export Excel (fichier .csv que Excel ouvre directement) ──
function exportOrders() {
  const rows = filteredOrders();
  if (!rows.length) { alert('Aucune commande à exporter avec ces filtres.'); return; }
  const cell = v => '"' + String(v ?? '').replace(/"/g, '""').replace(/\r?\n/g, ' ') + '"';
  const head = ['Date', 'Client', 'Téléphone', 'Service', 'Message', 'Montant (F)', 'Statut', 'Code affilié'];
  const lines = [head.map(cell).join(';')].concat(rows.map(o => [
    formatDate(o.created_at), o.clients?.full_name, o.clients?.phone, o.services?.name, o.message,
    o.amount || '', STATUS_LABELS[o.status] || o.status, o.affiliates?.referral_code || ''
  ].map(cell).join(';')));
  const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'commandes-' + new Date().toISOString().slice(0, 10) + '.csv';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

// ── Alerte nouvelle commande (page admin ouverte) ──
let seenIds = null;
let notifyOn = localStorage.getItem('dh_admin_notify') === '1';

function rememberSeen(list) { if (seenIds === null) seenIds = new Set((list || []).map(o => o.id)); }

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.22].forEach(t => {
      const osc = ctx.createOscillator(), g = ctx.createGain();
      osc.frequency.value = 880; osc.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.25, ctx.currentTime + t); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.18);
      osc.start(ctx.currentTime + t); osc.stop(ctx.currentTime + t + 0.2);
    });
  } catch (e) { /* son indisponible */ }
}

function updateNotifyButton() {
  document.getElementById('notifyToggle').textContent = notifyOn ? '🔔 Alertes : activées' : '🔔 Alertes : activer';
}

async function checkNewOrders() {
  if (seenIds === null) return;
  const { data, error } = await supabaseClient.from('commandes')
    .select('id, created_at, clients ( full_name ), services ( name )')
    .order('created_at', { ascending: false }).limit(20);
  if (error || !data) return;
  const fresh = data.filter(o => !seenIds.has(o.id));
  if (!fresh.length) return;
  fresh.forEach(o => seenIds.add(o.id));
  const first = fresh[0];
  const text = fresh.length === 1
    ? `Nouvelle commande : ${first.clients?.full_name || 'client'} — ${first.services?.name || 'service'}`
    : `${fresh.length} nouvelles commandes`;
  const banner = document.getElementById('newOrderBanner');
  banner.textContent = '🛎️ ' + text + ' (cliquer pour actualiser)';
  banner.style.display = 'block';
  document.title = '(' + fresh.length + ') Nouvelle commande — Admin';
  if (notifyOn) {
    beep();
    if ('Notification' in window && Notification.permission === 'granted') {
      try { new Notification('DIVERSIFY HOME', { body: text }); } catch (e) { /* ignoré */ }
    }
  }
  loadOrders();
}

document.getElementById('notifyToggle').addEventListener('click', async () => {
  notifyOn = !notifyOn;
  localStorage.setItem('dh_admin_notify', notifyOn ? '1' : '0');
  if (notifyOn) {
    beep();
    if ('Notification' in window && Notification.permission === 'default') { try { await Notification.requestPermission(); } catch (e) { /* ignoré */ } }
  }
  updateNotifyButton();
});
document.getElementById('newOrderBanner').addEventListener('click', e => {
  e.currentTarget.style.display = 'none'; document.title = 'Admin — DIVERSIFY HOME';
});
document.getElementById('exportOrders').addEventListener('click', exportOrders);
['orderSearch', 'serviceFilter', 'periodFilter'].forEach(id => {
  document.getElementById(id).addEventListener(id === 'orderSearch' ? 'input' : 'change', renderOrders);
});
updateNotifyButton();
setInterval(checkNewOrders, 30000);

function truncate(text, len) {
  if (!text) return '—';
  return text.length > len ? text.slice(0, len) + '…' : text;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
         ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

document.getElementById('statusFilter').addEventListener('change', loadOrders);
document.getElementById('refreshOrders').addEventListener('click', loadOrders);

// ── Modale détail commande ──
const orderModal = document.getElementById('orderModal');
let activeOrderId = null;

function openOrderModal(id) {
  const order = currentOrders.find(o => o.id === id);
  if (!order) return;
  activeOrderId = id;

  document.getElementById('orderDetailBody').innerHTML = `
    <div><strong style="color:var(--white);">Client :</strong> ${escapeHtml(order.clients?.full_name)}</div>
    <div><strong style="color:var(--white);">Téléphone :</strong> ${escapeHtml(order.clients?.phone)}</div>
    <div><strong style="color:var(--white);">Service :</strong> ${escapeHtml(order.services?.name)}</div>
    <div><strong style="color:var(--white);">Message :</strong> ${escapeHtml(order.message) || '—'}</div>
    <div><strong style="color:var(--white);">Reçue le :</strong> ${formatDate(order.created_at)}</div>
  `;
  document.getElementById('orderAmount').value = order.amount || '';
  document.getElementById('orderStatus').value = order.status;
  document.getElementById('orderFormError').textContent = '';
  orderModal.style.display = 'flex';
}

document.getElementById('cancelOrderBtn').addEventListener('click', () => {
  orderModal.style.display = 'none';
});

document.getElementById('saveOrderBtn').addEventListener('click', async () => {
  const amount = document.getElementById('orderAmount').value;
  const status = document.getElementById('orderStatus').value;
  const errorEl = document.getElementById('orderFormError');

  const { error } = await supabaseClient
    .from('commandes')
    .update({ amount: amount ? Number(amount) : null, status })
    .eq('id', activeOrderId);

  if (error) {
    errorEl.textContent = 'Erreur : ' + error.message;
    return;
  }

  orderModal.style.display = 'none';
  loadOrders();
});
