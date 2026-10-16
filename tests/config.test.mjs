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
runInNewContext(`${source}\nglobalThis.__test={normalizeConfig,isValidEntity,coordinate,validImage,spillRgb,markerSize,normalizeImage,imageContentId,mediaPickerValue,resolveFloorplanImage};`,ctx);
const {normalizeConfig,isValidEntity,coordinate,validImage,spillRgb,markerSize,normalizeImage,imageContentId,mediaPickerValue,resolveFloorplanImage}=ctx.__test;

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
  assert.equal(spillRgb([500,0,0]),'255,194,116');
  assert.equal(spillRgb(['1; background:red',0,0]),'255,194,116');
  assert.equal(spillRgb(undefined),'255,194,116');
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


test('marker size defaults to 32px and clamps to 32–76px',()=>{
  assert.equal(normalizeConfig({}).marker_size,32);
  assert.equal(normalizeConfig({marker_size:500}).marker_size,76);
  assert.equal(normalizeConfig({marker_size:2}).marker_size,32);
  assert.equal(markerSize('bad'),32);
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
  assert.match(source,/\.nav button\[aria-selected="true"\]\{background:rgba\(111,119,128,\.28\);[^}]+border-bottom:0!important;outline:none\}/);
  assert.match(source,/\.nav\{[^}]+border:0;/);
});

test('floorplan buttons have clear Italian labels',()=>{
  assert.match(source,/'Carica piantina'/);
  assert.match(source,/'Scegli piantina esistente'/);
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
  assert.match(source,/\.nav button::before,\.nav button::after\{content:none!important;display:none!important\}/);
  assert.match(source,/\.nav button:focus-visible\{outline-color:var\(--secondary-text-color/);
});

test('new cards use 32px while intentionally saved user sizes remain unchanged',()=>{
  assert.equal(normalizeConfig({}).marker_size,32);
  assert.equal(normalizeConfig({marker_size:52}).marker_size,52);
  assert.deepEqual(Array.from(normalizeConfig({lights:[{entity:'light.a'},{entity:'light.b',size:64}]}).lights,l=>l.size),[null,64]);
  assert.match(source,/--gf-marker-size,32px/);
});

test('card and editor use native Home Assistant typography without changing GlowFloor visual colors',()=>{
  assert.match(source,/:host\{display:block;font-family:var\(--ha-font-family-body/);
  assert.match(source,/\.section-title\{font-size:var\(--ha-font-size-xl,22px\);font-weight:var\(--ha-font-weight-normal,400\)/);
  assert.match(source,/\.section\{display:grid;gap:16px;min-width:0;background:var\(--ha-card-background/);
  assert.match(source,/input:not\(\[type="range"\]\),select\{[^}]+background:var\(--secondary-background-color/);
  assert.match(source,/\.item\{[^}]+background:var\(--secondary-background-color/);
  assert.match(source,/\.nav button\[aria-selected="true"\]\{[^}]*border-bottom:0!important;/);
  assert.match(source,/:host\(\[data-theme="dark"\]\)\{--gf-frame:#141e26;/);
});
