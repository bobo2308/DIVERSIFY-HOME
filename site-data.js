// ============================================================================
// DIVERSIFY HOME — Chargement des données dynamiques (Supabase)
// Remplit : grille de services, liste déroulante du formulaire, tableau de
// commissions, statistiques "À propos", liens WhatsApp/email, textes CMS.
// ============================================================================

window.DH_SETTINGS = {};

// ----------------------------------------------------------------------------
// Services (+ liste déroulante du formulaire + tableau de commissions)
// ----------------------------------------------------------------------------
async function loadServices() {
  const grid = document.getElementById('servicesGrid');
  const select = document.getElementById('service');
  const commissionsGrid = document.getElementById('commissionsGrid');

  if (grid) grid.innerHTML = '<div class="dh-loading">Chargement des services…</div>';

  const { data: services, error } = await supabaseClient
    .from('services')
    .select('id, name, description, price_display, icon, image_url, max_commission_rate')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Erreur chargement services:', error);
    if (grid) grid.innerHTML = '<div class="dh-error">Impossible de charger les services pour le moment. Contactez-nous directement sur WhatsApp.</div>';
    return;
  }

  // --- Grille de services ---
  if (grid) {
    grid.innerHTML = '';
    (services || []).forEach(svc => {
      const card = document.createElement('div');
      card.className = 'service-card';
      const imgHtml = svc.image_url
        ? `<div class="svc-img"><img src="${svc.image_url}" alt="${escapeHtml(svc.name)}" loading="lazy"></div>`
        : '';
      card.innerHTML = `
        ${imgHtml}
        <div class="svc-body">
          <span class="service-icon">${svc.icon || '✨'}</span>
          <div class="service-name">${escapeHtml(svc.name)}</div>
          <p class="service-desc">${escapeHtml(svc.description || '')}</p>
          <div class="svc-footer">
            <span class="service-price">${escapeHtml(svc.price_display || 'Sur devis')}</span>
            <a class="svc-cta js-wa" href="#" target="_blank" data-service-name="${escapeHtml(svc.name)}">Commander →</a>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  // --- Liste déroulante du formulaire de commande ---
  if (select) {
    select.innerHTML = '<option value="">— Sélectionner un service —</option>';
    (services || []).forEach(svc => {
      const opt = document.createElement('option');
      opt.value = svc.id;
      opt.textContent = `${svc.icon ? svc.icon + ' ' : ''}${svc.name}`;
      select.appendChild(opt);
    });
  }

  // --- Tableau des taux de commission (source unique de vérité) ---
  if (commissionsGrid) {
    commissionsGrid.innerHTML = (services || []).map(svc => `
      <div class="commission-row">
        <span class="commission-service">${svc.icon ? svc.icon + ' ' : ''}${escapeHtml(svc.name)}</span>
        <span class="commission-pct">${Number(svc.max_commission_rate).toFixed(0)}%</span>
      </div>
    `).join('');
  }

  applyWaLinks();
}

// ----------------------------------------------------------------------------
// Réglages globaux (WhatsApp, email, statistiques)
// ----------------------------------------------------------------------------
async function loadSettings() {
  const { data, error } = await supabaseClient.from('settings').select('key, value');
  if (error) {
    console.error('Erreur chargement settings:', error);
    return;
  }

  const settings = {};
  (data || []).forEach(row => { settings[row.key] = row.value; });
  window.DH_SETTINGS = settings;

  const statMap = {
    statServices: 'stat_services_count',
    statSatisfaction: 'stat_satisfaction',
    statReactivite: 'stat_reactivite',
    statPossibilites: 'stat_possibilites'
  };
  Object.entries(statMap).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el && settings[key]) el.textContent = settings[key];
  });

  document.querySelectorAll('.js-email').forEach(el => {
    if (!settings.contact_email) return;
    el.href = 'mailto:' + settings.contact_email;
    const label = el.querySelector('.email-label');
    if (label) label.textContent = settings.contact_email;
  });

  applyWaLinks();
}

// ----------------------------------------------------------------------------
// Contenu éditable (mini-CMS) — hero tag, paragraphes "À propos"
// ----------------------------------------------------------------------------
async function loadSiteContent() {
  const { data, error } = await supabaseClient.from('site_content').select('key, value');
  if (error) {
    console.error('Erreur chargement site_content:', error);
    return;
  }
  const content = {};
  (data || []).forEach(row => { content[row.key] = row.value; });

  const map = { heroTag: 'hero_tag', aboutP1: 'about_p1', aboutP2: 'about_p2' };
  Object.entries(map).forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el && content[key]) el.textContent = content[key];
  });
}

// ----------------------------------------------------------------------------
// Mise à jour de tous les liens WhatsApp / affiliation de la page
// ----------------------------------------------------------------------------
function applyWaLinks() {
  const number = window.DH_SETTINGS.whatsapp_number || '22890771701';

  document.querySelectorAll('.js-wa').forEach(el => {
    const serviceName = el.getAttribute('data-service-name');
    const text = serviceName
      ? `Bonjour, je souhaite commander : ${serviceName}`
      : 'Bonjour, je souhaite passer une commande sur DIVERSIFY HOME';
    el.href = `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
  });

  document.querySelectorAll('.js-wa-affiliate').forEach(el => {
    const text = "Bonjour, je souhaite rejoindre le programme d'affiliation DIVERSIFY HOME";
    el.href = `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
  });

  document.querySelectorAll('.wa-number-label').forEach(el => {
    el.textContent = '+' + number.replace(/(\d{3})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  });
}

// ----------------------------------------------------------------------------
// Utilitaires
// ----------------------------------------------------------------------------
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

function getSessionId() {
  let id = sessionStorage.getItem('dh_session_id');
  if (!id) {
    id = 'sess_' + Math.random().toString(36).slice(2) + Date.now();
    sessionStorage.setItem('dh_session_id', id);
  }
  return id;
}

async function trackEvent(eventType, payload = {}) {
  try {
    await supabaseClient.from('analytics_events').insert({
      event_type: eventType,
      service_id: payload.service_id || null,
      affiliate_id: payload.affiliate_id || null,
      session_id: getSessionId(),
      metadata: payload.metadata || {}
    });
  } catch (e) {
    console.warn('Analytics non envoyé:', e);
  }
}

// ----------------------------------------------------------------------------
// Initialisation
// ----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
  // Capture d'un éventuel code d'affiliation dans l'URL (?ref=CODE)
  const params = new URLSearchParams(location.search);
  const ref = params.get('ref');
  if (ref) sessionStorage.setItem('dh_referral_code', ref);

  await Promise.all([loadServices(), loadSettings(), loadSiteContent()]);

  trackEvent('page_view', { metadata: { ref: ref || null } });

  // Suivi des clics WhatsApp (tous liens, générés ou statiques)
  document.body.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && link.href && link.href.includes('wa.me')) {
      trackEvent('whatsapp_click');
    }
  });
});
