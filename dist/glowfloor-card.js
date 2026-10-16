/**
 * GlowFloor Card — a dependency-free Home Assistant Lovelace custom card.
 * Copyright (c) 2026 luigi-regolo. SPDX-License-Identifier: GPL-3.0-only.
 */

const MAX_SCENES = 3;
const CARD_TAG = 'glowfloor-card';
const EDITOR_TAG = 'glowfloor-card-editor';
const BULB_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6m-5 3h4M8 14.5a6 6 0 1 1 8 0c-1.25 1-1.4 2.5-1.4 3.5H9.4c0-1-.15-2.5-1.4-3.5Z"/></svg>';
const POWER_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2v10m-6.36-6.36a9 9 0 1 0 12.72 0"/></svg>';
const BUILTIN_FLOORPLAN = `<svg class="floor" viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs><pattern id="gf-hatch" width="19" height="19" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V19" class="tile"/></pattern><pattern id="gf-tile" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" class="tile"/></pattern></defs>
  <path class="room" d="M64 66H840V542H64Z"/><path class="room-alt" d="M407 66H840V303H407Z M407 316H650V542H407Z"/><path fill="url(#gf-hatch)" opacity=".4" d="M73 75H394V530H73Z"/><path fill="url(#gf-tile)" opacity=".4" d="M665 319H833V535H665Z"/>
  <path class="wall" d="M64 66H840V542H64V66Z M401 66V196 M401 246V542 M401 303H568 M623 303H840 M656 303V359 M656 417V542"/><path class="door" d="M401 246Q453 244 453 192 M623 303Q620 354 571 354 M656 417Q710 414 710 362"/>
  <rect class="furn" x="104" y="333" width="112" height="64" rx="12"/><rect class="thin" x="110" y="345" width="104" height="41" rx="8"/><path class="thin" d="M163 346V386"/><rect class="furn" x="102" y="402" width="43" height="25" rx="6"/><rect class="furn" x="237" y="338" width="102" height="52" rx="10"/><ellipse class="thin" cx="287" cy="364" rx="35" ry="16"/><rect class="furn" x="110" y="104" width="168" height="14" rx="2"/><circle class="thin" cx="340" cy="470" r="23"/><path class="thin" d="M332 470c0-11 16-11 16 0M340 449v42"/>
  <rect class="furn" x="430" y="88" width="351" height="36" rx="5"/><rect class="furn" x="744" y="122" width="38" height="116" rx="4"/><rect class="thin" x="468" y="94" width="55" height="22" rx="5"/><path class="thin" d="M496 94V116 M468 105H523"/><circle class="thin" cx="698" cy="106" r="7"/><circle class="thin" cx="725" cy="106" r="7"/><rect class="furn" x="525" y="157" width="132" height="69" rx="12"/><rect class="thin" x="539" y="141" width="29" height="13" rx="5"/><rect class="thin" x="608" y="141" width="29" height="13" rx="5"/><rect class="thin" x="539" y="228" width="29" height="13" rx="5"/><rect class="thin" x="608" y="228" width="29" height="13" rx="5"/>
  <rect class="furn" x="452" y="361" width="162" height="143" rx="10"/><rect class="thin" x="466" y="374" width="63" height="37" rx="9"/><rect class="thin" x="537" y="374" width="63" height="37" rx="9"/><path class="thin" d="M465 425H600"/><rect class="furn" x="423" y="359" width="22" height="39" rx="5"/><rect class="furn" x="621" y="359" width="20" height="39" rx="5"/><rect class="furn" x="690" y="347" width="116" height="70" rx="12"/><path class="thin" d="M702 347V402 M700 364H803"/><ellipse class="thin" cx="758" cy="469" rx="32" ry="25"/><ellipse class="thin" cx="758" cy="469" rx="23" ry="16"/>
  <text class="room-label" x="240" y="165">LIVING</text><text class="micro" x="240" y="184">32.5 M²</text><text class="room-label" x="615" y="276">KITCHEN</text><text class="room-label" x="530" y="530">BEDROOM</text><text class="micro" x="750" y="528">BATH</text>
</svg>`;

