import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';

const source=await readFile(new URL('../src/glowfloor-card.js',import.meta.url),'utf8');
const registry=new Map();
const ctx={
  HTMLElement:class {},
  customElements:{get:key=>registry.get(key),define:(key,val)=>registry.set(key,val)},
  window:{customCards:[]},
  console,
};
runInNewContext(`${source}\nglobalThis.__test={normalizeConfig,isValidEntity,coordinate,validImage,spillRgb,markerSize,normalizeImage,imageContentId,mediaPickerValue,resolveFloorplanImage,pickImage,markerStyle,markerMin,validIcon,imageRatioStatus,STYLE_DEFAULT_SIZE,kelvinToRgb,lightRgb,spillColor,brightnessPct,isDimmable,dimFromDrag,emptyDelay,isVacant};`,ctx);
const {normalizeConfig,isValidEntity,coordinate,validImage,spillRgb,markerSize,normalizeImage,imageContentId,mediaPickerValue,resolveFloorplanImage,pickImage,markerStyle,markerMin,validIcon,imageRatioStatus,STYLE_DEFAULT_SIZE,kelvinToRgb,lightRgb,spillColor,brightnessPct,isDimmable,dimFromDrag,emptyDelay,isVacant}=ctx.__test;

test('registers the card and the UI editor',()=>{
  assert.ok(registry.has('glowfloor-card'));
  assert.ok(registry.has('glowfloor-card-editor'));
  assert.equal(ctx.window.customCards.length,1);
});

test('validates light and scene entity domains',()=>{
  assert.equal(isValidEntity('light.living_room','light'),true);
  assert.equal(isValidEntity('scene.relax','scene'),true);
  assert.equal(isValidEntity('switch.plug','light'),false);
  assert.equal(isValidEntity('light.living-room','light'),false);
});

test('clamps coordinates and drops unsafe floorplan paths',()=>{
  const c=normalizeConfig({image:'javascript:alert(1)',theme_mode:'unknown',lights:[{entity:'light.a',name:'A',x:200,y:-4}]});
  assert.equal(c.image,null);
  assert.equal(c.theme_mode,'auto');
  assert.equal(c.lights[0].x,100);
  assert.equal(c.lights[0].y,0);
  assert.equal(validImage('/local/floorplan.png'),true);
  assert.equal(validImage('//third-party.example/img.png'),false);
  assert.equal(validImage('http://example.com/plan.png'),false);
  assert.equal(coordinate('bad'),50);
});

test('defaults to no actions unless explicit lights are configured',()=>{
  const config=normalizeConfig({});
  assert.equal(config.lights.length,0);
  assert.equal(config.scenes.length,0);
});

test('displays at most three optional scenes',()=>{
  const config=normalizeConfig({scenes:[
    {entity:'scene.relax',name:'Relax'},
    {entity:'scene.movie',name:'Movie'},
    {entity:'scene.night',name:'Night'},
    {entity:'scene.away',name:'Away'},
  ]});
  assert.equal(config.scenes.length,3);
  assert.equal(config.scenes[2].name,'Night');
});

test('allows every heading text to be cleared without restoring defaults',()=>{
  const c=normalizeConfig({eyebrow:'',title:'',subtitle:''});
  assert.equal(c.eyebrow,'');
  assert.equal(c.title,'');
  assert.equal(c.subtitle,'');
  assert.equal(normalizeConfig({}).eyebrow,'GLOWFLOOR / INTERACTIVE PLAN');
});

test('scene button labels are customizable independently of scene entities',()=>{
  const c=normalizeConfig({scenes:[{entity:'scene.relax',name:'Lettura'},{entity:'scene.movie',name:'Cinema'},{entity:'scene.night',name:'Buonanotte'}]});
  assert.equal(c.scenes[0].name,'Lettura');
  assert.equal(c.scenes[1].entity,'scene.movie');
  assert.equal(c.scenes[1].name,'Cinema');
  assert.equal(c.scenes[2].name,'Buonanotte');
});

