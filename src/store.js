export const STORAGE_KEY='backend-kb:learning:v1';
export const FOUNDATION_STORAGE_KEY='backend-kb:foundations:v1';
export const MODE_STORAGE_KEY='backend-kb:mode:v1';
export const emptyState=()=>({schema:1,events:[],bookmarks:[],settings:{size:10},session:null});
export const emptyFoundationState=()=>({schema:1,events:[],completedAt:{},bookmarks:[],session:null});
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
export function validateFoundationState(value){
 if(!value||value.schema!==1||!Array.isArray(value.events)||value.events.length>100000||!Array.isArray(value.bookmarks)||value.bookmarks.length>10000||typeof value.completedAt!=='object'||value.completedAt===null||Array.isArray(value.completedAt))throw Error('基礎編の学習記録を検証できませんでした。');
 const eventIds=new Set();
 for(const e of value.events){
  if(!e||!text(e.id)||eventIds.has(e.id)||!text(e.lesson)||!text(e.topic)||![0,1,2].includes(e.rating)||(e.correct!==null&&typeof e.correct!=='boolean')||(e.choice!==null&&e.choice!==undefined&&!text(e.choice))||typeof e.practice!=='boolean'||!validDay(e.day)||!validDay(e.due)||!Number.isFinite(Date.parse(e.at))||![0,1,3,7,14,30,60].includes(e.interval))throw Error('基礎編の学習履歴を検証できませんでした。');
  eventIds.add(e.id);
 }
 const completedAt={};
 for(const [k,v] of Object.entries(value.completedAt)){
  if(!text(k)||typeof v!=='string'||!Number.isFinite(Date.parse(v)))throw Error('基礎編の完了記録が不正です。');
  completedAt[k]=v;
 }
 if(value.bookmarks.some(x=>!text(x)))throw Error('基礎編のブックマーク形式が不正です。');
 const s=value.session;
 if(s!==null){
  if(!s||!text(s.id)||!text(s.lessonId)||!['intro','check','reflection','review','done'].includes(s.step)||(s.selectedChoice!==null&&!text(s.selectedChoice))||typeof s.keyPointsRevealed!=='boolean'||typeof s.isReview!=='boolean'||typeof s.practice!=='boolean'||!Number.isFinite(Date.parse(s.startedAt))||(s.lastEvent!==undefined&&s.lastEvent!==null&&!eventIds.has(s.lastEvent)))throw Error('基礎編のセッション形式が不正です。');
 }
 return {schema:1,events:value.events.map(e=>({id:e.id,lesson:e.lesson,topic:e.topic,rating:e.rating,correct:e.correct,choice:e.choice??null,practice:e.practice,day:e.day,due:e.due,interval:e.interval,at:e.at})),completedAt,bookmarks:[...new Set(value.bookmarks)],session:s?{id:s.id,lessonId:s.lessonId,step:s.step,selectedChoice:s.selectedChoice,keyPointsRevealed:s.keyPointsRevealed,isReview:s.isReview,practice:s.practice,startedAt:s.startedAt,lastEvent:s.lastEvent??null}:null};
}
export function loadState(){const raw=localStorage.getItem(STORAGE_KEY);return raw?validateState(JSON.parse(raw)):emptyState();}
export function saveState(state){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch{throw Error('端末に保存できませんでした。空き容量を確認し、バックアップを書き出してください。');}}
export function loadFoundationState(){const raw=localStorage.getItem(FOUNDATION_STORAGE_KEY);return raw?validateFoundationState(JSON.parse(raw)):emptyFoundationState();}
export function saveFoundationState(state){try{localStorage.setItem(FOUNDATION_STORAGE_KEY,JSON.stringify(state));}catch{throw Error('基礎編の記録を端末に保存できませんでした。空き容量を確認してください。');}}
export function loadMode(){try{return localStorage.getItem(MODE_STORAGE_KEY)==='foundations'?'foundations':'practice';}catch{return 'practice';}}
export function saveMode(mode){try{localStorage.setItem(MODE_STORAGE_KEY,mode==='foundations'?'foundations':'practice');}catch{}}
export function exportBackup(state,foundations=emptyFoundationState(),selectedMode='practice'){return JSON.stringify({app:'backend-kb',version:2,exportedAt:new Date().toISOString(),selectedMode:selectedMode==='foundations'?'foundations':'practice',state,foundations},null,2);}
export function readBackup(raw){
 const b=JSON.parse(raw);if(b.app!=='backend-kb'||![1,2].includes(b.version)||!Number.isFinite(Date.parse(b.exportedAt)))throw Error('Backend KBのバックアップを選択してください。');
 const state=validateState(b.state);
 const foundations=b.version===2?validateFoundationState(b.foundations):emptyFoundationState();
 const selectedMode=b.version===2&&b.selectedMode==='foundations'?'foundations':'practice';
 return {version:b.version,exportedAt:b.exportedAt,selectedMode,state,foundations};
}

