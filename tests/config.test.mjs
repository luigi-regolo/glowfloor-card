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
runInNewContext(`${source}\nglobalThis.__test={normalizeConfig,isValidEntity,coordinate,validImage,spillRgb};`,ctx);
const {normalizeConfig,isValidEntity,coordinate,validImage,spillRgb}=ctx.__test;

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
  const image={_glowfloor:{domain:'image',value:'/api/image/serve/example/original',label:'Immagine'}};
  editor._setNativeSelector(image);
  assert.ok(Object.hasOwn(image.selector,'image'));
  assert.equal(image.value,'/api/image/serve/example/original');
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
