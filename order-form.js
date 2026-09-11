<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DIVERSIFY HOME – Livraison • Tech • Design • Photo • Lomé</title>
<meta name="description" content="DIVERSIFY HOME — Multi-services premium à Lomé, Togo. Livraison, réparation tech, design graphique, photo, impression, abonnements numériques et bien plus.">
<link rel="stylesheet" href="dh_styles.css">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>

<!-- NAV -->
<nav id="navbar">
  <a class="nav-logo" href="#hero">DIVERSIFY <span>HOME</span></a>
  <ul class="nav-links">
    <li><a href="#about">À propos</a></li>
    <li><a href="#services">Services</a></li>
    <li><a href="#order">Commander</a></li>
    <li><a href="#affiliation">Affiliation</a></li>
  </ul>
  <a class="nav-cta js-wa" href="#" target="_blank">Commander →</a>
  <button class="hamburger" id="hamburger"><span></span><span></span><span></span></button>
</nav>

<!-- MOBILE NAV -->
<div class="mobile-nav" id="mobileNav">
  <button class="mobile-close" id="mobileClose">✕</button>
  <a href="#about" class="mob-link" onclick="closeMob()">À propos</a>
  <a href="#services" class="mob-link" onclick="closeMob()">Services</a>
  <a href="#order" class="mob-link" onclick="closeMob()">Commander</a>
  <a href="#affiliation" class="mob-link" onclick="closeMob()">Affiliation</a>
  <a href="#" target="_blank" class="mob-link js-wa" style="color:#25d366">WhatsApp →</a>
</div>

<!-- HERO -->
<section id="hero">
  <div class="hero-bg"></div>
  <div class="hero-grain"></div>
  <div class="hero-content">
    <span class="hero-tag" id="heroTag">Lomé, Togo — Services Premium</span>
    <h1 class="hero-title">Tout ce dont<br>vous avez <em>besoin</em>,<br>en un seul endroit</h1>
    <p class="hero-sub">Dédouanement, achat international, échange de devises, livraison, réparation tech, design, photo, impressions, hébergement web, abonnements numériques — <strong>DIVERSIFY HOME</strong> couvre tous vos besoins avec excellence.</p>
    <div class="hero-btns">
      <a class="btn-gold js-wa" href="#" target="_blank">Commander sur WhatsApp</a>
      <a class="btn-outline" href="#services">Découvrir nos services</a>
    </div>
  </div>
  <div class="hero-scroll"><span>Défiler</span><div class="hero-scroll-line"></div></div>
</section>

<!-- ABOUT -->
<section id="about">
  <div class="about-text reveal">
    <span class="section-tag">Notre identité</span>
    <h2 class="section-title">Une entreprise <em>multiple</em>,<br>un service d'exception</h2>
    <div class="divider"></div>
    <p id="aboutP1">DIVERSIFY HOME est née d'une vision simple : rassembler les services essentiels du quotidien sous un même toit. Disponible, réactif et professionnel — nous mettons notre expertise au service de vos projets, qu'ils soient personnels ou professionnels.</p>
    <p id="aboutP2">Notre équipe pluridisciplinaire intervient aussi bien pour votre smartphone cassé que pour votre prochaine identité visuelle ou votre événement à immortaliser.</p>
    <a class="btn-gold" href="#services" style="margin-top:12px">Voir nos services →</a>
  </div>
  <div class="about-stats reveal">
    <div class="stat-card"><div class="stat-num" id="statServices">15+</div><div class="stat-label">Services proposés</div></div>
    <div class="stat-card"><div class="stat-num" id="statSatisfaction">100%</div><div class="stat-label">Clients satisfaits</div></div>
    <div class="stat-card"><div class="stat-num" id="statReactivite">24h</div><div class="stat-label">Réactivité garantie</div></div>
    <div class="stat-card"><div class="stat-num" id="statPossibilites">∞</div><div class="stat-label">Possibilités</div></div>
  </div>
</section>

<!-- SERVICES -->
<section id="services">
  <div class="services-header reveal">
    <span class="section-tag">Ce que nous proposons</span>
    <h2 class="section-title">Nos <em>services</em></h2>
    <div class="divider center"></div>
  </div>
  <div class="services-grid reveal" id="servicesGrid">
    <div class="dh-loading">Chargement des services…</div>
  </div>
</section>