const STYLE = `
:host{display:block;font-family:var(--ha-font-family-body,var(--paper-font-body1_-_font-family,Roboto,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif));--gf-accent:#ffca82;color:var(--gf-ink);box-sizing:border-box}
*,*::before,*::after{box-sizing:border-box}
:host([data-theme="dark"]){--gf-frame:#141e26;--gf-line:#32414c;--gf-plan:#1d2932;--gf-room:#27343d;--gf-room2:#23303a;--gf-wall:#647783;--gf-furn:#8798a2;--gf-furn-fill:#344550;--gf-ink:#f1f5f6;--gf-muted:#a0b0b9;--gf-chip:#23313a;--gf-chip-border:#42515a;--gf-off:#34424d;--gf-off-line:#71818c;--gf-off-ink:#f1f5f6;--gf-glass:rgba(24,35,45,.91)}
:host([data-theme="light"]){--gf-frame:#fbfcfb;--gf-line:#dce3e4;--gf-plan:#eef0ec;--gf-room:#e8e9e4;--gf-room2:#dfe5e5;--gf-wall:#87989a;--gf-furn:#9dada9;--gf-furn-fill:#dee4e0;--gf-ink:#1d2c32;--gf-muted:#65787e;--gf-chip:#f2f4f2;--gf-chip-border:#d9dfdd;--gf-off:#fff;--gf-off-line:#8b9a9e;--gf-off-ink:#27383d;--gf-glass:rgba(248,250,249,.94)}
.shell{display:block;border:1px solid var(--gf-line);border-radius:23px;background:var(--gf-frame);box-shadow:0 8px 28px #00000016;overflow:hidden;padding:20px 20px 17px}
.bar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px;flex-wrap:wrap}.intro{min-width:0}.intro[hidden],.intro [hidden]{display:none}.eyebrow{color:var(--gf-muted);font-size:10px;font-weight:750;letter-spacing:1.8px;text-transform:uppercase;margin-bottom:5px}.title{color:var(--gf-ink);font-size:clamp(19px,2.6vw,26px);line-height:1.16;letter-spacing:-.7px;font-weight:750;overflow-wrap:anywhere}.title .dot{color:#e6a663}.sub{font-size:12px;color:var(--gf-muted);margin-top:5px}.tools{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.count,.action,.theme{border:1px solid var(--gf-chip-border);border-radius:999px;background:var(--gf-chip);color:var(--gf-ink);font:inherit;font-size:11px;font-weight:670;white-space:nowrap;min-height:36px}.count{display:flex;align-items:center;gap:8px;padding:9px 12px}.count::before{content:"";width:7px;height:7px;background:#f6b76a;border-radius:50%;box-shadow:0 0 8px #f6b76a77}.action{display:inline-flex;align-items:center;gap:7px;padding:8px 12px;cursor:pointer}.action svg{width:14px;height:14px}.action:disabled{opacity:.48;cursor:not-allowed}.action:not(:disabled):hover,.scene:hover{filter:brightness(1.09)}.theme{padding:4px;display:flex;gap:2px}.theme button{cursor:pointer;border:0;background:transparent;color:var(--gf-muted);font:inherit;font-size:11px;border-radius:99px;padding:6px 10px}.theme button[aria-pressed="true"]{color:var(--gf-ink);background:var(--gf-frame);box-shadow:0 1px 6px #00000019}
.plan{position:relative;width:100%;background:var(--gf-plan);border:1px solid var(--gf-line);border-radius:16px;overflow:hidden;isolation:isolate;line-height:0}
/* Each pool of light sits on top of the floorplan, behind its control marker. */
.spill{position:absolute;z-index:1;aspect-ratio:1;pointer-events:none;transform:translate(-50%,-50%) scale(.72);border-radius:50%;opacity:0;transition:opacity .32s ease,transform .52s cubic-bezier(.16,.8,.25,1);filter:blur(5px);background:radial-gradient(circle,rgba(var(--gf-light-rgb,255,194,116),.52) 0%,rgba(var(--gf-light-rgb,255,194,116),.29) 22%,rgba(var(--gf-light-rgb,255,194,116),.13) 45%,rgba(var(--gf-light-rgb,255,194,116),0) 72%)}
.spill.on{opacity:var(--gf-light-strength,.85);transform:translate(-50%,-50%) scale(1)}
:host([data-theme="dark"]) .spill{mix-blend-mode:screen}
:host([data-theme="light"]) .spill{filter:blur(4px)}
.plan::after{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at center,transparent 48%,#00000012 100%)}.floor,.floor-image{width:100%;height:auto;display:block}.floor .room{fill:var(--gf-room)}.floor .room-alt{fill:var(--gf-room2)}.floor .wall{stroke:var(--gf-wall);stroke-width:8;fill:none}.floor .furn{stroke:var(--gf-furn);stroke-width:2.2;fill:var(--gf-furn-fill)}.floor .thin,.floor .door{stroke:var(--gf-furn);stroke-width:2;fill:none}.floor .door{stroke-dasharray:4 4}.floor .room-label,.floor .micro{font-size:15px;letter-spacing:3px;fill:var(--gf-muted);font-weight:700;text-anchor:middle}.floor .micro{font-size:10px;letter-spacing:2px}.floor .tile{stroke:var(--gf-furn);stroke-width:1;opacity:.24}
.marker{position:absolute;z-index:2;transform:translate(-50%,-50%);border:0;padding:0;background:transparent;min-width:44px;color:var(--gf-ink);font:inherit;cursor:pointer;display:flex;flex-direction:column;gap:6px;align-items:center;line-height:1.15;max-width:130px;-webkit-tap-highlight-color:transparent}.orb{display:grid;place-items:center;width:var(--gf-marker-size,32px);height:var(--gf-marker-size,32px);border-radius:50%;background:var(--gf-off);border:1.5px solid var(--gf-off-line);color:var(--gf-off-ink);box-shadow:0 4px 16px #02070848,inset 0 1px 1px #ffffff18;transition:transform .2s ease,box-shadow .2s ease,background .2s ease;position:relative}.orb::before{content:"";position:absolute;inset:-5px;border:1px solid var(--gf-off-line);opacity:.35;border-radius:50%;pointer-events:none}.orb svg{width:calc(var(--gf-marker-size,32px) * .4);height:calc(var(--gf-marker-size,32px) * .4);display:block}.marker.on .orb{background:linear-gradient(145deg,#ffe4ad,#f4ad55);border-color:#fff0cb;color:#583713;box-shadow:0 0 0 5px #efb8711e,0 0 25px 9px #f5ad6270,0 7px 24px #02090a35}.marker.on .orb::before{border-color:#ffd499;opacity:.85;box-shadow:0 0 16px #f9b46e88}.marker:not(:disabled):hover .orb{transform:scale(1.06)}.marker:disabled{cursor:not-allowed}.marker.unavailable .orb{opacity:.55;border-style:dashed}.marker:focus-visible .orb,.action:focus-visible,.scene:focus-visible,.theme button:focus-visible{outline:3px solid #74b1ff;outline-offset:4px}.marker-name{border:1px solid var(--gf-chip-border);background:var(--gf-glass);backdrop-filter:blur(10px);border-radius:999px;padding:5px 8px;display:flex;align-items:center;gap:6px;max-width:120px;font-size:10px;font-weight:700;line-height:1.1;box-shadow:0 3px 12px #00000023}.marker-name span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.marker-name::before{content:"";flex-shrink:0;width:5px;height:5px;border-radius:50%;background:var(--gf-off-line)}.marker.on .marker-name::before{background:#ffb867;box-shadow:0 0 7px #ffb867}
.scene-dock[hidden]{display:none}.scene-dock{border-top:1px solid var(--gf-line);margin-top:16px;padding-top:14px;display:flex;align-items:center;flex-wrap:wrap;gap:8px}.dock-label{font-size:10px;letter-spacing:1.5px;font-weight:750;color:var(--gf-muted);margin-right:6px;text-transform:uppercase}.scene{border:1px solid var(--gf-chip-border);background:var(--gf-chip);border-radius:999px;color:var(--gf-ink);font:inherit;font-size:11px;padding:10px 13px;cursor:pointer;white-space:nowrap}.error{margin-top:12px;font-size:12px;color:#d56b59}
@media(max-width:520px){.shell{padding:15px 11px 14px;border-radius:18px}.bar{gap:11px;padding:0 5px}.intro{width:100%}.tools{width:100%;justify-content:space-between;gap:5px}.count,.action{min-height:32px;padding:7px 10px;font-size:10px}.theme button{font-size:10px;padding:6px 8px}.plan{border-radius:12px}.marker{gap:4px}.marker-name{font-size:8px;padding:4px 5px;max-width:74px}.orb{width:var(--gf-marker-size,32px);height:var(--gf-marker-size,32px)}.orb svg{width:calc(var(--gf-marker-size,32px) * .4);height:calc(var(--gf-marker-size,32px) * .4)}.scene-dock{gap:6px}.scene{padding:8px 10px;font-size:10px}}
@media(prefers-reduced-motion:reduce){.orb,.spill{transition:none!important}}
`;

