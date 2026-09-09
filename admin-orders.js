// ============================================================================
// DIVERSIFY HOME — Admin : commandes
// ============================================================================

const STATUS_LABELS = {
  nouveau: 'Nouveau', confirme: 'Confirmé', en_cours: 'En cours',
  livre: 'Livré', annule: 'Annulé'
};

let currentOrders = [];

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

  currentOrders = data || [];

  if (currentOrders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty-state">Aucune commande pour ce filtre.</td></tr>';
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
