// ============================================================================
// DIVERSIFY HOME — Commande pas-à-pas (wizard)
// Réutilise la même fonction Supabase que le formulaire classique (submit_order),
// mais pose les questions une par une plutôt que de tout afficher en même temps.
// ============================================================================
 
const WIZARD_TOTAL_STEPS = 4;
let wizardCurrentStep = 1;
 
const wizardOverlay = document.getElementById('wizardOverlay');
const wizardForm = document.getElementById('wizardForm');
const wizardBackBtn = document.getElementById('wizardBack');
const wizardNextBtn = document.getElementById('wizardNext');
 
function openOrderWizard() {
  wizardCurrentStep = 1;
  wizardForm.reset();
  wizardForm.style.display = 'block';
  document.querySelector('.wizard-progress').style.display = 'flex';
  document.getElementById('wizardSuccess').style.display = 'none';
  document.querySelectorAll('.wizard-error').forEach(el => el.textContent = '');
  updateWizardStep();
  wizardOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('wizardName').focus(), 100);
}
 
function closeOrderWizard() {
  wizardOverlay.classList.remove('open');
  document.body.style.overflow = '';
}
 
function updateWizardStep() {
  document.querySelectorAll('.wizard-step').forEach(el => {
    el.classList.toggle('active', Number(el.dataset.step) === wizardCurrentStep);
  });
  document.querySelectorAll('.wizard-dot').forEach(dot => {
    const n = Number(dot.dataset.dot);
    dot.classList.toggle('active', n === wizardCurrentStep);
    dot.classList.toggle('done', n < wizardCurrentStep);
  });
  wizardBackBtn.style.visibility = wizardCurrentStep === 1 ? 'hidden' : 'visible';
  wizardNextBtn.textContent = wizardCurrentStep === WIZARD_TOTAL_STEPS ? 'Envoyer ma demande →' : 'Suivant →';
 
  // Focus automatique sur le champ de l'étape affichée
  const activeStep = document.querySelector(`.wizard-step[data-step="${wizardCurrentStep}"]`);
  const field = activeStep.querySelector('input, select, textarea');
  if (field) setTimeout(() => field.focus(), 50);
}
 
function validateWizardStep(step) {
  const errorEl = document.getElementById('wizardError' + step);
  errorEl.textContent = '';
 
  if (step === 1) {
    const v = document.getElementById('wizardName').value.trim();
    if (!v) { errorEl.textContent = 'Merci d\'indiquer votre nom.'; return false; }
  }
  if (step === 2) {
    const v = document.getElementById('wizardPhone').value.trim();
    if (!v) { errorEl.textContent = 'Merci d\'indiquer votre numéro.'; return false; }
  }
  if (step === 3) {
    const v = document.getElementById('wizardService').value;
    if (!v) { errorEl.textContent = 'Merci de choisir un service.'; return false; }
  }
  // Étape 4 (détails) : facultative, toujours valide
  return true;
}
 
wizardNextBtn.addEventListener('click', async () => {
  if (!validateWizardStep(wizardCurrentStep)) return;
 
  if (wizardCurrentStep < WIZARD_TOTAL_STEPS) {
    wizardCurrentStep++;
    updateWizardStep();
  } else {
    await submitWizardOrder();
  }
});
 
wizardBackBtn.addEventListener('click', () => {
  if (wizardCurrentStep > 1) {
    wizardCurrentStep--;
    updateWizardStep();
  }
});
 
document.getElementById('wizardClose').addEventListener('click', closeOrderWizard);
wizardOverlay.addEventListener('click', (e) => {
  if (e.target === wizardOverlay) closeOrderWizard();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && wizardOverlay.classList.contains('open')) closeOrderWizard();
});
 
// Permet aussi de valider une étape avec la touche Entrée
wizardForm.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && wizardCurrentStep < WIZARD_TOTAL_STEPS) {
    e.preventDefault();
    wizardNextBtn.click();
  }
});
 
async function submitWizardOrder() {
  const name = document.getElementById('wizardName').value.trim();
  const phone = document.getElementById('wizardPhone').value.trim();
  const serviceEl = document.getElementById('wizardService');
  const serviceId = serviceEl.value;
  const message = document.getElementById('wizardMessage').value.trim();
 
  wizardNextBtn.disabled = true;
  wizardNextBtn.textContent = 'Envoi en cours…';
 
  const referralCode = sessionStorage.getItem('dh_referral_code') || null;
 
  const { data, error } = await supabaseClient.rpc('submit_order', {
    p_full_name: name,
    p_phone: phone,
    p_service_id: serviceId,
    p_message: message || null,
    p_referral_code: referralCode
  });
 
  wizardNextBtn.disabled = false;
  wizardNextBtn.textContent = 'Envoyer ma demande →';
 
  if (error) {
    console.error('Erreur envoi commande (wizard):', error);
    document.getElementById('wizardError4').textContent = 'Une erreur est survenue. Réessayez ou contactez-nous sur WhatsApp.';
    return;
  }
 
  wizardForm.style.display = 'none';
  document.querySelector('.wizard-progress').style.display = 'none';
  const successBox = document.getElementById('wizardSuccess');
  successBox.style.display = 'block';
 
  const selectedOption = serviceEl.options[serviceEl.selectedIndex];
  const serviceName = selectedOption ? selectedOption.textContent.trim() : '';
  const number = window.DH_SETTINGS.whatsapp_number || '22890771701';
  const waLink = document.getElementById('wizardWaLink');
  const text = `Bonjour, je viens d'envoyer une demande pour : ${serviceName} (${name})`;
  waLink.href = `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
 
  if (typeof showToast === 'function') showToast('✅ Demande envoyée !');
}
 
