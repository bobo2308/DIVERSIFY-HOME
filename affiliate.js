/* DIVERSIFY HOME — styles affiliation (utilise les variables de dh_styles.css) */
.aff-overlay{position:fixed;inset:0;background:rgba(0,0,0,.82);display:none;align-items:center;justify-content:center;z-index:9000;padding:16px;overflow-y:auto}
.aff-overlay.open{display:flex}
.aff-box{position:relative;background:var(--deep);border:1px solid var(--gold);width:100%;max-width:560px;max-height:92vh;overflow-y:auto;padding:40px 32px}
.aff-close{position:absolute;top:12px;right:14px;background:none;border:none;color:var(--gray);font-size:1.1rem;cursor:pointer}
.aff-title{font-family:'Cormorant Garamond',serif;font-size:1.9rem;font-weight:400;color:var(--white);margin:8px 0 22px}
.aff-error{color:#d98a8a;font-size:.75rem;min-height:18px;margin:4px 0}
.aff-alt,.aff-note{color:var(--gray);font-size:.78rem;line-height:1.8;margin-top:16px}
.aff-alt a{color:var(--gold)}
.aff-label{display:block;color:var(--gold);font-size:.62rem;letter-spacing:3px;text-transform:uppercase;margin:22px 0 8px}
.aff-link input{width:100%;background:var(--card-bg);border:1px solid rgba(201,168,76,.3);color:var(--white);padding:13px;font-size:.8rem}
.aff-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}
.aff-wa{background:#25d366}
.aff-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:22px}
.aff-stat{border:1px solid rgba(201,168,76,.2);background:var(--card-bg);padding:14px 8px;text-align:center}
.aff-stat b{display:block;font-family:'Cormorant Garamond',serif;font-size:1.25rem;color:var(--gold)}
.aff-stat span{font-size:.6rem;letter-spacing:1.5px;text-transform:uppercase;color:var(--gray)}
.aff-badge{display:inline-block;font-size:.62rem;letter-spacing:2px;text-transform:uppercase;padding:4px 10px;border:1px solid var(--gray);color:var(--gray)}
.aff-badge.aff-active{border-color:#4caf7a;color:#4caf7a}.aff-badge.aff-suspended{border-color:#d98a8a;color:#d98a8a}
.aff-table{overflow-x:auto}.aff-table table{width:100%;border-collapse:collapse;font-size:.72rem;color:var(--white-dim)}
.aff-table th{color:var(--gold);text-align:left;font-weight:600;padding:8px 6px;border-bottom:1px solid rgba(201,168,76,.3)}
.aff-table td{padding:8px 6px;border-bottom:1px solid rgba(255,255,255,.06)}
.aff-subtle{display:block;margin-top:14px;font-size:.72rem;color:var(--gold);letter-spacing:1px}
@media(max-width:520px){.aff-box{padding:32px 18px}.aff-actions{grid-template-columns:1fr}.aff-stats{grid-template-columns:repeat(2,1fr)}}

/* ===== Couleurs noir et or de l'espace affilié (indépendantes du thème bleu du site) ===== */
.aff-box{--black:#0a0a0a;--deep:#111111;--gold:#c9a84c;--gold-light:#e2c07a;--gold-dark:#9a7730;--white:#f5f5f0;--white-dim:#cccccc;--gray:#888888;--card-bg:#181818}

/* ===== Mobile Money ===== */
.aff-pay-row{display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap}
.aff-pay{background:transparent;border:1px solid rgba(201,168,76,.4);color:#cccccc;font-family:inherit;font-size:.8rem;padding:10px 16px;cursor:pointer;border-radius:2px}
.aff-pay.on{background:#c9a84c;border-color:#c9a84c;color:#0a0a0a;font-weight:700}
.aff-payout{display:flex;justify-content:space-between;align-items:center;gap:10px;background:#181818;border:1px solid rgba(201,168,76,.25);padding:12px 14px;font-size:.85rem;color:#f5f5f0}
.aff-payout b{color:#e2c07a}
.aff-pay-edit{background:none;border:1px solid #c9a84c;color:#c9a84c;font-family:inherit;font-size:.72rem;padding:7px 12px;cursor:pointer;white-space:nowrap}

/* ===== Gains : en attente / accessible ===== */
.aff-msg{font-size:.82rem;line-height:1.6;padding:12px 14px;margin:10px 0;border:1px solid rgba(201,168,76,.25);background:#181818;color:#f5f5f0}
.aff-msg b{color:#e2c07a}
.aff-ok{color:#8fc28f}
.aff-wait{color:#e2c07a}
.aff-table .aff-wait{font-size:.7rem;line-height:1.4;display:inline-block}