<!-- ORDER -->
<section id="order">
  <div class="order-wrap">
    <div class="order-info reveal">
      <span class="section-tag">Passer une commande</span>
      <h2 class="section-title">Commandez<br><em>facilement</em></h2>
      <div class="divider"></div>
      <p>Remplissez le formulaire et notre équipe vous contacte dans les plus brefs délais pour confirmer votre commande et vous fournir un devis personnalisé.</p>
      <div class="order-contact">
        <a class="js-wa" href="#" target="_blank">
          <span class="ico">
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style="width:22px;height:22px;fill:#25d366"><path d="M16.003 3C9.375 3 4 8.373 4 15.003c0 2.138.568 4.14 1.558 5.876L4 29l8.322-1.533A11.953 11.953 0 0 0 16.003 28C22.63 28 28 22.627 28 16.003 28 9.373 22.63 3 16.003 3zm0 2c5.518 0 10 4.483 10 10.003C26.003 20.52 21.52 26 16.003 26a9.95 9.95 0 0 1-5.14-1.432l-.367-.22-4.94.91.944-4.826-.24-.383A9.962 9.962 0 0 1 5 15.003C5 9.483 9.483 5 16.003 5zm-3.47 5c-.19 0-.5.072-.763.358-.263.286-1.003.98-1.003 2.39 0 1.41 1.026 2.772 1.168 2.963.143.19 2 3.12 4.882 4.25 2.408.95 2.882.76 3.402.712.52-.048 1.677-.685 1.913-1.346.236-.661.236-1.228.165-1.347-.071-.12-.263-.19-.55-.333-.286-.143-1.677-.828-1.938-.923-.26-.095-.45-.143-.638.143-.19.286-.735.924-.9 1.114-.166.19-.332.214-.618.071-.286-.143-1.208-.445-2.3-1.42-.852-.759-1.427-1.697-1.595-1.983-.167-.286-.018-.44.125-.583.128-.127.286-.333.429-.499.143-.167.19-.286.286-.476.095-.19.048-.357-.024-.499-.071-.143-.63-1.542-.87-2.108-.22-.537-.448-.46-.618-.468l-.524-.01z"/></svg>
          </span>
          WhatsApp — Commander directement
        </a>
        <a class="js-email" href="mailto:bobobi2007@gmail.com">
          <span class="ico">📧</span> <span class="email-label">bobobi2007@gmail.com</span>
        </a>
      </div>
    </div>
    <div class="reveal">
      <div id="orderForm">
        <div class="form-row">
          <div class="form-group"><label for="name">Nom complet *</label><input type="text" id="name" placeholder="Votre nom"></div>
          <div class="form-group"><label for="phone">Téléphone / WhatsApp *</label><input type="tel" id="phone" placeholder="+228 XX XX XX XX"></div>
        </div>
        <div class="form-group"><label for="service">Service souhaité *</label>
          <select id="service">
            <option value="">— Sélectionner un service —</option>
          </select>
        </div>
        <div class="form-group"><label for="message">Détails de votre demande</label><textarea id="message" placeholder="Décrivez votre besoin…"></textarea></div>
        <button class="form-submit" onclick="submitOrder()">Envoyer ma demande →</button>
      </div>
      <div id="orderSuccess" style="display:none;text-align:center;padding:48px 24px;border:1px solid var(--gold);background:rgba(201,168,76,.05)">
        <div style="font-size:2.5rem;margin-bottom:16px">✅</div>
        <h3 style="font-family:'Cormorant Garamond',serif;font-size:1.8rem;color:var(--gold);margin-bottom:12px">Demande envoyée !</h3>
        <p style="color:var(--gray);font-size:.85rem;line-height:1.9;margin-bottom:24px">Notre équipe vous contacte dans les plus brefs délais pour confirmer et vous faire un devis personnalisé.</p>
        <a href="#" target="_blank" class="btn-gold js-wa">Écrire sur WhatsApp →</a>
      </div>
    </div>
  </div>
</section>