const EDITOR_STYLE = `
:host{display:block;color:var(--primary-text-color);font-family:var(--ha-font-family-body,var(--paper-font-body1_-_font-family,Roboto,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif));font-size:var(--ha-font-size-m,14px);font-weight:var(--ha-font-weight-normal,400);line-height:var(--ha-line-height-normal,1.5)}
*{box-sizing:border-box} .editor{display:grid;gap:16px;padding:8px 2px 16px}
.nav{display:flex;gap:4px;overflow-x:auto;padding:0;border:0;scrollbar-width:thin}
.nav button{flex:0 0 auto;padding:10px 12px;appearance:none;-webkit-appearance:none;border:0!important;border-bottom:0!important;border-radius:10px;background:transparent;color:var(--secondary-text-color,#65747a);font:inherit;font-weight:var(--ha-font-weight-medium,500);font-size:var(--ha-font-size-m,14px);cursor:pointer;box-shadow:none!important;outline:none;transition:background-color .15s ease}
.nav button[aria-selected="true"]{background:rgba(111,119,128,.28);color:var(--primary-text-color,#16342d);box-shadow:none!important;border:0!important;border-bottom:0!important;outline:none}
.nav button::before,.nav button::after{content:none!important;display:none!important}.nav button:focus-visible{outline:2px solid var(--secondary-text-color,#667a7b);outline-offset:2px}
.section{display:grid;gap:16px;min-width:0;background:var(--ha-card-background,var(--card-background-color,#fff));border:1px solid var(--divider-color,#e4e6e4);border-radius:var(--ha-border-radius-lg,22px);padding:20px;box-shadow:var(--ha-card-box-shadow,0 4px 20px #00000008)}.section[hidden]{display:none}
.section-title{font-size:var(--ha-font-size-xl,22px);font-weight:var(--ha-font-weight-normal,400);line-height:1.28;letter-spacing:normal;margin:4px 0 2px}.heading-row{display:flex;align-items:center;justify-content:space-between;gap:8px}
.row{display:flex;gap:12px;flex-wrap:wrap}.field{display:grid;gap:8px;flex:1;min-width:150px;font-size:var(--ha-font-size-m,14px);font-weight:var(--ha-font-weight-normal,400)}
input:not([type="range"]),select{color:var(--primary-text-color,#203039);font:inherit;font-size:var(--ha-font-size-m,14px);min-height:50px;padding:12px 14px;border:0;border-bottom:1px solid var(--divider-color,#a4afae);border-radius:var(--ha-border-radius-md,6px) var(--ha-border-radius-md,6px) 0 0;background:var(--secondary-background-color,#f3f3f3);width:100%;max-width:100%}
ha-selector{display:block;width:100%;min-width:0;--mdc-theme-primary:var(--primary-color,#218575)}
button{cursor:pointer;color:var(--primary-text-color,#203039);border:1px solid var(--divider-color,#ced8d8);background:var(--card-background-color,#fff);border-radius:var(--ha-border-radius-lg,18px);padding:10px 14px;font:inherit;font-size:var(--ha-font-size-m,14px);min-height:42px}
button:focus-visible,input:focus-visible,select:focus-visible,.map:focus-visible{outline:2px solid var(--primary-color,#218575);outline-offset:2px}
.nav button:focus-visible{outline-color:var(--secondary-text-color,#667a7b)!important}
.primary{background:var(--primary-color,#247e6b);color:var(--text-primary-color,#fff);border-color:transparent;font-weight:var(--ha-font-weight-medium,500)}.delete{color:var(--error-color,#bd4c40)}
.hint{font-size:var(--ha-font-size-s,13px);color:var(--secondary-text-color,#667a7b);line-height:1.5}
.items{display:grid;gap:12px}.item{border:1px solid var(--divider-color,#d6ddda);background:var(--secondary-background-color,#f7f7f7);padding:16px;border-radius:var(--ha-border-radius-lg,18px);display:grid;gap:12px}.item.selected{border-color:var(--divider-color,#d6ddda);box-shadow:0 0 0 1px var(--secondary-text-color,#87909033)}
.item-head{display:flex;align-items:center;justify-content:space-between;gap:8px}.item-head strong{font-size:var(--ha-font-size-m,14px)}.item-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;min-width:0}.item-grid .wide{grid-column:1/-1}
.selector-fallback{display:none}.native-missing .selector-fallback{display:block}.native-missing ha-selector{display:none}
.map{border:1px solid var(--divider-color,#d6ddda);border-radius:13px;position:relative;cursor:crosshair;overflow:hidden;background:var(--secondary-background-color,#e8ecec);line-height:0;isolation:isolate}
.map svg,.map img{width:100%;height:auto;display:block}.map svg .room{fill:#e7e9e8}.map svg .room-alt{fill:#dce3e1}.map svg .wall{stroke:#93a3a7;stroke-width:8;fill:none}.map svg .furn{stroke:#93a3a7;stroke-width:2;fill:#d6dddd}.map svg .thin,.map svg .door{stroke:#93a3a7;stroke-width:2;fill:none}.map svg .room-label,.map svg .micro{fill:#56656a;font-size:14px;text-anchor:middle}.map svg .tile{stroke:#bac7c7}
.pin{position:absolute;display:grid;place-items:center;transform:translate(-50%,-50%);width:27px;height:27px;border-radius:50%;background:#41535b;color:#fff;border:2px solid #fff;box-shadow:0 2px 6px #0004;font-size:11px;line-height:1;pointer-events:none}.pin.selected{background:#f1ac54;outline:3px solid #e9a34f66}
.image-empty{border:1px dashed var(--divider-color,#bacac7);border-radius:11px;padding:24px 12px;text-align:center;color:var(--secondary-text-color,#65777a);font-size:12px}
.scenes{display:grid;gap:12px}.sceneitem{border:1px solid var(--divider-color,#d6ddda);background:var(--secondary-background-color,#f7f7f7);padding:16px;border-radius:var(--ha-border-radius-lg,18px);display:grid;gap:12px}.scene-head{display:flex;align-items:center;justify-content:space-between}
.advanced{border:1px solid var(--divider-color,#d6ddda);background:var(--secondary-background-color,#f7f7f7);border-radius:var(--ha-border-radius-lg,18px);padding:16px;display:grid;gap:12px}
@media(max-width:480px){.nav button{padding:9px 8px;font-size:var(--ha-font-size-s,12px)}.section{padding:14px;border-radius:var(--ha-border-radius-lg,18px)}.item,.sceneitem,.advanced{padding:12px}.section-title{font-size:var(--ha-font-size-l,20px)}.item-grid{grid-template-columns:1fr}.field{min-width:0}}
/* Home Assistant renders native media/entity fields; do not override their internal typography. */
ha-selector{font-family:inherit;font-size:inherit}
.media-selectors{display:grid;gap:16px}
.size-control{display:grid;gap:8px}.size-control label{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:var(--ha-font-size-m,14px);font-weight:var(--ha-font-weight-medium,500)}.size-control input[type="range"]{width:100%;height:28px;min-height:28px;padding:0;background:transparent;accent-color:var(--primary-color,#218575);border:0}.size-limits{display:flex;justify-content:space-between;color:var(--secondary-text-color,#667a7b);font-size:var(--ha-font-size-s,12px)}
.image-message{color:var(--error-color,#bd4c40);font-size:var(--ha-font-size-s,12px);line-height:1.45}

`;

