
const SCOPE=self.registration.scope;
const PREFIX='backend-kb:'+SCOPE+':';
const CACHE=PREFIX+'a66008b6b3bc';
const ASSETS=["./apple-touch-icon.png","./assets/abnfDiagram-VCTEODGH-BluFHfZk.js","./assets/arc-D2YBkYNA.js","./assets/architectureDiagram-5GKGNRK7-GbYZtbWP.js","./assets/blockDiagram-I7D4REHJ-BQKAJHqX.js","./assets/c4Diagram-7LVT6UL2-CNDN80x1.js","./assets/channel-BceCM6eE.js","./assets/chunk-2Q5K7J3B-BgPoAnvl.js","./assets/chunk-5VM5RSS4-haMfDskR.js","./assets/chunk-F27PBJKO-BTA2MHMt.js","./assets/chunk-IMKFNOWR-BS3wy_Yo.js","./assets/chunk-JWPE2WC7-D3uA_UQW.js","./assets/chunk-POPQ4Y6H-fXoIBiuc.js","./assets/chunk-SVP7TREG-C9oUF8mz.js","./assets/chunk-TICWLB2K-C5nO0fbu.js","./assets/chunk-XXDRQBXY-Dk1IcL8L.js","./assets/classDiagram-ZZMXUADV-B577HxYI.js","./assets/classDiagram-v2-VYDZK3BY-B577HxYI.js","./assets/cose-bilkent-JH36ORCC-DHP5W20E.js","./assets/cynefin-OW5HDTMX-D2qXHfQX.js","./assets/cynefinDiagram-5FMLGOSQ-vcsECO1Z.js","./assets/cytoscape.esm-BB4DxJjf.js","./assets/dagre-GXQ25YYZ-CZw4CBDl.js","./assets/defaultLocale-DX6XiGOO.js","./assets/diagram-S7CK7UJ4-CeOorr7V.js","./assets/diagram-UQ7AKVKN-DN2qRG7i.js","./assets/diagram-VSXAHHWV-Dvu4TFFE.js","./assets/diagram-VX7I27RA-BLqPLB_o.js","./assets/diagram-Z3DM3KII-C00hMrrI.js","./assets/ebnfDiagram-PWID7BFC-D47G_Syu.js","./assets/erDiagram-RLTQ6QDP-Dpcj4wIQ.js","./assets/flowDiagram-HODETNUW-Cna2Ym6X.js","./assets/ganttDiagram-EL5Y4UJY-TLRBDHki.js","./assets/gitGraphDiagram-WWUBYQGX-DCmMSW--.js","./assets/index-D7yhOWnF.css","./assets/index-DJ98t3yQ.js","./assets/infoDiagram-27XIBGKW-BuXCCncd.js","./assets/init-Gi6I4Gst.js","./assets/ishikawaDiagram-5VMMS53U-DHnWLJHv.js","./assets/journeyDiagram-3NMN7TZE-BTk5q8vg.js","./assets/kanban-definition-UXKFOSKX-D55Fgw70.js","./assets/katex-HP8lGamR.js","./assets/layout-A9iHCcgJ.js","./assets/linear-DQMLSJMX.js","./assets/mermaid.core-Dh5u3Sdk.js","./assets/mindmap-definition-YA3MSWOX-D2NrXzyY.js","./assets/ordinal-Cboi1Yqb.js","./assets/pegDiagram-XKGWAZYB-B4sfbZTX.js","./assets/pieDiagram-E7YTZNPT-DXsffUaj.js","./assets/quadrantDiagram-AXDQQJYC-BvCNyvP6.js","./assets/railroadDiagram-O6MQD6OU-BLo3pblL.js","./assets/requirementDiagram-BXWQKSXE-DLuJAdU7.js","./assets/sankeyDiagram-P5KCCOFB-B711diMa.js","./assets/sequenceDiagram-WJ2MYXX4-TgasPEmG.js","./assets/sizeCapture-INFHLROL-DKn9TW_k.js","./assets/stateDiagram-D77RDMKH-CDJyUEhX.js","./assets/stateDiagram-v2-MP3YSRHH-KFFKb1TB.js","./assets/swimlanes-42K2YHIH-Wk7xhAGD.js","./assets/swimlanesDiagram-VR7AAH4N-B0LOmFqk.js","./assets/timeline-definition-24CTP7MA-UM1cdgXl.js","./assets/vennDiagram-4TSXK5OY-D671TKYz.js","./assets/wardleyDiagram-VM6X3IG4-DZbs5f07.js","./assets/xychartDiagram-S5SC5T6Z-qnYLotxB.js","./icon-192.png","./icon-512.png","./icon-maskable.png","./icon.svg","./index.html","./manifest.webmanifest","./materials/api-design.md","./materials/architecture.md","./materials/background-processing.md","./materials/caching.md","./materials/concurrency.md","./materials/data-storage.md","./materials/database-internals.md","./materials/databases.md","./materials/debugging.md","./materials/distributed-apis.md","./materials/distributed-systems.md","./materials/http-networking.md","./materials/infra-cloud.md","./materials/messaging.md","./materials/observability.md","./materials/performance.md","./materials/production-thinking.md","./materials/reliability.md","./materials/scalability.md","./materials/scale-behavior.md","./materials/security.md","./materials/system-design.md","./materials/testing.md","./materials/transactions-failures.md"];
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
