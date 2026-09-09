// ============================================================================
// DIVERSIFY HOME — Admin : services
// ============================================================================

let currentServices = [];

async function loadServices() {
  const grid = document.getElementById('servicesAdminGrid');
  grid.innerHTML = '<div class="loading-state">Chargement des services…</div>';

  const filter = document.getElementById('serviceStatusFilter').value;

  let query = supabaseClient
    .from('services')
    .select('*')
    .order('display_order', { ascending: true });

  if (filter === 'actif') query = query.eq('is_active', true);
  if (filter === 'inactif') query = query.eq('is_active', false);

  const { data, error } = await query;

  if (error) {
    grid.innerHTML = `<div class="empty-state">Erreur de chargement : ${error.message}</div>`;
    return;
  }

  currentServices = data || [];

  if (currentServices.length === 0) {
    grid.innerHTML = '<div class="empty-state">Aucun service pour ce filtre.</div>';
    return;
  }

  grid.innerHTML = currentServices.map(s => `
    <div class="admin-svc-card">
      <div class="admin-svc-thumb" style="${s.image_url ? `background-image:url('${s.image_url}')` : ''}">
        ${!s.image_url ? '<div class="no-img">Pas de photo</div>' : ''}
      </div>
      <div class="admin-svc-body">
        <div class="name">${escapeHtml(s.name)}</div>
        <div class="price">${escapeHtml(s.price_display || '—')}</div>
        <span class="pill pill-${s.is_active ? 'actif' : 'inactif'}">${s.is_active ? 'Actif' : 'Inactif'}</span>
        <div class="admin-svc-actions">
          <button class="btn" data-edit="${s.id}">Modifier</button>
        </div>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => openServiceModal(btn.dataset.edit));
  });
}

document.getElementById('serviceStatusFilter').addEventListener('change', loadServices);
document.getElementById('refreshServices').addEventListener('click', loadServices);

// ── Modale ajout/édition ──
const serviceModal = document.getElementById('serviceModal');
const serviceForm = document.getElementById('serviceForm');
let activeServiceId = null;

document.getElementById('addServiceBtn').addEventListener('click', () => openServiceModal(null));
document.getElementById('cancelServiceBtn').addEventListener('click', () => serviceModal.style.display = 'none');

function openServiceModal(id) {
  activeServiceId = id;
  document.getElementById('serviceFormError').textContent = '';
  document.getElementById('svcImage').value = '';

  const deleteBtn = document.getElementById('deleteServiceBtn');

  if (id) {
    const s = currentServices.find(x => x.id === id);
    document.getElementById('serviceModalTitle').textContent = 'Modifier le service';
    document.getElementById('svcId').value = s.id;
    document.getElementById('svcName').value = s.name || '';
    document.getElementById('svcDesc').value = s.description || '';
    document.getElementById('svcPriceDisplay').value = s.price_display || '';
    document.getElementById('svcIcon').value = s.icon || '';
    document.getElementById('svcCommission').value = s.max_commission_rate ?? 8;
    document.getElementById('svcOrder').value = s.display_order ?? 0;
    document.getElementById('svcActive').checked = !!s.is_active;
    deleteBtn.style.display = 'block';
    deleteBtn.textContent = s.is_active ? 'Désactiver' : 'Réactiver';
  } else {
    document.getElementById('serviceModalTitle').textContent = 'Ajouter un service';
    serviceForm.reset();
    document.getElementById('svcId').value = '';
    document.getElementById('svcCommission').value = 8;
    document.getElementById('svcOrder').value = 0;
    document.getElementById('svcActive').checked = true;
    deleteBtn.style.display = 'none';
  }

  serviceModal.style.display = 'flex';
}

// Slug simple à partir du nom (utilisé uniquement à la création)
function slugify(text) {
  return text.toString().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

serviceForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('serviceFormError');
  errorEl.textContent = '';

  const saveBtn = document.getElementById('saveServiceBtn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Enregistrement…';

  try {
    const payload = {
      name: document.getElementById('svcName').value.trim(),
      description: document.getElementById('svcDesc').value.trim(),
      price_display: document.getElementById('svcPriceDisplay').value.trim(),
      icon: document.getElementById('svcIcon').value.trim(),
      max_commission_rate: Number(document.getElementById('svcCommission').value),
      display_order: Number(document.getElementById('svcOrder').value),
      is_active: document.getElementById('svcActive').checked
    };

    let serviceId = activeServiceId;

    if (!serviceId) {
      payload.slug = slugify(payload.name) + '-' + Date.now().toString(36);
      const { data, error } = await supabaseClient.from('services').insert(payload).select('id').single();
      if (error) throw error;
      serviceId = data.id;
    } else {
      const { error } = await supabaseClient.from('services').update(payload).eq('id', serviceId);
      if (error) throw error;
    }

    // Upload image si un fichier a été choisi
    const fileInput = document.getElementById('svcImage');
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      const ext = file.name.split('.').pop();
      const path = `${serviceId}.${ext}`;

      const { error: uploadError } = await supabaseClient.storage
        .from('service-images')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabaseClient.storage.from('service-images').getPublicUrl(path);

      const { error: updateError } = await supabaseClient
        .from('services')
        .update({ image_url: urlData.publicUrl + '?t=' + Date.now(), image_path: path })
        .eq('id', serviceId);

      if (updateError) throw updateError;
    }

    serviceModal.style.display = 'none';
    loadServices();
  } catch (err) {
    errorEl.textContent = 'Erreur : ' + err.message;
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Enregistrer';
  }
});

document.getElementById('deleteServiceBtn').addEventListener('click', async () => {
  const s = currentServices.find(x => x.id === activeServiceId);
  if (!s) return;

  const { error } = await supabaseClient
    .from('services')
    .update({ is_active: !s.is_active })
    .eq('id', activeServiceId);

  if (error) {
    document.getElementById('serviceFormError').textContent = 'Erreur : ' + error.message;
    return;
  }

  serviceModal.style.display = 'none';
  loadServices();
});
