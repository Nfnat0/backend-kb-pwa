import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import {createHash} from 'node:crypto';
const definitions = [
 ['network','ネットワーク & 通信','通信の仕組みから、壊れにくいAPIへ。','Wifi','#438bff',['http-networking','api-design','distributed-apis']],
 ['database','データベース & ストレージ','正しさと速さを、データから考える。','Database','#32c99b',['databases','database-internals','caching','data-storage']],
 ['async','並行処理 & メッセージング','重複・順序・待ち時間を制御する。','Layers','#ffac53',['concurrency','messaging','background-processing']],
 ['distributed','分散システム & スケール','分散の代償を理解して、規模に備える。','Network','#a78bfa',['distributed-systems','transactions-failures','scalability','scale-behavior']],
 ['reliability','信頼性 & セキュリティ','障害を閉じ込め、安全に運用する。','ShieldCheck','#f7758f',['reliability','security','observability','performance']],
 ['design','設計思想 & 本番運用','根拠のある設計と、再現できる判断。','Lightbulb','#e9c75a',['architecture','system-design','testing','production-thinking','debugging','infra-cloud']]
];
const editorial=JSON.parse(readFileSync('scripts/editorial.json','utf8'));
const clean=s=>s.replace(/\*\*|`/g,'').trim();
const section=(md,n)=> {const m=md.match(new RegExp('^## '+n+'\\. [^\\n]*\\n([\\s\\S]*?)(?=^## |$(?![\\s\\S]))','m')); if(!m) throw Error('Missing section '+n);return m[1].trim();};
const sentences=s=>s.split(/(?<=。)\s*/).filter(Boolean);
function points(md){
 const list=md.split('\n').filter(l=>/^(- |\d+\. )/.test(l)).map(l=>clean(l.replace(/^(- |\d+\. )/,'')));
 if(list.length) return list.slice(0,5);
 const rows=md.split('\n').filter(l=>l.startsWith('|')).slice(2).map(l=>l.split('|').slice(1,-1).map(clean));
 if(rows.length) return rows.slice(0,4).map(r=>`${r[0]}：${r.slice(1).join(' / ')}`);
 return sentences(clean(md.replace(/^### .*$/gm,''))).slice(0,3);
}
const topics=[],questions=[],categories=[];
for(const [ci,d] of definitions.entries()){
 const [id,title,description,icon,color,ids]=d;categories.push({id,title,description,icon,color,topics:ids});
 for(const slug of ids){
  const raw=readFileSync(`public/materials/${slug}.md`,'utf8');
  const body=raw.replace(/^---\n[\s\S]*?\n---\n/,'').trim();
  const fullTitle=body.match(/^# (.+)/m)[1];const title=fullTitle.replace(/（.*?）/g,'');
  const short=body.match(/### 30秒で説明するなら\n([\s\S]*?)(?=###|## |$)/m);
  // Section extraction is anchored by the next heading, never by an end-of-line.
  const explain=section(body,8).split('### 3分')[0].replace(/^### .*\n/,'').replace(/^> ?/gm,'').trim();
  const three=section(body,8).split('### 3分')[1]||section(body,10);
  const casePart=section(body,9);const match=casePart.match(/### ケース問題\s+([\s\S]*?)\s*::: details 模範回答\s+([\s\S]*?)\s*:::/);
  if(!match)throw Error('Missing case '+slug);
  const e=editorial[slug];if(!e)throw Error('Missing editorial '+slug);
  const url=`https://nfnat0.github.io/backend-knowledge-base/topics/${slug}.html`;
  topics.push({id:slug,category:id,title,description:clean(section(body,1).split('\n\n')[0]),url,markdown:body,sourceFile:`materials/${slug}.md`});
  const answers=[explain,section(body,5),section(body,6),match[2].trim()];
  const prompts=[e[0],e[1],e[2],match[1].trim()];
  const chapters=[8,5,6,9];
  for(let j=0;j<4;j++){
   const p=j===0?points(three):points(answers[j]);
   const summary=j===0?explain:j===3?sentences(answers[j]).slice(0,2).join(''):p.slice(0,2).join('\n\n');
   const hash=createHash('sha256').update(prompts[j]+'\n'+answers[j]).digest('hex').slice(0,10);
   questions.push({id:`${slug}-${j+1}-${hash}`,topic:slug,category:id,type:'explain',label:['仕組み','採用条件','トレードオフ','ケース問題'][j],prompt:prompts[j],summary,points:p,detail:j===0?section(body,3):answers[j],chapter:chapters[j],source:url,origin:j===3?'元教材のケース問題':'元教材に基づく学習問題'});
  }
  const offset=topics.length%4;const choices=e[4].map((text,i)=>({id:String(i),text}));
  const rotated=choices.slice(offset).concat(choices.slice(0,offset));
  const hash=createHash('sha256').update(JSON.stringify(e.slice(3))).digest('hex').slice(0,10);
  questions.push({id:`${slug}-5-${hash}`,topic:slug,category:id,type:'choice',label:'知識チェック',prompt:e[3],choices:rotated,correct:'0',summary:e[5],points:[],detail:section(body,e[6]),chapter:e[6],source:url,origin:'元教材に基づく学習問題'});
 }
}
if(topics.length!==24||questions.length!==120)throw Error('Content count mismatch');
const foundationPath=existsSync('ios-app/BackendKB/Resources/foundation.json')?'ios-app/BackendKB/Resources/foundation.json':'src/data/foundation.json';
const foundationSource=readFileSync(foundationPath,'utf8');
const foundation=JSON.parse(foundationSource);
const topicIds=new Set(topics.map(t=>t.id));
if(foundation.lessons?.length!==30||new Set(foundation.lessons.map(l=>l.id)).size!==30)throw Error('Foundation lesson count mismatch');
if(!foundation.terms?.length||new Set(foundation.terms.map(t=>t.id)).size!==foundation.terms.length)throw Error('Foundation term mismatch');
const coveredTopics=new Set(foundation.lessons.map(l=>l.topic));
if(coveredTopics.size!==topicIds.size||[...topicIds].some(id=>!coveredTopics.has(id)))throw Error('Foundation topic coverage mismatch');
for(const l of foundation.lessons){
 for(const f of ['id','topic','title','objective','exampleTitle','example','reflectionPrompt','sourceSection','modelAnswer']){if(typeof l[f]!=='string'||!l[f].trim())throw Error(`Invalid lesson ${l.id}: ${f}`);}
 if(!Array.isArray(l.sections)||!l.sections.length||l.sections.some(s=>!s.title||!s.body))throw Error(`Invalid sections in ${l.id}`);
 if(!Array.isArray(l.flow)||l.flow.length<2||!Array.isArray(l.keyPoints)||l.keyPoints.length<2)throw Error(`Invalid flow/keyPoints in ${l.id}`);
 const cids=l.check?.choices?.map(c=>c.id)||[];
 if(cids.length<2||new Set(cids).size!==cids.length||!cids.includes(l.check.correct)||!l.check.prompt||!l.check.explanation)throw Error(`Invalid check in ${l.id}`);
}
for(const t of foundation.terms){
 for(const f of ['id','japanese','definition','topic']){if(typeof t[f]!=='string'||!t[f].trim())throw Error(`Invalid term ${t.id}: ${f}`);}
 if(!topicIds.has(t.topic))throw Error(`Unknown topic in term ${t.id}`);
}
mkdirSync('src/data',{recursive:true});
writeFileSync('src/data/content.json',JSON.stringify({version:'c881de6',sourceDate:'2026-09-23',categories,topics,questions}));
writeFileSync('src/data/foundation.json',JSON.stringify(foundation));
console.log(`${topics.length} topics / ${questions.filter(q=>q.type==='explain').length} explanations / ${questions.filter(q=>q.type==='choice').length} choices / ${foundation.lessons.length} foundation lessons / ${foundation.terms.length} glossary terms`);

