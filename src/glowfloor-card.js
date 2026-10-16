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
:host{display:block;font-family:var(--paper-font-body1_-_font-family,Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif);--gf-accent:#ffca82;color:var(--gf-ink);box-sizing:border-box}
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
.marker{position:absolute;z-index:2;transform:translate(-50%,-50%);border:0;padding:0;background:transparent;color:var(--gf-ink);font:inherit;cursor:pointer;display:flex;flex-direction:column;gap:6px;align-items:center;line-height:1.15;max-width:130px;-webkit-tap-highlight-color:transparent}.orb{display:grid;place-items:center;width:clamp(44px,6vw,58px);height:clamp(44px,6vw,58px);border-radius:50%;background:var(--gf-off);border:1.5px solid var(--gf-off-line);color:var(--gf-off-ink);box-shadow:0 4px 16px #02070848,inset 0 1px 1px #ffffff18;transition:transform .2s ease,box-shadow .2s ease,background .2s ease;position:relative}.orb::before{content:"";position:absolute;inset:-5px;border:1px solid var(--gf-off-line);opacity:.35;border-radius:50%;pointer-events:none}.orb svg{width:21px;height:21px;display:block}.marker.on .orb{background:linear-gradient(145deg,#ffe4ad,#f4ad55);border-color:#fff0cb;color:#583713;box-shadow:0 0 0 5px #efb8711e,0 0 25px 9px #f5ad6270,0 7px 24px #02090a35}.marker.on .orb::before{border-color:#ffd499;opacity:.85;box-shadow:0 0 16px #f9b46e88}.marker:not(:disabled):hover .orb{transform:scale(1.06)}.marker:disabled{cursor:not-allowed}.marker.unavailable .orb{opacity:.55;border-style:dashed}.marker:focus-visible .orb,.action:focus-visible,.scene:focus-visible,.theme button:focus-visible{outline:3px solid #74b1ff;outline-offset:4px}.marker-name{border:1px solid var(--gf-chip-border);background:var(--gf-glass);backdrop-filter:blur(10px);border-radius:999px;padding:5px 8px;display:flex;align-items:center;gap:6px;max-width:120px;font-size:10px;font-weight:700;line-height:1.1;box-shadow:0 3px 12px #00000023}.marker-name span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.marker-name::before{content:"";flex-shrink:0;width:5px;height:5px;border-radius:50%;background:var(--gf-off-line)}.marker.on .marker-name::before{background:#ffb867;box-shadow:0 0 7px #ffb867}
.scene-dock[hidden]{display:none}.scene-dock{border-top:1px solid var(--gf-line);margin-top:16px;padding-top:14px;display:flex;align-items:center;flex-wrap:wrap;gap:8px}.dock-label{font-size:10px;letter-spacing:1.5px;font-weight:750;color:var(--gf-muted);margin-right:6px;text-transform:uppercase}.scene{border:1px solid var(--gf-chip-border);background:var(--gf-chip);border-radius:999px;color:var(--gf-ink);font:inherit;font-size:11px;padding:10px 13px;cursor:pointer;white-space:nowrap}.error{margin-top:12px;font-size:12px;color:#d56b59}
@media(max-width:520px){.shell{padding:15px 11px 14px;border-radius:18px}.bar{gap:11px;padding:0 5px}.intro{width:100%}.tools{width:100%;justify-content:space-between;gap:5px}.count,.action{min-height:32px;padding:7px 10px;font-size:10px}.theme button{font-size:10px;padding:6px 8px}.plan{border-radius:12px}.marker{gap:4px}.marker-name{font-size:8px;padding:4px 5px;max-width:74px}.orb{width:44px;height:44px}.orb svg{width:18px;height:18px}.scene-dock{gap:6px}.scene{padding:8px 10px;font-size:10px}}
@media(prefers-reduced-motion:reduce){.orb,.spill{transition:none!important}}
`;

const EDITOR_STYLE = `:host{display:block;font-family:inherit;color:var(--primary-text-color,#222)}*{box-sizing:border-box}.editor{display:grid;gap:14px;padding:12px 2px}.row{display:flex;gap:10px;flex-wrap:wrap}.field{display:grid;gap:5px;flex:1;min-width:130px;font-size:12px;font-weight:650}input,select{font:inherit;color:inherit;min-height:35px;padding:8px;border:1px solid var(--divider-color,#aaa);border-radius:9px;background:var(--card-background-color,#fff);width:100%}button{cursor:pointer;border:1px solid var(--divider-color,#aaa);color:inherit;background:var(--card-background-color,#fff);border-radius:9px;padding:8px 11px;font:inherit;font-size:12px}button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid var(--primary-color,#3891ee)}.items{display:grid;gap:9px}.item{display:grid;grid-template-columns:1fr 1fr;gap:8px;border:1px solid var(--divider-color,#ddd);border-radius:11px;padding:10px}.item.selected{border-color:var(--primary-color,#3891ee)}.item-head{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;gap:6px}.item .field{min-width:0}.map{border:1px solid var(--divider-color,#ddd);border-radius:12px;position:relative;cursor:crosshair;overflow:hidden;background:var(--secondary-background-color,#e8ecec);line-height:0}.map svg,.map img{width:100%;height:auto;display:block}.map svg .room{fill:#e7e9e8}.map svg .room-alt{fill:#dce3e1}.map svg .wall{stroke:#93a3a7;stroke-width:8;fill:none}.map svg .furn{stroke:#93a3a7;stroke-width:2;fill:#d6dddd}.map svg .thin,.map svg .door{stroke:#93a3a7;stroke-width:2;fill:none}.map svg .room-label,.map svg .micro{fill:#56656a;font-size:14px;text-anchor:middle}.map svg .tile{stroke:#bac7c7}.pin{position:absolute;display:grid;place-items:center;transform:translate(-50%,-50%);width:24px;height:24px;border-radius:50%;background:#41535b;color:white;border:2px solid white;box-shadow:0 2px 6px #0004;font-size:10px;line-height:1}.pin.selected{background:#e9a34f;outline:3px solid #e9a34f55}.hint{font-size:11px;color:var(--secondary-text-color,#666);line-height:1.45}.scenes{display:grid;gap:7px}.sceneitem{display:flex;gap:7px}.sceneitem input{min-width:0}.delete{color:#c34b45}.section-title{font-size:13px;font-weight:750;margin:3px 0 0}`;

const isValidEntity = (id, domain) => typeof id === 'string' && new RegExp(`^${domain}\\.[a-z0-9_]+$`).test(id);
const coordinate = (v, defaultValue = 50) => Number.isFinite(Number(v)) ? Math.max(0, Math.min(100, Number(v))) : defaultValue;
const spillSize = (v) => Number.isFinite(Number(v)) ? Math.max(12, Math.min(75, Number(v))) : 32;
const spillRgb = (v) => Array.isArray(v) && v.length === 3 && v.every(n => Number.isFinite(n) && n >= 0 && n <= 255) ? v.map(n => Math.round(n)).join(',') : '255,194,116';
const validImage = (value) => typeof value === 'string' && (/^\/(?!\/)/.test(value) || /^https:\/\//i.test(value));
const defaultConfig = () => ({ eyebrow: 'GLOWFLOOR / INTERACTIVE PLAN', title: 'Living spaces', subtitle: '', theme_mode: 'auto', spill_enabled: true, lights: [] });
const normalizeConfig = (raw) => {
  if (!raw || typeof raw !== 'object') throw new Error('GlowFloor: invalid configuration.');
  return {
    ...defaultConfig(), ...raw,
    eyebrow: String(raw.eyebrow ?? 'GLOWFLOOR / INTERACTIVE PLAN').slice(0, 100),
    title: String(raw.title ?? 'Living spaces').slice(0, 120),
    subtitle: String(raw.subtitle ?? '').slice(0, 200),
    theme_mode: ['auto', 'dark', 'light'].includes(raw.theme_mode) ? raw.theme_mode : 'auto',
    spill_enabled: raw.spill_enabled !== false,
    image: validImage(raw.image) ? raw.image : null,
    lights: (Array.isArray(raw.lights) ? raw.lights : []).slice(0, 60).filter(item => item && typeof item === 'object').map(item => ({
      entity: typeof item.entity === 'string' ? item.entity.trim() : '',
      name: String(item.name || item.entity || 'Light').slice(0, 60),
      x: coordinate(item.x), y: coordinate(item.y), spread: spillSize(item.spread),
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
    this._media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    this._onMedia = () => this._updateTheme();
    this._media?.addEventListener?.('change',this._onMedia);
  }
  disconnectedCallback(){ this._media?.removeEventListener?.('change',this._onMedia); }
  setConfig(raw){ this._config=normalizeConfig(raw); this._render(); }
  set hass(value){ this._hass=value; this._updateTheme(); this._refreshStates(); }
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
    if(c.image){const img=document.createElement('img');img.className='floor-image';img.alt='Floorplan';img.loading='lazy';img.referrerPolicy='no-referrer';img.src=c.image;img.onerror=()=>{this._showError('Floorplan image could not be loaded. Check the image path.');};plan.append(img);} else {plan.insertAdjacentHTML('afterbegin',BUILTIN_FLOORPLAN);}
    this._spillElements = c.lights.map(light => {
      const spill=document.createElement('div');spill.className='spill';
      spill.style.left=`${light.x}%`;spill.style.top=`${light.y}%`;
      spill.style.width=`${light.spread}%`;
      spill.setAttribute('aria-hidden','true');plan.append(spill);return spill;
    });
    this._markerElements=c.lights.map((light,index)=>{
      const button=document.createElement('button');button.type='button';button.className='marker';button.style.left=`${light.x}%`;button.style.top=`${light.y}%`;button.title=light.name;
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
    root.querySelector('.all-off').addEventListener('click',()=>this._turnAllOff());
    root.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{this._config.theme_mode=b.dataset.mode;this._updateTheme();}));
    const dock=root.querySelector('.scene-dock');
    const scenes=c.scenes.filter(item=>isValidEntity(item.entity,'scene'));
    dock.hidden=scenes.length===0;
    scenes.forEach(scene=>{const b=document.createElement('button');b.type='button';b.className='scene';b.textContent=scene.name;b.title=`Activate ${scene.name}`;b.addEventListener('click',()=>this._callService('scene','turn_on',{entity_id:scene.entity}));dock.append(b);});
    this._updateTheme();this._refreshStates();
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
  constructor(){super();this.attachShadow({mode:'open'});this._config=defaultConfig();this._selected=0;this._hass=null;}
  set hass(value){this._hass=value;}
  setConfig(raw){this._config=normalizeConfig(raw);this._render();}
  _emit(){this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:{...this._config}},bubbles:true,composed:true}));}
  _update(prop,value){this._config[prop]=value;this._emit();}
  _editLight(index,prop,value){const lights=this._config.lights.map(x=>({...x}));lights[index][prop]=['x','y'].includes(prop)?coordinate(value):prop==='spread'?spillSize(value):value;this._config.lights=lights;this._emit();}
  _render(){
    const root=this.shadowRoot;
    root.innerHTML=`<style>${EDITOR_STYLE}</style><div class="editor"><div class="section-title">Card settings</div><div class="row"><label class="field">Titolo (facoltativo)<input data-prop="title" maxlength="120" placeholder="Lascia vuoto per nasconderlo"></label><label class="field">Theme<select data-prop="theme_mode"><option value="auto">Follow Home Assistant</option><option value="dark">Dark</option><option value="light">Light</option></select></label></div><label class="field">Testo superiore (facoltativo)<input data-prop="eyebrow" maxlength="100" placeholder="Lascia vuoto per nasconderlo"></label><label class="field">Sottotitolo (facoltativo)<input data-prop="subtitle" maxlength="200" placeholder="Lascia vuoto per nasconderlo"></label><span class="hint">Svuota tutti e tre i campi per nascondere le scritte in alto. Contatore luci e comandi rimangono visibili.</span><label class="field"><span>Illuminazione diffusa sulla piantina</span><select data-prop="spill_enabled"><option value="true">Attiva</option><option value="false">Disattiva</option></select></label><label class="field">Floorplan image path (optional)<input data-prop="image" placeholder="/local/floorplans/home.png"></label><span class="hint">Use an image stored in Home Assistant's /config/www directory. Empty = sample floorplan. For privacy, prefer /local/... over external URLs.</span><div class="section-title">Light markers</div><div class="items"></div><button type="button" class="add-light">+ Add light</button><div class="section-title">Position markers</div><div class="map" role="group" aria-label="Click floorplan to position selected light"></div><div class="hint">Select a light above, then click or tap the floorplan to move it. Positions are saved as percentages.</div><div class="section-title">Optional scenes (up to 3)</div><div class="scenes"></div><button type="button" class="add-scene">+ Add scene</button></div>`;
    root.querySelectorAll('[data-prop]').forEach(input=>{const key=input.dataset.prop;input.value=key==='spill_enabled'?String(this._config.spill_enabled):(this._config[key]||'');input.addEventListener('change',()=>{if(key==='image' && input.value && !validImage(input.value)){input.setCustomValidity('Use /local/... or https://...');input.reportValidity();return;}input.setCustomValidity('');this._update(key,key==='spill_enabled'?input.value==='true':input.value);if(key==='image')this._renderMap();});});
    root.querySelector('.add-light').addEventListener('click',()=>{this._config.lights=[...this._config.lights,{entity:'',name:'New light',x:50,y:50,spread:32}];this._selected=this._config.lights.length-1;this._emit();this._renderItems();this._renderMap();});
    root.querySelector('.add-scene').addEventListener('click',()=>{if(this._config.scenes.length>=MAX_SCENES)return;this._config.scenes=[...this._config.scenes,{entity:'',name:'New scene'}];this._emit();this._renderScenes();});
    this._renderItems();this._renderMap();this._renderScenes();
  }
  _renderItems(){
    const wrap=this.shadowRoot.querySelector('.items');wrap.replaceChildren();
    this._config.lights.forEach((l,index)=>{
      const box=document.createElement('div');box.className=`item ${this._selected===index?'selected':''}`;
      const head=document.createElement('div');head.className='item-head';
      const choose=document.createElement('button');choose.type='button';choose.textContent=`${this._selected===index?'● ':'○ '}Marker ${index+1}`;choose.addEventListener('click',()=>{this._selected=index;this._renderItems();this._renderMap();});
      const del=document.createElement('button');del.type='button';del.className='delete';del.textContent='Remove';del.addEventListener('click',()=>{this._config.lights=this._config.lights.filter((_,i)=>i!==index);this._selected=Math.min(this._selected,Math.max(0,this._config.lights.length-1));this._emit();this._renderItems();this._renderMap();});
      head.append(choose,del);box.append(head);
      for(const [label,key,type] of [['Light entity','entity','text'],['Label','name','text'],['X %','x','number'],['Y %','y','number'],['Area luce %','spread','number']]){
        const outer=document.createElement('label');outer.className='field';outer.textContent=label;const inp=document.createElement('input');inp.type=type;inp.value=l[key];if(type==='number'){inp.min=key==='spread'?'12':'0';inp.max=key==='spread'?'75':'100';inp.step='0.1';}else if(key==='entity')inp.placeholder='light.living_room';
        inp.addEventListener('change',()=>{this._editLight(index,key,inp.value);if(['x','y'].includes(key))this._renderMap();});outer.append(inp);box.append(outer);
      }wrap.append(box);
    });
  }
  _renderMap(){
    const box=this.shadowRoot.querySelector('.map');box.replaceChildren();
    if(this._config.image){const img=document.createElement('img');img.src=this._config.image;img.alt='Floorplan';img.referrerPolicy='no-referrer';box.append(img);}else box.insertAdjacentHTML('afterbegin',BUILTIN_FLOORPLAN);
    this._config.lights.forEach((l,index)=>{const p=document.createElement('span');p.className=`pin ${index===this._selected?'selected':''}`;p.style.left=`${l.x}%`;p.style.top=`${l.y}%`;p.textContent=String(index+1);p.title=l.name;box.append(p);});
    box.onclick=ev=>{if(!this._config.lights.length)return;const rect=box.getBoundingClientRect();if(!rect.width||!rect.height)return;this._editLight(this._selected,'x',Math.round(((ev.clientX-rect.left)/rect.width)*1000)/10);this._editLight(this._selected,'y',Math.round(((ev.clientY-rect.top)/rect.height)*1000)/10);this._renderItems();this._renderMap();};
  }
  _renderScenes(){
    const wrap=this.shadowRoot.querySelector('.scenes');wrap.replaceChildren();
    this._config.scenes.forEach((scene,index)=>{
      const row=document.createElement('div');row.className='sceneitem';
      for(const key of ['entity','name']){const input=document.createElement('input');input.value=scene[key];input.placeholder=key==='entity'?'scene.movie':'Nome pulsante (es. Cinema)';input.setAttribute('aria-label',key==='name'?`Scene ${index+1} label`:`Scene ${index+1} entity`);input.addEventListener('change',()=>{this._config.scenes=this._config.scenes.map((s,i)=>i===index?{...s,[key]:input.value}:s);this._emit();});row.append(input);}
      const del=document.createElement('button');del.type='button';del.className='delete';del.textContent='×';del.title='Remove scene';del.addEventListener('click',()=>{this._config.scenes=this._config.scenes.filter((_,i)=>i!==index);this._emit();this._renderScenes();});row.append(del);wrap.append(row);
    });
    const add=this.shadowRoot.querySelector('.add-scene');
    add.disabled=this._config.scenes.length>=MAX_SCENES;
    add.title=add.disabled?'Maximum 3 scenes per card':'';
  }
}

if(!customElements.get(CARD_TAG))customElements.define(CARD_TAG,GlowFloorCard);
if(!customElements.get(EDITOR_TAG))customElements.define(EDITOR_TAG,GlowFloorCardEditor);
if(typeof window!=='undefined'){
  window.customCards=window.customCards||[];
  if(!window.customCards.some(c=>c.type===CARD_TAG))window.customCards.push({type:CARD_TAG,name:'GlowFloor Card',description:'Interactive floorplan with glowing light markers, scenes and light/dark themes',preview:false});
}