test('light spill is enabled by default and can be disabled',()=>{
  assert.equal(normalizeConfig({}).spill_enabled,true);
  assert.equal(normalizeConfig({spill_enabled:false}).spill_enabled,false);
  assert.equal(normalizeConfig({spill_enabled:true}).spill_enabled,true);
});

test('config accepts individual marker spill sizes and clamps extremes',()=>{
  const c=normalizeConfig({lights:[
    {entity:'light.one',spread:55},
    {entity:'light.two',spread:-5},
    {entity:'light.three',spread:900},
    {entity:'light.four'},
  ]});
  assert.deepEqual(Array.from(c.lights,light=>light.spread),[55,12,75,32]);
});


test('RGB light spill colors are sanitized before insertion in CSS',()=>{
  assert.equal(spillRgb([255,128,44]),'255,128,44');
  assert.equal(spillRgb([500,0,0]),'211,194,157');
  assert.equal(spillRgb(['1; background:red',0,0]),'211,194,157');
  assert.equal(spillRgb(undefined),'211,194,157');
});

test('title color is explicitly set to the GlowFloor theme ink',()=>{
  assert.match(source,/\.title\{color:var\(--gf-ink\);/);
});

test('native Home Assistant selectors filter the correct entity domains',()=>{
  registry.set('ha-selector',class {});
  const Editor=registry.get('glowfloor-card-editor');
  const editor=Object.create(Editor.prototype);
  editor._hass={states:{}};
  const light={_glowfloor:{domain:'light',value:'light.cucina',label:'Entità luce'}};
  editor._setNativeSelector(light);
  assert.equal(light.selector.entity.filter.domain,'light');
  assert.equal(light.value,'light.cucina');
  assert.equal(light.label,'Entità luce');
  const scene={_glowfloor:{domain:'scene',value:'scene.relax',label:'Entità scena'}};
  editor._setNativeSelector(scene);
  assert.equal(scene.selector.entity.filter.domain,'scene');
  const upload={_glowfloor:{domain:'media-upload',value:null,label:'Carica immagine'}};
  editor._setNativeSelector(upload);
  assert.equal(upload.selector.media.image_upload,true);
  assert.equal(upload.selector.media.accept[0],'image/*');
  assert.equal(upload.required,false);
  const existing={_glowfloor:{domain:'media-browse',value:{media_content_id:'media-source://image_upload/example'},label:'Scegli immagine'}};
  editor._setNativeSelector(existing);
  assert.equal(existing.selector.media.image_upload,false);
  assert.equal(existing.value.media_content_id,'media-source://image_upload/example');
});

test('image selection accepts Home Assistant image-serving URL and blocks javascript URLs',()=>{
  assert.equal(validImage('/api/image/serve/example/original'),true);
  assert.equal(normalizeConfig({image:'/api/image/serve/example/original'}).image,'/api/image/serve/example/original');
  assert.equal(normalizeConfig({image:'javascript:alert(1)'}).image,null);
});

test('editor separates configuration tabs from their content panels',()=>{
  assert.match(source,/\.section\[data-tab=/);
  assert.match(source,/querySelectorAll\('\.nav button'\)/);
  assert.match(source,/\.section\[hidden\]\{display:none\}/);
});


test('Home Assistant media selectors support upload and existing images',()=>{
  const value={media_content_id:'media-source://image_upload/abcdef',media_content_type:'image/png'};
  const c=normalizeConfig({image:value});
  assert.equal(c.image.media_content_id,value.media_content_id);
  assert.equal(c.image.media_content_type,value.media_content_type);
  assert.equal(imageContentId(c.image),value.media_content_id);
  assert.equal(mediaPickerValue('/local/plan.png').media_content_id,'/local/plan.png');
  assert.equal(normalizeImage({media_content_id:'javascript:alert(1)'}),null);
  assert.equal(normalizeImage({media_content_id:'media-source://media_source/local/plan.jpg'}).media_content_type,'image/*');
});

test('uploaded media is resolved via Home Assistant WS and signed URL is cached',async()=>{
  let calls=0;
  const hass={callWS:async args=>{calls++;assert.equal(args.type,'media_source/resolve_media');assert.equal(args.media_content_id,'media-source://image_upload/example');return {url:'/api/media_proxy/test?authSig=token'};},hassUrl:path=>'https://ha.example'+path};
  const config={media_content_id:'media-source://image_upload/example'};
  const cache={};
  const a=await resolveFloorplanImage(hass,config,cache);
  const b=await resolveFloorplanImage(hass,config,cache);
  assert.equal(a,'https://ha.example/api/media_proxy/test?authSig=token');
  assert.equal(b,a);
  assert.equal(calls,1);
  assert.equal(await resolveFloorplanImage(hass,'/local/plan.png'), 'https://ha.example/local/plan.png');
});

test('editor typography inherits Home Assistant font tokens',()=>{
  assert.match(source,/--ha-font-family-body/);
  assert.match(source,/--ha-font-size-m/);
  assert.match(source,/\.media-selectors\{display:grid/);
  assert.doesNotMatch(source,/el\.selector=domain==='image'/);
});


test('simultaneous requests for the same image share one Home Assistant media resolution',async()=>{
  let calls=0;
  const hass={callWS:async()=>{calls++;await new Promise(resolve=>setTimeout(resolve,5));return {url:'/api/media_proxy/sample'};},hassUrl:x=>x};
  const cache={};
  const [url1,url2]=await Promise.all([resolveFloorplanImage(hass,'media-source://media_source/local/plan.jpg',cache),resolveFloorplanImage(hass,'media-source://media_source/local/plan.jpg',cache)]);
  assert.equal(url1,url2);assert.equal(calls,1);
});


test('marker size defaults to 28px and clamps to 26–76px',()=>{
  assert.equal(normalizeConfig({}).marker_size,28);
  assert.equal(normalizeConfig({marker_size:500}).marker_size,76);
  assert.equal(normalizeConfig({marker_size:2}).marker_size,26);
  assert.equal(markerSize('bad'),28);
  assert.equal(markerSize('',null),null);
  assert.equal(markerSize(null,null),null);
  assert.equal(markerSize(undefined,null),null);
});

test('individual marker size overrides global setting only when set',()=>{
  const config=normalizeConfig({marker_size:64,lights:[{entity:'light.a',size:36},{entity:'light.b'},{entity:'light.c',size:95}]});
  assert.deepEqual(Array.from(config.lights,light=>light.size),[36,null,76]);
  assert.match(source,/light\.size \?\? c\.marker_size/);
  assert.equal(normalizeConfig(config).lights[1].size,null);
});

test('readme includes official HACS deep link and does not enable Pages',async()=>{
  const md=await readFile(new URL('../README.md',import.meta.url),'utf8');
  assert.match(md,/my\.home-assistant\.io\/badges\/hacs_repository\.svg/);
  assert.match(md,/category=plugin/);
  assert.ok(!md.includes('GitHub Pages'));
});

test('editor navigation uses a neutral selected tab without an underline',()=>{
  assert.match(source,/\.nav button\[aria-selected="true"\]\{background:var\(--secondary-background-color/);
  assert.match(source,/\.nav button::before,\.nav button::after\{content:none!important;display:none!important\}/);
  assert.match(source,/\.nav\{[^}]+border:0;border-bottom:1px solid var\(--divider-color/);
});

test('floorplan buttons have clear Italian labels for the light and dark images',()=>{
  assert.match(source,/`Carica piantina \$\{slot\.name\}`/);
  assert.match(source,/`Scegli piantina \$\{slot\.name\} esistente`/);
  assert.match(source,/name:'chiara',title:'Piantina chiara'/);
  assert.match(source,/name:'scura',title:'Piantina scura'/);
  assert.match(source,/'Ripristina piantina predefinita'/);
  assert.doesNotMatch(source,/'Usa piantina di esempio'/);
});

test('editing markers preserves existing floorplan DOM instead of reloading it',()=>{
  assert.match(source,/this\._refreshCardConfig\(\)/);
  assert.match(source,/const hasFloorplan=Boolean\(box\.querySelector\('\.floor, \.floor-image'\)\)/);
  assert.match(source,/box\.querySelectorAll\('\.pin'\)\.forEach\(pin=>pin\.remove\(\)\)/);
  assert.match(source,/if\(this\.shadowRoot\.querySelector\('\.editor'\) && JSON\.stringify\(next\)===JSON\.stringify\(this\._config\)\)return;/);
  assert.match(source,/if\(img\.src!==url\)img\.src=url/);
});


test('adding or removing light markers does not replace the preview floorplan image',()=>{
  assert.match(source,/JSON\.stringify\(prev\.image\)===JSON\.stringify\(next\.image\)/);
  assert.match(source,/if\(!sameOverlays\)this\._rebuildOverlays\(\)/);
  assert.match(source,/plan\.querySelectorAll\('\.marker,\.spill'\)\.forEach\(el=>el\.remove\(\)\)/);
  assert.match(source,/if\(JSON\.stringify\(prev\.scenes\)!==JSON\.stringify\(next\.scenes\)\)this\._refreshScenes\(\)/);
});


test('GlowFloor tabs do not render a selected green underline or edge',()=>{
  assert.match(source,/\.nav button\{[^}]*appearance:none;[^}]*border-bottom:0!important;[^}]*box-shadow:none!important;/);
  assert.match(source,/\.nav button\[aria-selected="true"\]\{[^}]*border:0!important;box-shadow:none!important;outline:none\}/);
  assert.doesNotMatch(source,/\.nav button\[aria-selected="true"\]\{[^}]*border-bottom:2px/);
});

test('new cards use 28px while intentionally saved user sizes remain unchanged',()=>{
  assert.equal(normalizeConfig({}).marker_size,28);
  assert.equal(normalizeConfig({marker_size:52}).marker_size,52);
  assert.deepEqual(Array.from(normalizeConfig({lights:[{entity:'light.a'},{entity:'light.b',size:64}]}).lights,l=>l.size),[null,64]);
  assert.match(source,/--gf-marker-size,28px/);
});

test('card and editor inherit HA typography while keeping the editor minimal',()=>{
  assert.match(source,/:host\{display:block;font-family:var\(--ha-font-family-body/);
  assert.match(source,/\.section-title\{font-size:var\(--ha-font-size-xl,20px\);font-weight:var\(--ha-font-weight-medium,500\)/);
  assert.match(source,/\.section\{display:grid;gap:14px;min-width:0;padding:22px 0 6px;background:transparent;border:0/);
  assert.match(source,/input:not\(\[type="range"\]\),select\{[^}]+background:var\(--secondary-background-color/);
  assert.match(source,/\.item,\.sceneitem\{[^}]*border-bottom:1px solid var\(--divider-color/);
  assert.match(source,/:host\(\[data-theme="dark"\]\)\{--gf-accent:#0e795d;--gf-frame:#101211;/);
});

test('light area slider is per marker with live percentage feedback',()=>{
  assert.match(source,/areaName\.textContent='Area luce'/);
  assert.match(source,/slider\.type='range';slider\.min='12';slider\.max='75'/);
  assert.match(source,/slider\.addEventListener\('input',\(\)=>\{areaOutput\.textContent=`\$\{slider\.value\}%`;this\._editLight\(index,'spread',slider\.value\)/);
  assert.match(source,/details\.textContent='Altre opzioni'/);
  assert.match(source,/\.details-panel\[hidden\]\{display:none\}/);
  assert.equal(normalizeConfig({lights:[{entity:'light.a',spread:75}]}).lights[0].spread,75);
});

test('areas and marker sizes remain independent and existing values persist',()=>{
  const cfg=normalizeConfig({marker_size:32,lights:[{entity:'light.a',spread:70,size:40}]});
  assert.equal(cfg.lights[0].spread,70);
  assert.equal(cfg.lights[0].size,40);
  assert.equal(normalizeConfig(cfg).lights[0].spread,70);
  assert.match(source,/if\(!sameOverlays\)this\._rebuildOverlays\(\)/);
});


test('light label visibility defaults to interaction and supports explicit modes',()=>{
  assert.equal(normalizeConfig({}).label_mode,'interaction');
  assert.equal(normalizeConfig({label_mode:'always'}).label_mode,'always');
  assert.equal(normalizeConfig({label_mode:'never'}).label_mode,'never');
  assert.equal(normalizeConfig({label_mode:'bad'}).label_mode,'interaction');
});

test('name labels are positioned outside the marker layout and remain accessible',()=>{
  assert.match(source,/\.marker-name\{position:absolute/);
  assert.match(source,/data-label-mode="always"/);
  assert.match(source,/data-label-mode="never"/);
  assert.match(source,/button\.setAttribute\('aria-label'/);
  assert.match(source,/Solo durante l’interazione/);
});


test('Edera palette and header controls follow the approved design',()=>{
  assert.match(source,/\.title \.dot\{color:var\(--gf-accent\)\}/);
  assert.match(source,/<span>Spegni tutto<\/span>/);
  assert.match(source,/aria-controls="glowfloor-plan" aria-expanded="true">Nascondi piantina/);
  assert.doesNotMatch(source,/role="group" aria-label="Theme mode"/);
});

test('show/hide keeps the floorplan mounted and does not persist a new setting',()=>{
  assert.match(source,/this\._planVisible=true;/);
  assert.match(source,/plan\.hidden=!this\._planVisible;/);
  assert.match(source,/this\._planVisible=!this\._planVisible;this\._updatePlanVisibility\(\)/);
  assert.doesNotMatch(source,/this\._update\('plan_visible'/);
});

test('floorplan image is pre-decoded without lazy loading',()=>{
  assert.match(source,/const preload=new Image\(\);/);
  assert.match(source,/await this\._imageDecodePromise\.pending;/);
  assert.doesNotMatch(source,/img\.loading='lazy'/);
});

test('registers a live preview in the Home Assistant card picker',()=>{
  const card=ctx.window.customCards.find(entry=>entry.type==='glowfloor-card');
  assert.equal(card?.name,'GlowFloor Card');
  assert.equal(card?.preview,true);
});

test('Beta 2 retains saved marker sizes, coordinates and spread',()=>{
  const c=normalizeConfig({marker_size:32,lights:[{entity:'light.a',x:23.5,y:74.2,spread:55,size:64},{entity:'light.b',x:50,y:25},{entity:'light.c',x:80,y:10,size:26}]});
  assert.equal(c.marker_size,32);
  assert.deepEqual(Array.from(c.lights,l=>[l.x,l.y,l.size,l.spread]),[[23.5,74.2,64,55],[50,25,null,32],[80,10,26,32]]);
  assert.equal(normalizeConfig({}).marker_size,28);
  assert.equal(markerSize(27),27);
  assert.equal(markerSize(76),76);
});
test('Beta 2 has at least a 44px touch target around a 28px visual marker',()=>{
  assert.match(source,/width:max\(44px,var\(--gf-marker-size,28px\)\);height:max\(44px,var\(--gf-marker-size,28px\)\)/);
  assert.match(source,/\.orb\{[^}]*width:var\(--gf-marker-size,28px\);height:var\(--gf-marker-size,28px\)/);
});
test('Beta 2 uses subdued sage grey and soft champagne glow',()=>{
  assert.match(source,/--gf-off:#d8dfd7;--gf-off-line:#9eaea1;--gf-off-ink:#586d60/);
  assert.match(source,/--gf-off:#303932;--gf-off-line:#586c5e;--gf-off-ink:#a9b9ad/);
  assert.match(source,/\.orb::before\{content:none\}/);
  assert.match(source,/box-shadow:0 0 0 2px #b98a4512,0 0 9px 2px #b98a4524/);
});
test('editor size inputs follow the marker style minimum with per-pixel slider precision',()=>{
  assert.match(source,/range\.min=String\(minPx\);range\.max='76';range\.step='1'/);
  assert.match(source,/\{type:'number',min:minPx,max:76,placeholder:'Dimensione generale'\}/);
  assert.match(source,/Number\(value\)<minPx \|\| Number\(value\)>76/);
  assert.equal(normalizeConfig({marker_size:52,lights:[{size:40}]}).lights[0].size,40);
});

test('existing configurations keep the chip style, 26px minimum and the GlowFloor bulb',()=>{
  const c=normalizeConfig({marker_size:30,lights:[{entity:'light.a',size:20}]});
  assert.equal(c.marker_style,'chip');
  assert.equal(c.icon_mode,'default');
  assert.equal(c.marker_size,30);
  assert.equal(c.lights[0].size,26);
  assert.equal(c.image,null);
  assert.equal(c.image_dark,null);
  assert.equal(markerStyle('bad'),'chip');
  assert.equal(markerMin('chip'),26);
});

test('compact and icon styles use their own default sizes and a 16px minimum',()=>{
  assert.equal(normalizeConfig({marker_style:'compact'}).marker_size,20);
  assert.equal(normalizeConfig({marker_style:'icon'}).marker_size,18);
  assert.equal(normalizeConfig({marker_style:'compact',marker_size:4}).marker_size,16);
  assert.equal(normalizeConfig({marker_style:'compact',marker_size:24}).marker_size,24);
  assert.deepEqual(Array.from(normalizeConfig({marker_style:'icon',lights:[{entity:'light.a',size:12},{entity:'light.b'}]}).lights,l=>l.size),[16,null]);
  assert.deepEqual({...STYLE_DEFAULT_SIZE},{chip:28,compact:20,icon:18});
});

test('new cards from the card picker start with the compact style and Home Assistant icons',()=>{
  const Card=registry.get('glowfloor-card');
  const stub=Card.getStubConfig();
  assert.equal(stub.marker_style,'compact');
  assert.equal(stub.marker_size,20);
  assert.equal(stub.icon_mode,'entity');
  assert.deepEqual(Array.from(stub.lights),[]);
});

test('dark floorplan is optional and each theme falls back to the other image',()=>{
  const light='/local/casa.png',dark='/local/casa-scura.png';
  assert.equal(pickImage({image:light,image_dark:dark},'light'),light);
  assert.equal(pickImage({image:light,image_dark:dark},'dark'),dark);
  assert.equal(pickImage({image:light,image_dark:null},'dark'),light);
  assert.equal(pickImage({image:null,image_dark:dark},'light'),dark);
  assert.equal(pickImage({image:null,image_dark:null},'dark'),null);
  const c=normalizeConfig({image:light,image_dark:{media_content_id:'media-source://image_upload/abc'}});
  assert.equal(c.image,light);
  assert.equal(imageContentId(c.image_dark),'media-source://image_upload/abc');
  assert.equal(normalizeConfig({image_dark:'javascript:alert(1)'}).image_dark,null);
  assert.equal(normalizeConfig({image:light}).image_dark,null);
});

test('the card swaps the floorplan with the resolved theme and keeps one cache per theme',()=>{
  const Card=registry.get('glowfloor-card');
  const card=Object.create(Card.prototype);
  card._media=null;card._hass=null;
  card._config={theme_mode:'dark'};assert.equal(card._resolvedTheme(),'dark');
  card._config={theme_mode:'light'};assert.equal(card._resolvedTheme(),'light');
  card._config={theme_mode:'auto'};card._hass={themes:{darkMode:false}};assert.equal(card._resolvedTheme(),'light');
  card._hass={themes:{darkMode:true}};assert.equal(card._resolvedTheme(),'dark');
  assert.match(source,/this\._imageCaches=\{light:\{\},dark:\{\}\}/);
  assert.match(source,/resolveFloorplanImage\(this\._hass,active,this\._imageCaches\[theme\]\)/);
  assert.match(source,/JSON\.stringify\(prev\.image_dark\)===JSON\.stringify\(next\.image_dark\)/);
  assert.match(source,/this\._updateTheme\(\);this\._refreshStates\(\);this\._loadCardImage\(\);/);
});

test('image ratio check flags mismatching light and dark floorplans',()=>{
  assert.equal(imageRatioStatus({w:1600,h:1000},{w:3200,h:2000}).ok,true);
  assert.equal(imageRatioStatus({w:1600,h:1000},{w:1604,h:1000}).ok,true);
  const bad=imageRatioStatus({w:1600,h:1000},{w:1600,h:1200});
  assert.equal(bad.ok,false);
  assert.ok(bad.diff>0.15 && bad.diff<0.25);
  assert.equal(imageRatioStatus(null,{w:1,h:1}),null);
  assert.equal(imageRatioStatus({w:0,h:10},{w:1,h:1}),null);
  assert.match(source,/differiscono del/);
});

test('marker icons: Home Assistant entity icon, custom icon or the GlowFloor bulb',()=>{
  assert.equal(validIcon('mdi:ceiling-light'),true);
  assert.equal(validIcon('hass:lightbulb'),true);
  assert.equal(validIcon('mdi:'),false);
  assert.equal(validIcon('javascript:alert(1)'),false);
  assert.equal(validIcon('<img src=x>'),false);
  const c=normalizeConfig({lights:[{entity:'light.a',icon_source:'custom',icon:' mdi:floor-lamp '},{entity:'light.b',icon_source:'bad',icon:'nope'},{entity:'light.c'}]});
  assert.equal(c.lights[0].icon_source,'custom');
  assert.equal(c.lights[0].icon,'mdi:floor-lamp');
  assert.equal('icon_source' in c.lights[1],false);
  assert.equal('icon' in c.lights[1],false);
  assert.equal('icon_source' in c.lights[2],false);
  const Card=registry.get('glowfloor-card');
  const card=Object.create(Card.prototype);
  card._config=normalizeConfig({icon_mode:'entity'});
  assert.deepEqual({...card._effectiveIcon({entity:'light.a'})},{type:'state'});
  assert.deepEqual({...card._effectiveIcon({entity:'light.a',icon_source:'custom',icon:'mdi:lamp'})},{type:'icon',icon:'mdi:lamp'});
  assert.deepEqual({...card._effectiveIcon({entity:'light.a',icon_source:'custom'})},{type:'state'});
  assert.deepEqual({...card._effectiveIcon({entity:'light.a',icon_source:'default'})},{type:'bulb'});
  assert.deepEqual({...card._effectiveIcon({entity:'',icon_source:'entity'})},{type:'bulb'});
  card._config=normalizeConfig({});
  assert.deepEqual({...card._effectiveIcon({entity:'light.a'})},{type:'bulb'});
  assert.match(source,/customElements\.get\('ha-state-icon'\)/);
  assert.match(source,/holder\.innerHTML=BULB_SVG/);
});

test('icon selector in the editor uses the native Home Assistant icon selector',()=>{
  registry.set('ha-selector',class {});
  const Editor=registry.get('glowfloor-card-editor');
  const editor=Object.create(Editor.prototype);
  editor._hass={states:{}};
  const icon={_glowfloor:{domain:'icon',value:'mdi:floor-lamp',label:'Icona personalizzata'}};
  editor._setNativeSelector(icon);
  assert.deepEqual({...icon.selector.icon},{});
  assert.equal(icon.value,'mdi:floor-lamp');
});

test('marker styles keep the 44px touch target and a legible icon on busy floorplans',()=>{
  assert.match(source,/:host\(\[data-marker-style="compact"\]\)\{--gf-icon-ratio:\.6\}/);
  assert.match(source,/:host\(\[data-marker-style="icon"\]\)\{--gf-icon-ratio:1\}/);
  assert.match(source,/drop-shadow\(0 0 2px #000000bf\)/);
  assert.match(source,/width:max\(44px,var\(--gf-marker-size,28px\)\);height:max\(44px,var\(--gf-marker-size,28px\)\)/);
  assert.match(source,/this\.dataset\.markerStyle=c\.marker_style/);
});

const j=v=>JSON.stringify(v);

test('color temperature: kelvin maps to warm/cool RGB and is only a fallback to rgb_color',()=>{
  assert.equal(j(kelvinToRgb(2700)),'[255,167,87]');
  assert.equal(j(kelvinToRgb(6600)),'[255,255,255]');
  const cool=kelvinToRgb(9000);
  assert.ok(cool[2]===255 && cool[0]<255,'cool white is bluish');
  assert.equal(kelvinToRgb(null),null);
  assert.equal(kelvinToRgb('x'),null);
  assert.equal(kelvinToRgb(0),null);
  assert.equal(j(lightRgb({rgb_color:[1,2,3],color_temp_kelvin:2700})),'[1,2,3]');
  assert.equal(j(lightRgb({color_temp_kelvin:2700})),'[255,167,87]');
  assert.equal(j(lightRgb({color_temp:370})),j(kelvinToRgb(1e6/370)));
  assert.equal(lightRgb({}),null);
  assert.equal(lightRgb(undefined),null);
  assert.equal(spillColor({}),'211,194,157','keeps the original default glow');
  assert.equal(spillColor({color_temp_kelvin:2700}),'255,167,87');
});

test('drag-to-dim helpers: brightness, dimmable detection, clamped drag',()=>{
  assert.equal(brightnessPct({brightness:255}),100);
  assert.equal(brightnessPct({brightness:128}),50);
  assert.equal(brightnessPct({brightness:null}),null);
  assert.equal(brightnessPct({}),null);
  assert.equal(isDimmable({state:'on',attributes:{supported_color_modes:['onoff']}}),false);
  assert.equal(isDimmable({state:'off',attributes:{supported_color_modes:['brightness']}}),true);
  assert.equal(isDimmable({state:'on',attributes:{brightness:10}}),true);
  assert.equal(isDimmable({state:'off',attributes:{}}),false);
  assert.equal(isDimmable(undefined),false);
  assert.equal(dimFromDrag(50,0),50);
  assert.equal(dimFromDrag(50,40),70);
  assert.equal(dimFromDrag(50,-400),0);
  assert.equal(dimFromDrag(50,400),100);
});

test('dim gesture and empty rooms are opt-in and sanitized in the config',()=>{
  const legacy=normalizeConfig({lights:[{entity:'light.a',name:'A',x:1,y:1}]});
  assert.equal(legacy.dim_gesture,false);
  assert.equal(legacy.empty_delay,10);
  assert.equal('presence_entity' in legacy.lights[0],false);
  assert.equal(normalizeConfig({dim_gesture:'true'}).dim_gesture,false,'only boolean true enables it');
  assert.equal(normalizeConfig({dim_gesture:true}).dim_gesture,true);
  assert.equal(emptyDelay(0),1);
  assert.equal(emptyDelay(999),240);
  assert.equal(emptyDelay('x'),10);
  assert.equal(emptyDelay(''),10);
  assert.equal(emptyDelay(25),25);
  const c=normalizeConfig({lights:[
    {entity:'light.a',presence_entity:' binary_sensor.room '},
    {entity:'light.b',presence_entity:'switch.nope'},
    {entity:'light.c',presence_entity:42},
  ]});
  assert.equal(c.lights[0].presence_entity,'binary_sensor.room');
  assert.equal('presence_entity' in c.lights[1],false);
  assert.equal('presence_entity' in c.lights[2],false);
});

test('empty room: presence off for at least the delay',()=>{
  const now=Date.parse('2026-10-28T12:00:00Z');
  const at=min=>new Date(now-min*60000).toISOString();
  assert.equal(isVacant({state:'off',last_changed:at(11)},now,10),true);
  assert.equal(isVacant({state:'off',last_changed:at(10)},now,10),true);
  assert.equal(isVacant({state:'off',last_changed:at(9)},now,10),false);
  assert.equal(isVacant({state:'on',last_changed:at(99)},now,10),false);
  assert.equal(isVacant({state:'unavailable',last_changed:at(99)},now,10),false);
  assert.equal(isVacant({state:'off'},now,10),false,'no timestamp: do not guess');
  assert.equal(isVacant(undefined,now,10),false);
});

test('source wires pointer/keyboard gestures, pan-y and the empty-room button',()=>{
  assert.match(source,/touch-action:pan-y/);
  assert.match(source,/data-dim-gesture="true"/);
  assert.match(source,/pointermove/);
  assert.match(source,/brightness_pct/);
  assert.match(source,/class="action vacant-off"/);
  assert.match(source,/Spegni stanze vuote/);
  assert.match(source,/clearInterval\(this\._vacancyTimer\)/);
});