const isValidEntity = (id, domain) => typeof id === 'string' && new RegExp(`^${domain}\\.[a-z0-9_]+$`).test(id);
const coordinate = (v, defaultValue = 50) => Number.isFinite(Number(v)) ? Math.max(0, Math.min(100, Number(v))) : defaultValue;
const markerSize = (v, fallback = 32) => v != null && typeof v !== 'boolean' && String(v).trim() !== '' && Number.isFinite(Number(v)) ? Math.max(32, Math.min(76, Math.round(Number(v)))) : fallback;
const spillSize = (v) => Number.isFinite(Number(v)) ? Math.max(12, Math.min(75, Number(v))) : 32;
const spillRgb = (v) => Array.isArray(v) && v.length === 3 && v.every(n => Number.isFinite(n) && n >= 0 && n <= 255) ? v.map(n => Math.round(n)).join(',') : '255,194,116';
const validImage = (value) => typeof value === 'string' && (/^\/(?!\/)/.test(value) || /^https:\/\//i.test(value) || /^media-source:\/\/[^\s]+$/.test(value));
const imageContentId = (value) => typeof value === 'string' ? value : (value && typeof value === 'object' ? value.media_content_id : null);
const normalizeImage = (value) => {
  const id=imageContentId(value);
  if(!validImage(id))return null;
  return typeof value === 'object'
    ? {media_content_id:id,media_content_type:typeof value.media_content_type==='string'?value.media_content_type:'image/*'}
    : id;
};
const mediaPickerValue = (value) => value ? (typeof value === 'string' ? {media_content_id:value} : value) : undefined;
const resolveFloorplanImage = async (hass,value,cache={}) => {
  const id=imageContentId(value);
  if(!validImage(id))throw new Error('Unsupported floorplan image reference.');
  if(!id.startsWith('media-source://')) return id.startsWith('/') && hass?.hassUrl ? hass.hassUrl(id) : id;
  if(cache.id===id && cache.expires>Date.now())return cache.url;
  if(cache.pendingId===id && cache.pending)return cache.pending;
  if(!hass?.callWS)throw new Error('Home Assistant media resolver unavailable.');
  const pending=(async()=>{
    const result=await hass.callWS({type:'media_source/resolve_media',media_content_id:id});
    if(!validImage(result?.url))throw new Error('Invalid resolved media URL.');
    const url=result.url.startsWith('/') && hass.hassUrl ? hass.hassUrl(result.url) : result.url;
    cache.id=id;cache.url=url;cache.expires=Date.now()+23*60*60*1000;
    return url;
  })();
  cache.pendingId=id;cache.pending=pending;
  try{return await pending;}finally{if(cache.pending===pending){delete cache.pending;delete cache.pendingId;}}
};
const defaultConfig = () => ({ eyebrow: 'GLOWFLOOR / INTERACTIVE PLAN', title: 'Living spaces', subtitle: '', theme_mode: 'auto', spill_enabled: true, marker_size: 32, lights: [] });
const normalizeConfig = (raw) => {
  if (!raw || typeof raw !== 'object') throw new Error('GlowFloor: invalid configuration.');
  return {
    ...defaultConfig(), ...raw,
    eyebrow: String(raw.eyebrow ?? 'GLOWFLOOR / INTERACTIVE PLAN').slice(0, 100),
    title: String(raw.title ?? 'Living spaces').slice(0, 120),
    subtitle: String(raw.subtitle ?? '').slice(0, 200),
    theme_mode: ['auto', 'dark', 'light'].includes(raw.theme_mode) ? raw.theme_mode : 'auto',
    spill_enabled: raw.spill_enabled !== false,
    marker_size: markerSize(raw.marker_size),
    image: normalizeImage(raw.image),
    lights: (Array.isArray(raw.lights) ? raw.lights : []).slice(0, 60).filter(item => item && typeof item === 'object').map(item => ({
      entity: typeof item.entity === 'string' ? item.entity.trim() : '',
      name: String(item.name || item.entity || 'Light').slice(0, 60),
      x: coordinate(item.x), y: coordinate(item.y), spread: spillSize(item.spread),
      size: markerSize(item.size, null),
    })),
    scenes: (Array.isArray(raw.scenes) ? raw.scenes : []).slice(0, MAX_SCENES).filter(item => item && typeof item === 'object').map(item => ({
      entity: typeof item.entity === 'string' ? item.entity.trim() : '',
      name: String(item.name || item.entity || 'Scene').slice(0, 40),
    })),
  };
};

class GlowFloorCard extends HTMLElement {
  static getStubConfig() { return { ...defaultConfig() }; }
  static getConfigElement() { return document.createElement(EDITOR_TAG); }
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this._config = null;
    this._hass = null;
    this._markerElements = [];
    this._spillElements = [];
    this._imageCache={};this._imageRequest=0;
    this._media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    this._onMedia = () => this._updateTheme();
    this._media?.addEventListener?.('change',this._onMedia);
  }
  disconnectedCallback(){ this._media?.removeEventListener?.('change',this._onMedia); }
  setConfig(raw){
    const next=normalizeConfig(raw);
    const prev=this._config;
    this._config=next;
    // Keep the floorplan image mounted when lights or scenes change.
    // Replacing the whole card makes large uploaded images visibly redraw top-to-bottom.
    if(prev && this.shadowRoot.querySelector('.shell')
      && JSON.stringify(prev.image)===JSON.stringify(next.image)){
      const sameOverlays=prev.lights.length===next.lights.length
        && prev.lights.every((light,index)=>light.entity===next.lights[index].entity);
      if(!sameOverlays)this._rebuildOverlays();
      if(JSON.stringify(prev.scenes)!==JSON.stringify(next.scenes))this._refreshScenes();
      this._refreshCardConfig();
    }else this._render();
  }
  _rebuildOverlays(){
    const c=this._config,plan=this.shadowRoot.querySelector('.plan');
    if(!plan)return;
    plan.querySelectorAll('.marker,.spill').forEach(el=>el.remove());
    this._spillElements = c.lights.map(light => {
      const spill=document.createElement('div');spill.className='spill';
      spill.style.left=`${light.x}%`;spill.style.top=`${light.y}%`;
      spill.style.width=`${light.spread}%`;
      spill.setAttribute('aria-hidden','true');plan.append(spill);return spill;
    });
    this._markerElements=c.lights.map((light,index)=>{
      const button=document.createElement('button');button.type='button';button.className='marker';button.style.setProperty('--gf-marker-size',`${light.size ?? c.marker_size}px`);button.style.left=`${light.x}%`;button.style.top=`${light.y}%`;button.title=light.name;
      button.innerHTML=`<span class="orb">${BULB_SVG}</span><span class="marker-name"><span></span></span>`;
      button.querySelector('.marker-name span').textContent=light.name;
      button.addEventListener('click',()=>{
        if(button.dataset.suppressClick==='true'){button.dataset.suppressClick='false';return;}
        this._toggle(light.entity);
      });
      button.addEventListener('contextmenu',event=>{event.preventDefault();this._moreInfo(light.entity);});
      let holdTimer=null;
      button.addEventListener('pointerdown',ev=>{
        if(ev.button!==0)return;
        holdTimer=setTimeout(()=>{holdTimer=null;button.dataset.suppressClick='true';this._moreInfo(light.entity);},600);
      });
      const clearHold=()=>{if(holdTimer!==null){clearTimeout(holdTimer);holdTimer=null;}};
      for(const evt of ['pointerup','pointercancel','pointerleave'])button.addEventListener(evt,clearHold);
      plan.append(button);return button;
    });
  }
  _refreshScenes(){
    const c=this._config,root=this.shadowRoot;
    const dock=root.querySelector('.scene-dock');
    if(!dock)return;
    dock.querySelectorAll('.scene').forEach(el=>el.remove());
    const scenes=c.scenes.filter(item=>isValidEntity(item.entity,'scene'));
    dock.hidden=scenes.length===0;
    scenes.forEach(scene=>{const b=document.createElement('button');b.type='button';b.className='scene';b.textContent=scene.name;b.title=`Activate ${scene.name}`;b.addEventListener('click',()=>this._callService('scene','turn_on',{entity_id:scene.entity}));dock.append(b);});
  }
  _refreshCardConfig(){
    const c=this._config, root=this.shadowRoot;
    const eyebrow=root.querySelector('.eyebrow');eyebrow.textContent=c.eyebrow;eyebrow.hidden=!c.eyebrow;
    const title=root.querySelector('.title');title.textContent=c.title;title.hidden=!c.title;
    if(c.title){const dot=document.createElement('span');dot.className='dot';dot.textContent='.';title.append(dot);}
    const sub=root.querySelector('.sub');sub.textContent=c.subtitle;sub.hidden=!c.subtitle;
    root.querySelector('.intro').hidden=!(c.eyebrow||c.title||c.subtitle);
    c.lights.forEach((light,index)=>{
      const button=this._markerElements[index],spill=this._spillElements[index];
      if(button){
        button.style.left=`${light.x}%`;button.style.top=`${light.y}%`;
        button.style.setProperty('--gf-marker-size',`${light.size ?? c.marker_size}px`);
        button.querySelector('.marker-name span').textContent=light.name;button.title=light.name;
      }
      if(spill){spill.style.left=`${light.x}%`;spill.style.top=`${light.y}%`;spill.style.width=`${light.spread}%`;}
    });
    this._updateTheme();this._refreshStates();
  }
  set hass(value){ this._hass=value; this._updateTheme(); this._refreshStates(); this._loadCardImage(); }
  get hass(){return this._hass;}
  getCardSize(){return 5;}
  _updateTheme(){
    if(!this._config) return;
    const mode=this._config.theme_mode;
    const prefersDark=typeof this._hass?.themes?.darkMode === 'boolean' ? this._hass.themes.darkMode : (this._media?.matches ?? true);
    this.dataset.theme=mode==='auto'?(prefersDark?'dark':'light'):mode;
    this.shadowRoot.querySelectorAll('[data-mode]').forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.mode===mode)));
  }
  _render(){
    const c=this._config;
    if(!c)return;
    const root=this.shadowRoot;
    root.innerHTML=`<style>${STYLE}</style><ha-card class="shell"><div class="bar"><div class="intro"><div class="eyebrow"></div><div class="title"></div><div class="sub"></div></div><div class="tools"><div class="count" role="status" aria-live="polite">0 lights on</div><button class="action all-off" type="button" disabled>${POWER_SVG}<span>Turn all off</span></button><div class="theme" role="group" aria-label="Theme mode"><button type="button" data-mode="auto">Auto</button><button type="button" data-mode="dark">Dark</button><button type="button" data-mode="light">Light</button></div></div></div><div class="plan"></div><div class="scene-dock" hidden><span class="dock-label">SCENES</span></div><div class="error" role="alert" hidden></div></ha-card>`;
    const eyebrow=root.querySelector('.eyebrow');eyebrow.textContent=c.eyebrow;eyebrow.hidden=!c.eyebrow;
    const title=root.querySelector('.title');title.textContent=c.title;title.hidden=!c.title;
    if(c.title){const dot=document.createElement('span');dot.className='dot';dot.textContent='.';title.append(dot);}
    const sub=root.querySelector('.sub');sub.textContent=c.subtitle;sub.hidden=!c.subtitle;
    root.querySelector('.intro').hidden=!(c.eyebrow||c.title||c.subtitle);
    const plan=root.querySelector('.plan');
    if(c.image){const img=document.createElement('img');img.className='floor-image';img.alt='Piantina';img.loading='lazy';img.referrerPolicy='no-referrer';img.onerror=()=>{this._showError('Impossibile caricare la piantina. Controlla il file selezionato.');};plan.append(img);this._loadCardImage();} else {plan.insertAdjacentHTML('afterbegin',BUILTIN_FLOORPLAN);}
    this._rebuildOverlays();
    root.querySelector('.all-off').addEventListener('click',()=>this._turnAllOff());
    root.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{this._config.theme_mode=b.dataset.mode;this._updateTheme();}));
    this._refreshScenes();
    this._updateTheme();this._refreshStates();
  }
  async _loadCardImage(){
    const img=this.shadowRoot.querySelector('.floor-image');
    if(!img || !this._config?.image)return;
    const request=++this._imageRequest;
    try{
      const url=await resolveFloorplanImage(this._hass,this._config.image,this._imageCache);
      if(request!==this._imageRequest || !img.isConnected)return;
      if(img.src!==url)img.src=url;this._showError('');
    }catch(error){if(request===this._imageRequest && this._hass)this._showError('Non riesco a leggere la piantina da Home Assistant. Riprova a selezionarla.');}
  }
  _showError(message){const el=this.shadowRoot.querySelector('.error');if(el){el.textContent=message;el.hidden=!message;}}
  async _callService(domain,service,data){
    if(!this._hass?.callService) return this._showError('Home Assistant is not connected.');
    try{this._showError('');await this._hass.callService(domain,service,data);}catch(error){console.error('[GlowFloor]',error);this._showError('Action failed. Check Home Assistant logs and permissions.');}
  }
  _toggle(entity){if(!isValidEntity(entity,'light') || !this._hass?.states?.[entity] || ['unavailable','unknown'].includes(this._hass.states[entity].state))return;this._callService('light','toggle',{entity_id:entity});}
  _moreInfo(entity){if(!isValidEntity(entity,'light'))return;this.dispatchEvent(new CustomEvent('hass-more-info',{detail:{entityId:entity},bubbles:true,composed:true}));}
  _turnAllOff(){
    const ids=[...new Set(this._config.lights.map(x=>x.entity).filter(entity=>isValidEntity(entity,'light') && this._hass?.states?.[entity]?.state==='on'))];
    if(ids.length)this._callService('light','turn_off',{entity_id:ids});
  }
  _refreshStates(){
    if(!this._config || !this.shadowRoot.querySelector('.count'))return;
    let on=0;const seen=new Set();
    this._config.lights.forEach((light,index)=>{
      const button=this._markerElements[index];if(!button)return;
      const valid=isValidEntity(light.entity,'light');const state=valid?this._hass?.states?.[light.entity]?.state:null;
      const available=Boolean(state && state!=='unknown' && state!=='unavailable');
      const active=state==='on';
      if(active && !seen.has(light.entity)){on++;seen.add(light.entity);}
      button.classList.toggle('on',active);button.classList.toggle('unavailable',!available);button.disabled=!available;button.setAttribute('aria-pressed',String(active));
      const spill=this._spillElements[index];
      if(spill){
        spill.classList.toggle('on',active && this._config.spill_enabled);
        const attrs=this._hass?.states?.[light.entity]?.attributes;
        spill.style.setProperty('--gf-light-rgb',spillRgb(attrs?.rgb_color));
        const brightness=Number(attrs?.brightness);
        const intensity=Number.isFinite(brightness)&&brightness>=0&&brightness<=255?Math.max(.28,brightness/255):.85;
        spill.style.setProperty('--gf-light-strength',String(intensity));
      }
      button.setAttribute('aria-label',`${light.name}: ${!available?'unavailable':active?'on':'off'}`);
      button.title=`${light.name} · ${!available?'unavailable':active?'on':'off'}`;
    });
    this.shadowRoot.querySelector('.count').textContent=`${on} ${on===1?'light':'lights'} on`;
    this.shadowRoot.querySelector('.all-off').disabled=on===0;
  }
}

