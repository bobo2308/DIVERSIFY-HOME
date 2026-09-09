// ============================================================================
// DIVERSIFY HOME — Interactions générales de l'interface
// (menu mobile, animations au scroll, notifications toast, nav rétractable)
// ============================================================================

// Menu mobile
const ham = document.getElementById('hamburger');
const mob = document.getElementById('mobileNav');
const cls = document.getElementById('mobileClose');
if (ham && mob && cls) {
  ham.addEventListener('click', () => mob.classList.add('open'));
  cls.addEventListener('click', () => mob.classList.remove('open'));
}
function closeMob() {
  if (mob) mob.classList.remove('open');
}

// Animation "reveal" au scroll
const reveals = document.querySelectorAll('.reveal');
const obs = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });
reveals.forEach(r => obs.observe(r));

// Notification toast
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

// Nav qui se rétracte au scroll
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (nav) nav.style.padding = window.scrollY > 60 ? '12px 60px' : '18px 60px';
});
