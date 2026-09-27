
const SCOPE=self.registration.scope;
const PREFIX='backend-kb:'+SCOPE+':';
const CACHE=PREFIX+'31569b32ece9';
const ASSETS=["./apple-touch-icon.png","./assets/abnfDiagram-VCTEODGH-BXlfIDUi.js","./assets/arc-SMFJbRIw.js","./assets/architectureDiagram-5GKGNRK7-DeI3Ymze.js","./assets/blockDiagram-I7D4REHJ-DDcQGOYC.js","./assets/c4Diagram-7LVT6UL2-CaFfuRQX.js","./assets/channel-Bg1w2BRE.js","./assets/chunk-2Q5K7J3B-7uqLujKj.js","./assets/chunk-5VM5RSS4-B5_7xsLQ.js","./assets/chunk-F27PBJKO-Bg1lQ1Rs.js","./assets/chunk-IMKFNOWR-BSTxqGrs.js","./assets/chunk-JWPE2WC7-DMTvNdo8.js","./assets/chunk-POPQ4Y6H-U_-vhFSd.js","./assets/chunk-SVP7TREG-BTfs13k8.js","./assets/chunk-TICWLB2K-MnhKtrq3.js","./assets/chunk-XXDRQBXY-B_dmQOfP.js","./assets/classDiagram-ZZMXUADV-CpZZwVEt.js","./assets/classDiagram-v2-VYDZK3BY-CpZZwVEt.js","./assets/cose-bilkent-JH36ORCC-COY3y2Z5.js","./assets/cynefin-OW5HDTMX-jOS6sD5S.js","./assets/cynefinDiagram-5FMLGOSQ-C2HRN_EO.js","./assets/cytoscape.esm-BB4DxJjf.js","./assets/dagre-GXQ25YYZ-BuAyHP20.js","./assets/defaultLocale-DX6XiGOO.js","./assets/diagram-S7CK7UJ4-Cqsah0SH.js","./assets/diagram-UQ7AKVKN-NR7LtybQ.js","./assets/diagram-VSXAHHWV-C5chYQxA.js","./assets/diagram-VX7I27RA-DfYE6LO-.js","./assets/diagram-Z3DM3KII-DQMMgl-x.js","./assets/ebnfDiagram-PWID7BFC-C7qyHRnz.js","./assets/erDiagram-RLTQ6QDP-BCv7UVtn.js","./assets/flowDiagram-HODETNUW-0ZJyPxPQ.js","./assets/ganttDiagram-EL5Y4UJY-DD_EwDbb.js","./assets/gitGraphDiagram-WWUBYQGX-DrIPPun7.js","./assets/index-BsoAOpuf.css","./assets/index-CvxaJKFi.js","./assets/infoDiagram-27XIBGKW-Ci5g8J61.js","./assets/init-Gi6I4Gst.js","./assets/ishikawaDiagram-5VMMS53U-CQHVIQK3.js","./assets/journeyDiagram-3NMN7TZE-CaMHG1tq.js","./assets/kanban-definition-UXKFOSKX-CjcYu_fk.js","./assets/katex-HP8lGamR.js","./assets/layout-BOJ0XMc3.js","./assets/linear-DhTyVAf3.js","./assets/mermaid.core-zcDF-4Ok.js","./assets/mindmap-definition-YA3MSWOX-BsiKoj6V.js","./assets/ordinal-Cboi1Yqb.js","./assets/pegDiagram-XKGWAZYB-qRh_nYAX.js","./assets/pieDiagram-E7YTZNPT-fBW2o2Lw.js","./assets/quadrantDiagram-AXDQQJYC-BZXSE3J4.js","./assets/railroadDiagram-O6MQD6OU-CZKyBVxD.js","./assets/requirementDiagram-BXWQKSXE-JN2UMij8.js","./assets/sankeyDiagram-P5KCCOFB-CzDIiIvT.js","./assets/sequenceDiagram-WJ2MYXX4-Ch4MsNxq.js","./assets/sizeCapture-INFHLROL-BgaXryaN.js","./assets/stateDiagram-D77RDMKH-DVIpHK68.js","./assets/stateDiagram-v2-MP3YSRHH-0KP47_oO.js","./assets/swimlanes-42K2YHIH-jSLiXCaw.js","./assets/swimlanesDiagram-VR7AAH4N-v-bDW2C8.js","./assets/timeline-definition-24CTP7MA-83NbscN8.js","./assets/vennDiagram-4TSXK5OY-Qv6gR4WK.js","./assets/wardleyDiagram-VM6X3IG4-D3MrbVre.js","./assets/xychartDiagram-S5SC5T6Z-BGJUqgMt.js","./icon-192.png","./icon-512.png","./icon-maskable.png","./icon.svg","./index.html","./manifest.webmanifest","./materials/api-design.md","./materials/architecture.md","./materials/background-processing.md","./materials/caching.md","./materials/concurrency.md","./materials/data-storage.md","./materials/database-internals.md","./materials/databases.md","./materials/debugging.md","./materials/distributed-apis.md","./materials/distributed-systems.md","./materials/http-networking.md","./materials/infra-cloud.md","./materials/messaging.md","./materials/observability.md","./materials/performance.md","./materials/production-thinking.md","./materials/reliability.md","./materials/scalability.md","./materials/scale-behavior.md","./materials/security.md","./materials/system-design.md","./materials/testing.md","./materials/transactions-failures.md"];
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