class GlowFloorCardEditor extends HTMLElement {
  constructor(){
    super();this.attachShadow({mode:'open'});this._config=defaultConfig();
    this._selected=0;this._tab='piantina';this._hass=null;this._helperRequested=false;this._imageCache={};this._editorImageRequest=0;
  }
  set hass(value){this._hass=value;this._syncNativeSelectors();this._loadEditorImage();}
  setConfig(raw){
    const next=normalizeConfig(raw);
    if(this.shadowRoot.querySelector('.editor') && JSON.stringify(next)===JSON.stringify(this._config))return;
    this._config=next;
    this._selected=Math.max(0,Math.min(this._selected,this._config.lights.length-1));
    this._render();
  }
  connectedCallback(){this._ensureNativeSelectors();}
  async _ensureNativeSelectors(){
    if(this._helperRequested)return;
    this._helperRequested=true;
    try {
      if(!customElements.get('ha-selector')){
        const helpers=await window.loadCardHelpers?.();
        await helpers?.importSelector?.();
      }
    } catch(error){console.debug('[GlowFloor] Home Assistant selector non disponibile:',error);}
    this._syncNativeSelectors();
  }
  _emit(){this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:{...this._config}},bubbles:true,composed:true}));}
  _update(prop,value){this._config[prop]=value;this._emit();}
  _editLight(index,prop,value){
    const lights=this._config.lights.map(x=>({...x}));if(!lights[index])return;
    lights[index][prop]=['x','y'].includes(prop)?coordinate(value):prop==='spread'?spillSize(value):prop==='size'?markerSize(value,null):value;
    if(prop==='entity' && lights[index].name==='Nuova luce'){
      lights[index].name=String(this._hass?.states?.[value]?.attributes?.friendly_name||value||'Nuova luce').slice(0,60);
    }
    this._config.lights=lights;this._emit();
  }
  _editScene(index,prop,value){
    const scenes=this._config.scenes.map(x=>({...x}));if(!scenes[index])return;
    scenes[index][prop]=value;
    if(prop==='entity' && scenes[index].name==='Nuova scena')scenes[index].name=String(this._hass?.states?.[value]?.attributes?.friendly_name||value||'Nuova scena').slice(0,40);
    this._config.scenes=scenes;this._emit();
  }
  _field(label,value,onChange,opts={}){
    const wrap=document.createElement('label');wrap.className='field';
    const text=document.createElement('span');text.textContent=label;wrap.append(text);
    const input=document.createElement(opts.options?'select':'input');
    if(opts.options){for(const [val,name] of opts.options){const opt=document.createElement('option');opt.value=val;opt.textContent=name;input.append(opt);}}
    else{input.type=opts.type||'text';if(opts.placeholder)input.placeholder=opts.placeholder;if(opts.min!==undefined)input.min=opts.min;if(opts.max!==undefined)input.max=opts.max;if(opts.maxlength)input.maxLength=opts.maxlength;}
    input.value=value??'';input.addEventListener('change',()=>onChange(input.value,input));wrap.append(input);return wrap;
  }
  _hint(text){const item=document.createElement('div');item.className='hint';item.textContent=text;return item;}
  _selector(domain,value,label,onChange){
    const wrap=document.createElement('div');wrap.className='field entity-select';
    const native=document.createElement('ha-selector');native.setAttribute('aria-label',label);
    native._glowfloor={domain,value,label};
    native.addEventListener('value-changed',event=>{
      event.stopPropagation();
      if(!event.detail || !Object.hasOwn(event.detail,'value'))return;
      const next=event.detail.value;
      if(domain.startsWith('media-')){
        if(next == null || next===''){if(value)onChange(null);return;}
        const image=normalizeImage(next);
        if(image)onChange(image);
      }else if(typeof next==='string' && next!==value){onChange(next);}
      else if((next==null || next==='') && value){onChange('');}
    });
    wrap.append(native);
    if(!domain.startsWith('media-')){
      const fallback=this._field(label,value,(text)=>onChange(text),{placeholder:`${domain}.nome`});
      fallback.classList.add('selector-fallback');wrap.append(fallback);
      if(!customElements.get('ha-selector'))wrap.classList.add('native-missing');
    }else if(!customElements.get('ha-selector')){
      const warning=this._hint('Selettore media di Home Assistant non disponibile. Controlla l’aggiornamento della pagina.');warning.classList.add('selector-warning');
      wrap.append(warning);
    }
    this._setNativeSelector(native);return wrap;
  }
  _setNativeSelector(el){
    const data=el._glowfloor;if(!data || !customElements.get('ha-selector'))return;
    const {domain,value,label}=data;
    el.hass=this._hass;
    el.selector=domain.startsWith('media-') ? {media:{accept:['image/*'],image_upload:domain==='media-upload',hide_content_type:true}} : {entity:{filter:{domain}}};
    el.label=label;el.required=false;
    el.value=domain.startsWith('media-') ? mediaPickerValue(value) : (value||'');
  }
  _syncNativeSelectors(){
    if(!this.shadowRoot)return;
    this.shadowRoot.querySelectorAll('ha-selector').forEach(el=>{
      this._setNativeSelector(el);
      if(customElements.get('ha-selector')){el.parentElement?.classList.remove('native-missing');el.parentElement?.querySelector('.selector-warning')?.remove();}
    });
  }
  _render(){
    const root=this.shadowRoot;
    root.innerHTML=`<style>${EDITOR_STYLE}</style><div class="editor"><nav class="nav" aria-label="Sezioni GlowFloor"></nav><div class="section" data-tab="piantina"></div><div class="section" data-tab="luci"></div><div class="section" data-tab="scene"></div><div class="section" data-tab="aspetto"></div><div class="section" data-tab="avanzate"></div></div>`;
    const nav=root.querySelector('.nav');
    for(const [tab,label] of [['piantina','Piantina'],['luci','Luci'],['scene','Scene'],['aspetto','Aspetto'],['avanzate','Avanzate']]){
      const button=document.createElement('button');button.type='button';button.textContent=label;button.dataset.tab=tab;button.addEventListener('click',()=>this._setTab(tab));nav.append(button);
    }
    this._renderImage();this._renderLights();this._renderScenes();this._renderAppearance();this._renderAdvanced();this._setTab(this._tab);this._syncNativeSelectors();this._ensureNativeSelectors();
  }
  _setTab(tab){
    this._tab=tab;
    this.shadowRoot.querySelectorAll('.nav button').forEach(button=>button.setAttribute('aria-selected',String(button.dataset.tab===tab)));
    this.shadowRoot.querySelectorAll('.section').forEach(section=>section.hidden=section.dataset.tab!==tab);
  }
  _renderImage(){
    const section=this.shadowRoot.querySelector('.section[data-tab="piantina"]');section.replaceChildren();
    const heading=document.createElement('div');heading.className='section-title';heading.textContent='Immagine della piantina';section.append(heading);
    section.append(this._hint('Seleziona o carica un’immagine con Home Assistant. Le immagini caricate sono conservate nella tua istanza, non su GitHub.'));
    const mediaSelectors=document.createElement('div');mediaSelectors.className='media-selectors';
    const selectImage=value=>{this._update('image',normalizeImage(value));this._renderImage();};
    mediaSelectors.append(this._selector('media-upload',this._config.image,'Carica piantina',selectImage));
    mediaSelectors.append(this._selector('media-browse',this._config.image,'Scegli piantina esistente',selectImage));
    section.append(mediaSelectors);
    const reset=document.createElement('button');reset.type='button';reset.textContent='Ripristina piantina predefinita';reset.addEventListener('click',()=>{this._update('image',null);this._renderImage();});section.append(reset);
    const title=document.createElement('div');title.className='section-title';title.textContent='Posiziona le luci';section.append(title);
    section.append(this._hint('Prima aggiungi una luce nella sezione Luci; poi selezionala sotto e tocca la piantina per posizionare il punto luminoso.'));
    const chooser=document.createElement('div');chooser.className='field';const select=document.createElement('select');select.setAttribute('aria-label','Luce da posizionare');
    if(!this._config.lights.length){const option=document.createElement('option');option.textContent='Aggiungi prima una luce';select.append(option);select.disabled=true;}
    this._config.lights.forEach((light,index)=>{const opt=document.createElement('option');opt.value=String(index);opt.textContent=light.name||light.entity||`Luce ${index+1}`;select.append(opt);});
    select.value=String(this._selected);select.addEventListener('change',()=>{this._selected=Number(select.value);this._renderMap();});chooser.append(select);section.append(chooser);
    const map=document.createElement('div');map.className='map';map.tabIndex=0;map.setAttribute('role','group');map.setAttribute('aria-label','Piantina: tocca per posizionare la luce');section.append(map);
    this._renderMap();
  }
  _renderMap(){
    const box=this.shadowRoot.querySelector('.map');if(!box)return;
    const imageKey=JSON.stringify(this._config.image);
    const hasFloorplan=Boolean(box.querySelector('.floor, .floor-image'));
    if(box.dataset.imageKey!==imageKey || !hasFloorplan){
      box.replaceChildren();box.dataset.imageKey=imageKey;
      if(this._config.image){
        const img=document.createElement('img');img.className='floor-image';img.alt='Piantina';img.referrerPolicy='no-referrer';img.onerror=()=>{box.dataset.imageError='true';};box.append(img);this._loadEditorImage();
      }else box.insertAdjacentHTML('afterbegin',BUILTIN_FLOORPLAN);
    }else box.querySelectorAll('.pin').forEach(pin=>pin.remove());
    this._config.lights.forEach((light,index)=>{const p=document.createElement('span');p.className=`pin ${index===this._selected?'selected':''}`;p.style.left=`${light.x}%`;p.style.top=`${light.y}%`;p.textContent=String(index+1);p.title=light.name;box.append(p);});
    box.onclick=event=>{
      if(!this._config.lights[this._selected])return;
      const rect=box.getBoundingClientRect();if(!rect.width||!rect.height)return;
      const x=coordinate(Math.round(((event.clientX-rect.left)/rect.width)*1000)/10);
      const y=coordinate(Math.round(((event.clientY-rect.top)/rect.height)*1000)/10);
      const lights=this._config.lights.map(light=>({...light}));lights[this._selected]={...lights[this._selected],x,y};this._config.lights=lights;this._emit();this._renderMap();
    };
  }
  _renderLights(){
    const section=this.shadowRoot.querySelector('.section[data-tab="luci"]');section.replaceChildren();
    const heading=document.createElement('div');heading.className='section-title';heading.textContent='Luci della piantina';section.append(heading);
    section.append(this._hint('Cerca una luce nell’elenco di Home Assistant e scegli l’entità corretta. Il nome visualizzato può essere personalizzato.'));
    const wrap=document.createElement('div');wrap.className='items';section.append(wrap);
    this._config.lights.forEach((light,index)=>{
      const box=document.createElement('div');box.className=`item ${this._selected===index?'selected':''}`;
      const head=document.createElement('div');head.className='item-head';
      const choose=document.createElement('button');choose.type='button';choose.textContent=`${this._selected===index?'● ':'○ '}Luce ${index+1}`;choose.addEventListener('click',()=>{this._selected=index;this._renderLights();this._renderImage();});
      const del=document.createElement('button');del.type='button';del.className='delete';del.textContent='Rimuovi';del.addEventListener('click',()=>{this._config.lights=this._config.lights.filter((_,i)=>i!==index);this._selected=Math.min(this._selected,Math.max(0,this._config.lights.length-1));this._emit();this._renderLights();this._renderImage();this._renderAdvanced();});head.append(choose,del);box.append(head);
      const grid=document.createElement('div');grid.className='item-grid';
      const ent=this._selector('light',light.entity,'Entità luce',value=>{this._editLight(index,'entity',value);this._renderLights();this._renderImage();});ent.classList.add('wide');grid.append(ent);
      const name=this._field('Nome del pulsante',light.name,value=>{this._editLight(index,'name',value);this._renderImage();},{maxlength:60});name.classList.add('wide');grid.append(name);box.append(grid);wrap.append(box);
    });
    if(!this._config.lights.length)section.append(this._hint('Nessuna luce aggiunta. Inizia con “Aggiungi luce”.'));
    const add=document.createElement('button');add.type='button';add.className='primary';add.textContent='+ Aggiungi luce';add.disabled=this._config.lights.length>=60;add.addEventListener('click',()=>{if(this._config.lights.length>=60)return;this._config.lights=[...this._config.lights,{entity:'',name:'Nuova luce',x:50,y:50,spread:32}];this._selected=this._config.lights.length-1;this._emit();this._renderLights();this._renderImage();this._renderAdvanced();});section.append(add);
  }
  async _loadEditorImage(){
    const img=this.shadowRoot.querySelector('.map img');
    if(!img || !this._config?.image)return;
    const request=++this._editorImageRequest;
    try{
      const url=await resolveFloorplanImage(this._hass,this._config.image,this._imageCache);
      if(request!==this._editorImageRequest || !img.isConnected)return;
      if(img.src!==url)img.src=url;
    }catch(error){if(request===this._editorImageRequest && this._hass){
      const errorEl=document.createElement('div');errorEl.className='image-message';errorEl.textContent='Impossibile aprire questa immagine. Scegline un’altra dalla libreria Home Assistant.';
      img.replaceWith(errorEl);
    }}
  }
  _renderScenes(){
    const section=this.shadowRoot.querySelector('.section[data-tab="scene"]');section.replaceChildren();
    const heading=document.createElement('div');heading.className='section-title';heading.textContent='Scene rapide';section.append(heading);
    section.append(this._hint('Facoltative: fino a tre scene Home Assistant. Scegli l’entità e personalizza il testo del pulsante.'));
    const wrap=document.createElement('div');wrap.className='scenes';section.append(wrap);
    this._config.scenes.forEach((scene,index)=>{
      const box=document.createElement('div');box.className='sceneitem';
      const head=document.createElement('div');head.className='scene-head';const bold=document.createElement('strong');bold.textContent=`Scena ${index+1}`;
      const remove=document.createElement('button');remove.type='button';remove.className='delete';remove.textContent='Rimuovi';remove.addEventListener('click',()=>{this._config.scenes=this._config.scenes.filter((_,i)=>i!==index);this._emit();this._renderScenes();});head.append(bold,remove);box.append(head);
      box.append(this._selector('scene',scene.entity,'Entità scena',value=>{this._editScene(index,'entity',value);this._renderScenes();}));
      box.append(this._field('Nome del pulsante',scene.name,value=>this._editScene(index,'name',value),{maxlength:40}));wrap.append(box);
    });
    const add=document.createElement('button');add.type='button';add.className='primary';add.textContent='+ Aggiungi scena';add.disabled=this._config.scenes.length>=MAX_SCENES;
    add.addEventListener('click',()=>{if(this._config.scenes.length>=MAX_SCENES)return;this._config.scenes=[...this._config.scenes,{entity:'',name:'Nuova scena'}];this._emit();this._renderScenes();});section.append(add);
  }
  _renderAppearance(){
    const section=this.shadowRoot.querySelector('.section[data-tab="aspetto"]');section.replaceChildren();
    const heading=document.createElement('div');heading.className='section-title';heading.textContent='Aspetto della card';section.append(heading);
    section.append(this._field('Titolo (facoltativo)',this._config.title,value=>this._update('title',value),{maxlength:120}));
    section.append(this._field('Testo superiore (facoltativo)',this._config.eyebrow,value=>this._update('eyebrow',value),{maxlength:100}));
    section.append(this._field('Sottotitolo (facoltativo)',this._config.subtitle,value=>this._update('subtitle',value),{maxlength:200}));
    section.append(this._hint('Lascia vuoti tutti e tre i campi per nascondere le scritte superiori. Contatore e pulsanti restano visibili.'));
    section.append(this._field('Modalità colore',this._config.theme_mode,value=>this._update('theme_mode',value),{options:[['auto','Automatica (Home Assistant)'],['dark','Scura'],['light','Chiara']]}));
    const sizeBox=document.createElement('div');sizeBox.className='size-control';
    const sizeLabel=document.createElement('label');sizeLabel.textContent='Dimensione pulsanti';
    const sizeOutput=document.createElement('output');sizeOutput.textContent=`${this._config.marker_size} px`;
    const range=document.createElement('input');range.type='range';range.min='32';range.max='76';range.step='2';range.value=String(this._config.marker_size);range.setAttribute('aria-label','Dimensione pulsanti in pixel');
    range.addEventListener('input',()=>{sizeOutput.textContent=`${range.value} px`;this._update('marker_size',markerSize(range.value));});
    sizeLabel.append(sizeOutput);sizeBox.append(sizeLabel,range);
    const limits=document.createElement('div');limits.className='size-limits';limits.innerHTML='<span>Piccoli · 32 px</span><span>Grandi · 76 px</span>';sizeBox.append(limits);
    section.append(sizeBox);
    section.append(this._hint('La dimensione si applica a tutte le luci. In Avanzate puoi scegliere una dimensione differente per ciascun marker.'));
    section.append(this._field('Illuminazione diffusa',String(this._config.spill_enabled),value=>this._update('spill_enabled',value==='true'),{options:[['true','Attivata'],['false','Disattivata']]}));
  }
  _renderAdvanced(){
    const section=this.shadowRoot.querySelector('.section[data-tab="avanzate"]');section.replaceChildren();
    const heading=document.createElement('div');heading.className='section-title';heading.textContent='Impostazioni avanzate';section.append(heading);
    section.append(this._hint('Le coordinate si impostano più facilmente dalla sezione Piantina. Modificale qui soltanto se necessario.'));
    this._config.lights.forEach((light,index)=>{
      const group=document.createElement('div');group.className='advanced';
      const title=document.createElement('strong');title.textContent=light.name||`Luce ${index+1}`;group.append(title);
      const row=document.createElement('div');row.className='item-grid';
      for(const [label,key,min,max] of [['Posizione X %','x',0,100],['Posizione Y %','y',0,100],['Raggio luce %','spread',12,75]]){
        row.append(this._field(label,light[key],value=>{this._editLight(index,key,value);this._renderMap();},{type:'number',min,max}));
      }
      group.append(row);
      group.append(this._field('Dimensione pulsante (px, facoltativa)',light.size ?? '',(value,input)=>{
        if(value.trim() && (!Number.isFinite(Number(value)) || Number(value)<32 || Number(value)>76)){
          input.setCustomValidity('Imposta un valore tra 32 e 76 oppure lascia vuoto.');input.reportValidity();return;
        }
        input.setCustomValidity('');this._editLight(index,'size',value);
      },{type:'number',min:32,max:76,placeholder:'Dimensione generale'}));
      section.append(group);
    });
    section.append(this._hint('Percorso immagine facoltativo, per chi usa file in /config/www (URL /local/...). Evita URL esterni per planimetrie private.'));
    section.append(this._field('Percorso o URL immagine',imageContentId(this._config.image)||'',(value,input)=>{
      if(value && !validImage(value)){input.setCustomValidity('Usa /local/..., media-source://... oppure un URL https valido.');input.reportValidity();return;}
      input.setCustomValidity('');this._update('image',value||null);this._renderImage();
    },{placeholder:'/local/floorplans/casa.png'}));
  }
}

if(!customElements.get(CARD_TAG))customElements.define(CARD_TAG,GlowFloorCard);
if(!customElements.get(EDITOR_TAG))customElements.define(EDITOR_TAG,GlowFloorCardEditor);
if(typeof window!=='undefined'){
  window.customCards=window.customCards||[];
  if(!window.customCards.some(c=>c.type===CARD_TAG))window.customCards.push({type:CARD_TAG,name:'GlowFloor Card',description:'Interactive floorplan with glowing light markers, scenes and light/dark themes',preview:false});
}
