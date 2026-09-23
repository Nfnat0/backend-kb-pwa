export const STORAGE_KEY='backend-kb:learning:v1';
export const emptyState=()=>({schema:1,events:[],bookmarks:[],settings:{size:10},session:null});
const datePattern=/^\d{4}-\d{2}-\d{2}$/;
const validDay=v=>typeof v==='string'&&datePattern.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;
const text=v=>typeof v==='string'&&v.length>0&&v.length<300;
export function validateState(value){
 if(!value||value.schema!==1||!Array.isArray(value.events)||value.events.length>100000||!Array.isArray(value.bookmarks)||value.bookmarks.length>10000||![5,10,20].includes(value.settings?.size))throw Error('対応していないバックアップ形式です。');
 const eventIds=new Set();
 for(const e of value.events){
  if(!e||!text(e.id)||eventIds.has(e.id)||!text(e.question)||!text(e.topic)||!['explain','choice'].includes(e.type)||![0,1,2].includes(e.rating)||typeof e.practice!=='boolean'||!validDay(e.day)||!validDay(e.due)||!Number.isFinite(Date.parse(e.at))||![0,1,3,7,14,30,60].includes(e.interval)||(e.type==='choice'&&(typeof e.correct!=='boolean'||!['0','1','2','3'].includes(e.choice)||e.rating!==(e.correct?2:0)))||(e.type==='explain'&&e.correct!==null))throw Error('学習履歴の内容を検証できませんでした。');
  eventIds.add(e.id);
 }
 if(value.bookmarks.some(x=>!text(x)))throw Error('ブックマークの形式が不正です。');
 const s=value.session;
 if(s!==null){
  if(!s||!text(s.id)||!Array.isArray(s.pending)||s.pending.length>20||s.pending.some(x=>!text(x))||new Set(s.pending).size!==s.pending.length||!Array.isArray(s.completed)||s.completed.some(x=>!eventIds.has(x))||new Set(s.completed).size!==s.completed.length||!Number.isInteger(s.total)||s.total<1||s.total>20||!['question','answer','feedback','done'].includes(s.phase)||typeof s.practice!=='boolean'||typeof s.category!=='string'||typeof s.topic!=='string'||(s.phase!=='done'&&!s.pending.length)||(s.selected!==null&&!['0','1','2','3'].includes(s.selected)))throw Error('学習セッションの形式が不正です。');
 }
 // Reconstruct only known fields to keep backup data out of the UI's execution paths.
 return {schema:1,events:value.events.map(e=>({id:e.id,question:e.question,topic:e.topic,type:e.type,rating:e.rating,correct:e.correct,choice:e.choice??null,practice:e.practice,day:e.day,due:e.due,interval:e.interval,at:e.at})),bookmarks:[...new Set(value.bookmarks)],settings:{size:value.settings.size},session:s?{id:s.id,pending:[...s.pending],completed:[...s.completed],total:s.total,category:s.category,topic:s.topic,practice:s.practice,phase:s.phase,selected:s.selected,startedAt:s.startedAt,lastEvent:s.lastEvent}:null};
}
export function loadState(){const raw=localStorage.getItem(STORAGE_KEY);return raw?validateState(JSON.parse(raw)):emptyState();}
export function saveState(state){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch{throw Error('端末に保存できませんでした。空き容量を確認し、バックアップを書き出してください。');}}
export function exportBackup(state){return JSON.stringify({app:'backend-kb',version:1,exportedAt:new Date().toISOString(),state},null,2);}
export function readBackup(raw){
 const b=JSON.parse(raw);if(b.app!=='backend-kb'||b.version!==1||!Number.isFinite(Date.parse(b.exportedAt)))throw Error('Backend KBのバックアップを選択してください。');
 return {exportedAt:b.exportedAt,state:validateState(b.state)};
}