<!-- AFFILIATION -->
<section id="affiliation">
  <div class="affil-wrap">
    <div class="reveal">
      <span class="section-tag">Programme d'affiliation</span>
      <h2 class="section-title">Gagnez de l'argent en<br>nous <em>recommandant</em></h2>
      <div class="divider"></div>
      <div class="affil-steps">
        <div class="affil-step"><div class="step-num">1</div><div class="step-content"><h4>Inscrivez-vous gratuitement</h4><p>Remplissez un formulaire simple et recevez votre lien d'affiliation unique par WhatsApp sous 24h.</p></div></div>
        <div class="affil-step"><div class="step-num">2</div><div class="step-content"><h4>Partagez & recommandez</h4><p>Envoyez votre lien à vos proches, sur vos réseaux ou dans vos groupes WhatsApp.</p></div></div>
        <div class="affil-step"><div class="step-num">3</div><div class="step-content"><h4>Touchez vos commissions</h4><p>À chaque commande validée via votre lien, vous gagnez une commission versée par Mobile Money.</p></div></div>
      </div>
      <a class="affil-cta js-wa-affiliate" href="#" target="_blank">Rejoindre le programme →</a>
    </div>
    <div class="reveal">
      <h3 style="font-family:'Cormorant Garamond',serif;font-size:1.4rem;margin-bottom:8px;color:var(--white)">Taux de commission par service</h3>
      <p style="font-size:.75rem;color:var(--gray);margin-bottom:16px">Inscription gratuite · Paiement hebdomadaire · Aucun minimum · Plafonné à 10%</p>
      <div class="commissions-grid" id="commissionsGrid">
        <div class="dh-loading">Chargement…</div>
      </div>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div class="footer-top">
    <div class="footer-brand">
      <div class="logo">DIVERSIFY <span>HOME</span></div>
      <p>Votre solution multi-services à Lomé, Togo. Qualité, rapidité et excellence sont nos engagements quotidiens.</p>
      <a class="footer-wa js-wa" href="#" target="_blank">
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style="width:20px;height:20px;fill:#25d366"><path d="M16.003 3C9.375 3 4 8.373 4 15.003c0 2.138.568 4.14 1.558 5.876L4 29l8.322-1.533A11.953 11.953 0 0 0 16.003 28C22.63 28 28 22.627 28 16.003 28 9.373 22.63 3 16.003 3zm0 2c5.518 0 10 4.483 10 10.003C26.003 20.52 21.52 26 16.003 26a9.95 9.95 0 0 1-5.14-1.432l-.367-.22-4.94.91.944-4.826-.24-.383A9.962 9.962 0 0 1 5 15.003C5 9.483 9.483 5 16.003 5zm-3.47 5c-.19 0-.5.072-.763.358-.263.286-1.003.98-1.003 2.39 0 1.41 1.026 2.772 1.168 2.963.143.19 2 3.12 4.882 4.25 2.408.95 2.882.76 3.402.712.52-.048 1.677-.685 1.913-1.346.236-.661.236-1.228.165-1.347-.071-.12-.263-.19-.55-.333-.286-.143-1.677-.828-1.938-.923-.26-.095-.45-.143-.638.143-.19.286-.735.924-.9 1.114-.166.19-.332.214-.618.071-.286-.143-1.208-.445-2.3-1.42-.852-.759-1.427-1.697-1.595-1.983-.167-.286-.018-.44.125-.583.128-.127.286-.333.429-.499.143-.167.19-.286.286-.476.095-.19.048-.357-.024-.499-.071-.143-.63-1.542-.87-2.108-.22-.537-.448-.46-.618-.468l-.524-.01z"/></svg>
        <span class="wa-number-label">+228 90 77 17 01</span>
      </a>
    </div>
    <div class="footer-col">
      <h4>Navigation</h4>
      <ul>
        <li><a href="#about">À propos</a></li>
        <li><a href="#services">Services</a></li>
        <li><a href="#order">Commander</a></li>
        <li><a href="#affiliation">Affiliation</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4>Contact</h4>
      <ul>
        <li><a class="js-wa" href="#" target="_blank">WhatsApp</a></li>
        <li><a class="js-email" href="mailto:bobobi2007@gmail.com">Email</a></li>
        <li><a href="#order">Formulaire</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <span class="footer-copy">© 2026 DIVERSIFY HOME — Lomé, Togo</span>
    <span class="footer-copy">Tous droits réservés</span>
  </div>
</footer>

<!-- WHATSAPP FLOAT (vrai logo SVG) -->
<a class="wa-float js-wa" href="#" target="_blank" title="Nous écrire sur WhatsApp">
  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.003 3C9.375 3 4 8.373 4 15.003c0 2.138.568 4.14 1.558 5.876L4 29l8.322-1.533A11.953 11.953 0 0 0 16.003 28C22.63 28 28 22.627 28 16.003 28 9.373 22.63 3 16.003 3zm0 2c5.518 0 10 4.483 10 10.003C26.003 20.52 21.52 26 16.003 26a9.95 9.95 0 0 1-5.14-1.432l-.367-.22-4.94.91.944-4.826-.24-.383A9.962 9.962 0 0 1 5 15.003C5 9.483 9.483 5 16.003 5zm-3.47 5c-.19 0-.5.072-.763.358-.263.286-1.003.98-1.003 2.39 0 1.41 1.026 2.772 1.168 2.963.143.19 2 3.12 4.882 4.25 2.408.95 2.882.76 3.402.712.52-.048 1.677-.685 1.913-1.346.236-.661.236-1.228.165-1.347-.071-.12-.263-.19-.55-.333-.286-.143-1.677-.828-1.938-.923-.26-.095-.45-.143-.638.143-.19.286-.735.924-.9 1.114-.166.19-.332.214-.618.071-.286-.143-1.208-.445-2.3-1.42-.852-.759-1.427-1.697-1.595-1.983-.167-.286-.018-.44.125-.583.128-.127.286-.333.429-.499.143-.167.19-.286.286-.476.095-.19.048-.357-.024-.499-.071-.143-.63-1.542-.87-2.108-.22-.537-.448-.46-.618-.468l-.524-.01z"/>
  </svg>
</a>
<div class="wa-tooltip">Écrire sur WhatsApp</div>

<!-- TOAST -->
<div class="toast" id="toast"></div>

<!-- Client Supabase (bibliothèque officielle) -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<!-- Scripts du site, dans cet ordre précis -->
<script src="supabase-client.js"></script>
<script src="site-data.js"></script>
<script src="order-form.js"></script>
<script src="main.js"></script>
</body>
</html>
