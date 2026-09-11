// ============================================================================
// DIVERSIFY HOME — Formulaire de commande étape par étape
// ============================================================================

let orderStep = 1;

let orderData = {
  name: '',
  phone: '',
  serviceId: '',
  message: ''
};

function showOrderStep(step) {
  orderStep = step;

  const nameEl = document.getElementById('name');
  const phoneEl = document.getElementById('phone');
  const serviceEl = document.getElementById('service');
  const messageEl = document.getElementById('message');
  const submitBtn = document.querySelector('.form-submit');

  if (!nameEl || !phoneEl || !serviceEl || !messageEl || !submitBtn) return;

  // Tout masquer
  nameEl.parentElement.style.display = 'none';
  phoneEl.parentElement.style.display = 'none';
  serviceEl.parentElement.style.display = 'none';
  messageEl.parentElement.style.display = 'none';

  // Étape 1 : Nom
  if (step === 1) {
    nameEl.parentElement.style.display = 'block';
    submitBtn.textContent = 'Continuer →';
    nameEl.focus();
  }

  // Étape 2 : Téléphone
  if (step === 2) {
    phoneEl.parentElement.style.display = 'block';
    submitBtn.textContent = 'Continuer →';
    phoneEl.focus();
  }

  // Étape 3 : Service
  if (step === 3) {
    serviceEl.parentElement.style.display = 'block';
    submitBtn.textContent = 'Continuer →';
    serviceEl.focus();
  }

  // Étape 4 : Détails
  if (step === 4) {
    messageEl.parentElement.style.display = 'block';
    submitBtn.textContent = 'Confirmer la commande →';
    messageEl.focus();
  }
}

async function submitOrder() {
  const nameEl = document.getElementById('name');
  const phoneEl = document.getElementById('phone');
  const serviceEl = document.getElementById('service');
  const messageEl = document.getElementById('message');
  const submitBtn = document.querySelector('.form-submit');

  // ============================================================
  // ÉTAPE 1 — NOM
  // ============================================================

  if (orderStep === 1) {
    const name = nameEl.value.trim();

    if (!name) {
      showToast('⚠️ Entrez votre nom.');
      nameEl.focus();
      return;
    }

    orderData.name = name;
    showOrderStep(2);
    return;
  }

  // ============================================================
  // ÉTAPE 2 — TÉLÉPHONE
  // ============================================================

  if (orderStep === 2) {
    const phone = phoneEl.value.trim();

    if (!phone) {
      showToast('⚠️ Entrez votre numéro WhatsApp.');
      phoneEl.focus();
      return;
    }

    orderData.phone = phone;
    showOrderStep(3);
    return;
  }

  // ============================================================
  // ÉTAPE 3 — SERVICE
  // ============================================================

  if (orderStep === 3) {
    const serviceId = serviceEl.value;

    if (!serviceId) {
      showToast('⚠️ Sélectionnez un service.');
      serviceEl.focus();
      return;
    }

    orderData.serviceId = serviceId;
    showOrderStep(4);
    return;
  }

  // ============================================================
  // ÉTAPE 4 — DÉTAILS + ENVOI
  // ============================================================

  if (orderStep === 4) {
    const message = messageEl.value.trim();
    orderData.message = message;

    const originalLabel = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours…';

    const referralCode =
      sessionStorage.getItem('dh_referral_code') || null;

    const { data, error } = await supabaseClient.rpc('submit_order', {
      p_full_name: orderData.name,
      p_phone: orderData.phone,
      p_service_id: orderData.serviceId,
      p_message: orderData.message || null,
      p_referral_code: referralCode
    });

    submitBtn.disabled = false;
    submitBtn.textContent = originalLabel;

    if (error) {
      console.error('Erreur envoi commande:', error);
      showToast(
        '❌ Une erreur est survenue. Réessayez ou contactez-nous sur WhatsApp.'
      );
      return;
    }

    // ============================================================
    // SUCCÈS
    // ============================================================

    document.getElementById('orderForm').style.display = 'none';

    const successBox = document.getElementById('orderSuccess');
    successBox.style.display = 'block';

    const selectedOption =
      serviceEl.options[serviceEl.selectedIndex];

    const serviceName =
      selectedOption
        ? selectedOption.textContent.trim()
        : '';

    const number =
      window.DH_SETTINGS.whatsapp_number || '22890771701';

    const waLink =
      successBox.querySelector('.js-wa');

    if (waLink) {
      const text =
        `Bonjour, je viens d'envoyer une demande chez DIVERSIFY HOME.\n\n` +
        `Nom : ${orderData.name}\n` +
        `Téléphone : ${orderData.phone}\n` +
        `Service : ${serviceName}\n` +
        `Détails : ${orderData.message || 'Aucun détail supplémentaire'}`;

      waLink.href =
        `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
    }

    showToast('✅ Demande envoyée !');
  }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  showOrderStep(1);
});
