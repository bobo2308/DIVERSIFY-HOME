// ============================================================================
// DIVERSIFY HOME — Formulaire de commande (envoi réel vers Supabase)
// ============================================================================
// Appelle la fonction SQL "submit_order" (voir functions.sql) qui :
//   1. crée ou met à jour le client (par téléphone)
//   2. résout l'affilié à partir du code de parrainage (si présent)
//   3. insère la commande avec le statut "nouveau"
//   4. journalise l'événement "order_submit"
// ============================================================================

async function submitOrder() {
  const nameEl = document.getElementById('name');
  const phoneEl = document.getElementById('phone');
  const serviceEl = document.getElementById('service');
  const messageEl = document.getElementById('message');
  const submitBtn = document.querySelector('.form-submit');

  const name = nameEl.value.trim();
  const phone = phoneEl.value.trim();
  const serviceId = serviceEl.value;
  const message = messageEl.value.trim();

  if (!name || !phone || !serviceId) {
    showToast('⚠️ Veuillez remplir les champs obligatoires.');
    return;
  }

  const originalLabel = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Envoi en cours…';

  const referralCode = sessionStorage.getItem('dh_referral_code') || null;

  const { data, error } = await supabaseClient.rpc('submit_order', {
    p_full_name: name,
    p_phone: phone,
    p_service_id: serviceId,
    p_message: message || null,
    p_referral_code: referralCode
  });

  submitBtn.disabled = false;
  submitBtn.textContent = originalLabel;

  if (error) {
    console.error('Erreur envoi commande:', error);
    showToast('❌ Une erreur est survenue. Réessayez ou contactez-nous sur WhatsApp.');
    return;
  }

  // Bascule visuelle vers le message de succès
  document.getElementById('orderForm').style.display = 'none';
  const successBox = document.getElementById('orderSuccess');
  successBox.style.display = 'block';

  // Personnalise le lien WhatsApp de confirmation avec le service choisi
  const selectedOption = serviceEl.options[serviceEl.selectedIndex];
  const serviceName = selectedOption ? selectedOption.textContent.trim() : '';
  const number = window.DH_SETTINGS.whatsapp_number || '22890771701';
  const waLink = successBox.querySelector('.js-wa');
  if (waLink) {
    const text = `Bonjour, je viens d'envoyer une demande pour : ${serviceName} (${name})`;
    waLink.href = `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
  }

  showToast('✅ Demande envoyée !');
}
