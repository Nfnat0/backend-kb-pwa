import {readdirSync,readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(`${dir}/${e.name}`):[`${dir}/${e.name}`]);}
const paths=walk('dist').filter(p=>!p.endsWith('/sw.js'));
const revision=createHash('sha256');for(const p of paths)revision.update(readFileSync(p));
const hash=revision.digest('hex').slice(0,12);const assets=paths.map(p=>'./'+p.slice(5));
writeFileSync('dist/sw.js',`
const SCOPE=self.registration.scope;
const PREFIX='backend-kb:'+SCOPE+':';
const CACHE=PREFIX+'${hash}';
const ASSETS=${JSON.stringify(assets)};
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 try {for(let i=0;i<ASSETS.length;i+=8) await cache.addAll(ASSETS.slice(i,i+8).map(p=>new Request(new URL(p,SCOPE),{cache:'reload'})));await cache.put(new URL('./__ready',SCOPE),new Response('ready'));}
 catch(error){await caches.delete(CACHE);throw error;}
 // Updates wait for existing app windows to close, avoiding mixed asset versions.
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const name of await caches.keys())if(name.startsWith(PREFIX)&&name!==CACHE)await caches.delete(name);
 await self.clients.claim();
})()));
self.addEventListener('message',event=>{if(event.data?.type==='STATUS')event.waitUntil((async()=>{const cache=await caches.open(CACHE);event.ports[0]?.postMessage({ready:Boolean(await cache.match(new URL('./__ready',SCOPE)))});})());});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||!event.request.url.startsWith(SCOPE))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  const key=event.request.mode==='navigate'?new URL('./index.html',SCOPE):event.request;
  const found=await cache.match(key,{ignoreVary:true});if(found)return found;
  return fetch(event.request);
 })());
});
`);
console.log(`Precache ${assets.length} files (${hash})`);
