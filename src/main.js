import './style.css';
import content from './data/content.json';
import foundation from './data/foundation.json';
import {loadState,saveState,emptyState,STORAGE_KEY,loadFoundationState,saveFoundationState,emptyFoundationState,FOUNDATION_STORAGE_KEY,loadMode,saveMode,MODE_STORAGE_KEY,exportBackup,readBackup} from './store.js';
import {makeSession,selectQuestions,answer,nextQuestion,dayKey,makeFoundationSession,answerFoundation} from './engine.js';
import {icon,navItems,esc,button,download} from './ui.js';
import {home,categories,category,review,statistics,settings} from './views/dashboard.js';
import {study,topic} from './views/learning.js';
import {foundationHome,foundationCategories,foundationCategory,foundationStudy,foundationReview,foundationStatistics,foundationGlossary} from './views/foundation.js';
import {renderDiagrams} from './markdown.js';
const app=document.querySelector('#app');
let state,foundationState,selectedMode=loadMode(),storageError='',offlineLabel='オフライン用の教材を準備中',modal=null,restoreDraft=null,toastTimer;
try{state=loadState();}catch{state=emptyState();storageError='保存済みの記録を読み込めません。元のデータは上書きしていません。まず復旧用データを書き出し、バックアップから復元してください。';}
try{foundationState=loadFoundationState();}catch{foundationState=emptyFoundationState();storageError='保存済みの基礎編記録を読み込めません。元のデータは上書きしていません。まず復旧用データを書き出し、バックアップから復元してください。';}
const validIds=new Set(content.questions.map(q=>q.id));
const validLessonIds=new Set(foundation.lessons.map(l=>l.id));
if(state.session&&state.session.pending.some(id=>!validIds.has(id))){state.session=null;try{saveState(state);}catch(e){storageError=e.message;}}
if(foundationState.session&&!validLessonIds.has(foundationState.session.lessonId)){foundationState.session=null;try{saveFoundationState(foundationState);}catch(e){storageError=e.message;}}
const ctx=()=>({...content,foundation,state,foundationState,selectedMode,offlineLabel});
function notify(message){const n=document.querySelector('#notifications');n.textContent=message;clearTimeout(toastTimer);toastTimer=setTimeout(()=>n.textContent='',5000);}
function mutate(fn){if(storageError)throw Error('保存データの復旧が必要です。設定からバックアップを復元してください。');const copy=structuredClone(state);fn(copy);saveState(copy);state=copy;}
function mutateFoundation(fn){if(storageError)throw Error('保存データの復旧が必要です。設定からバックアップを復元してください。');const copy=structuredClone(foundationState);fn(copy);saveFoundationState(copy);foundationState=copy;}
function setMode(mode){selectedMode=mode==='foundations'?'foundations':'practice';saveMode(selectedMode);}
function navigate(route){if(location.hash===route)render();else location.hash=route;}
function route(){const [path,query]=location.hash.replace(/^#\/?/,'').split('?');const [page='home',id]=path.split('/');return {page:page||'home',id,query:new URLSearchParams(query)};}
function render({keepScroll=false}={}){
 const y=scrollY;const {page,id,query}=route();const c=ctx();const isFoundation=selectedMode==='foundations';let html;
 switch(page){
  case 'home':html=isFoundation?foundationHome(c):home(c);break;
  case 'categories':html=isFoundation?foundationCategories(c):categories(c);break;
  case 'category':html=isFoundation?foundationCategory(c,id):category(c,id);break;
  case 'topic':html=topic(c,id);break;
  case 'study':html=study(c);break;
  case 'foundation-study':html=foundationStudy(c);break;
  case 'glossary':html=foundationGlossary(c);break;
  case 'review':html=isFoundation?foundationReview(c,id):review(c,id);break;
  case 'stats':html=isFoundation?foundationStatistics(c):statistics(c);break;
  case 'settings':html=settings(c);break;
  default:html=isFoundation?foundationHome(c):home(c);
 }
 const selected=['category','topic','glossary'].includes(page)?'categories':page;
 const isStudy=['study','foundation-study'].includes(page);
 const brand=`<a class="brand" href="#/home"><img src="./icon.svg" alt=""><div>Backend<span>Knowledge Base</span></div></a>`;
 const footText=isFoundation?`基礎編 · ${foundation.lessons.length}レッスン`:`実践編 · 24トピック・120問`;
 const footSub=isFoundation?'基本概念から少しずつ学ぶ。':'理解を、説明できる力に。';
 app.innerHTML=`<div class="app-shell"><aside class="sidebar">${brand}<nav aria-label="メインナビゲーション">${navItems.map(([id,i,label])=>`<a class="nav-item ${selected===id?'active':''}" href="#/${id}" ${selected===id?'aria-current="page"':''}>${icon(i)}${label}</a>`).join('')}</nav><div class="sidebar-foot"><p>${icon('BookOpen')}${footText}</p><span>${footSub}</span></div></aside><div class="mobile-header">${brand}<a class="icon-button" href="#/review/bookmarks" aria-label="ブックマークを開く">${icon('Bookmark')}</a></div><main class="main ${isStudy?'study-mode':''}" id="main-content"><div class="main-inner">${storageError?`<div class="storage-error" role="alert">${esc(storageError)}<br><button data-action="raw-export">復旧用データを書き出す</button> · <a href="#/settings">設定を開く</a></div>`:''}${html}</div></main><nav class="bottom-nav" aria-label="下部ナビゲーション">${navItems.map(([id,i,label])=>`<a class="${selected===id?'active':''}" href="#/${id}" ${selected===id?'aria-current="page"':''}>${icon(i)}<span>${label}</span></a>`).join('')}</nav></div>`;
 if(modal)drawModal();
 if(keepScroll)window.scrollTo(0,y);else window.scrollTo(0,0);
 if(page==='topic'&&query.has('chapter'))requestAnimationFrame(()=>document.getElementById('chapter-'+query.get('chapter'))?.scrollIntoView());
 renderDiagrams(app).catch(()=>notify('図を表示できませんでした。教材の図式コードをご確認ください。'));
 document.querySelectorAll('.prose a[href^="https:"]').forEach(a=>{a.target='_blank';a.rel='noopener noreferrer';});
}
let previousFocus;
function showModal(config){previousFocus=document.activeElement;modal=config;drawModal();}
function drawModal(){document.querySelector('.modal-backdrop')?.remove();const overlay=document.createElement('div');overlay.className='modal-backdrop';overlay.innerHTML=`<section class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><button class="icon-button dialog-close" data-action="close-modal" aria-label="閉じる">${icon('X')}</button><h2 id="dialog-title">${modal.title}</h2><p>${modal.body}</p><div class="dialog-actions">${modal.buttons}</div></section>`;document.body.append(overlay);overlay.querySelector('button')?.focus();}
function closeModal(){modal=null;document.querySelector('.modal-backdrop')?.remove();previousFocus?.focus();}
function start(options={}){
 const ids=options.question?[options.question]:selectQuestions(content.questions,state,options);
 if(!ids.length){showModal({title:'今の学習は完了です',body:'この範囲に未学習・期限到来の問題はありません。期限前の問題は自主練習できます。',buttons:button('自主練習を始める','practice-confirm','primary',`data-category="${options.category||''}" data-topic="${options.topic||''}"`)+button('カテゴリを見る','go-categories','secondary')});return;}
 mutate(s=>s.session=makeSession(ids,options));navigate('#/study');
}
function startWithCheck(options={}){if(state.session&&state.session.phase!=='done'){showModal({title:'学習の続きがあります',body:'続きから再開できます。新しく始める場合も、すでに回答した問題の記録は残ります。',buttons:button('続きから再開','resume','primary')+button('新しく始める','replace-session','secondary',`data-options="${esc(JSON.stringify(options))}"`)});}else start(options);}
async function checkOffline(){
 if(!('serviceWorker'in navigator)){offlineLabel='このブラウザではオフライン保存に未対応';return;}
 try{
  const registration=await navigator.serviceWorker.register('./sw.js');
  const channel=new MessageChannel();
  const check=()=>new Promise(resolve=>{const worker=registration.active;if(!worker){resolve(false);return;}const timer=setTimeout(()=>resolve(false),5000);channel.port1.onmessage=e=>{clearTimeout(timer);resolve(e.data.ready===true);};worker.postMessage({type:'STATUS'},[channel.port2]);});
  if(registration.active&&await check())offlineLabel='オフラインで学習できます';
  else offlineLabel='教材を端末に保存しています…';
  const updateState=()=>{offlineLabel='オフラインで学習できます';render({keepScroll:true});};
  if(registration.installing){registration.installing.addEventListener('statechange',e=>{if(e.target.state==='activated')updateState();if(e.target.state==='redundant'){offlineLabel='保存が完了していません。通信環境を確認してください';render({keepScroll:true});}});}
  navigator.serviceWorker.addEventListener('controllerchange',updateState,{once:true});
  registration.update().catch(()=>{});
 }catch{offlineLabel='オフライン保存を再試行してください';}
}
app.addEventListener('toggle',event=>{if(event.target.tagName==='DETAILS'&&event.target.open)renderDiagrams(event.target).catch(()=>notify('図を表示できませんでした。図式コードをご確認ください。'));},true);
app.addEventListener('input',event=>{
 if(event.target.id==='category-search'){const term=event.target.value.trim().toLocaleLowerCase();let n=0;app.querySelectorAll('.category-group').forEach(g=>{g.hidden=!g.dataset.search.toLocaleLowerCase().includes(term);if(!g.hidden)n++;});document.querySelector('#search-empty').hidden=n>0;}
 if(event.target.id==='glossary-search'){const term=event.target.value.trim().toLocaleLowerCase();let n=0;app.querySelectorAll('.glossary-item').forEach(g=>{g.hidden=!g.dataset.search.includes(term);if(!g.hidden)n++;});document.querySelector('#glossary-empty').hidden=n>0;}
});
app.addEventListener('change',async event=>{
 try{
 if(event.target.name==='answer'){mutate(s=>s.session.selected=event.target.value);render({keepScroll:true});document.querySelector(`input[name="answer"][value="${event.target.value}"]`)?.focus();}
 if(event.target.id==='session-size'){mutate(s=>s.settings.size=Number(event.target.value));notify('次の学習から適用します');}
 if(event.target.id==='backup-file'&&event.target.files[0]){
  const file=event.target.files[0];if(file.size>15_000_000)throw Error('バックアップは15MB以下のファイルを選択してください。');
  restoreDraft=readBackup(await file.text());
  if(restoreDraft.state.session?.pending.some(id=>!validIds.has(id)))restoreDraft.state.session=null;
  if(restoreDraft.foundations.session&&!validLessonIds.has(restoreDraft.foundations.session.lessonId))restoreDraft.foundations.session=null;
  const unknown=restoreDraft.state.events.filter(e=>!validIds.has(e.question)).length;
  const fCompleted=Object.keys(restoreDraft.foundations.completedAt).length;
  showModal({title:'バックアップを復元しますか？',body:`書き出し日時：${esc(new Date(restoreDraft.exportedAt).toLocaleString('ja-JP'))}<br>実践編：回答 ${restoreDraft.state.events.length}回 · ブックマーク ${restoreDraft.state.bookmarks.length}件<br>基礎編：完了 ${fCompleted}レッスン · 学習 ${restoreDraft.foundations.events.length}回 · 保存 ${restoreDraft.foundations.bookmarks.length}件<br><br>現在の記録を置き換えます。${unknown?`旧教材の履歴${unknown}件も保持します。`:''}`,buttons:button('現在の記録を書き出す','export','secondary')+button('このバックアップで置き換える','confirm-import','danger')+button('キャンセル','close-modal','secondary')});
  event.target.value='';
 }
 }catch(e){notify(e.message||'処理できませんでした。');}
});
document.addEventListener('click',async event=>{
 const el=event.target.closest('[data-action]');if(!el)return;
 const action=el.dataset.action;
 try{
 switch(action){
 case 'switch-mode':{
  setMode(el.dataset.mode);
  const {page}=route();
  if(['study','foundation-study','glossary'].includes(page))navigate('#/home');
  else render();
  break;
 }
 case 'start-foundation':{
  const lessonId=el.dataset.lesson;
  if(!validLessonIds.has(lessonId))break;
  mutateFoundation(f=>{f.session=makeFoundationSession(lessonId,{review:Boolean(el.dataset.review),practice:Boolean(el.dataset.practice)});});
  navigate('#/foundation-study');
  break;
 }
 case 'resume-foundation':navigate('#/foundation-study');break;
 case 'foundation-step':mutateFoundation(f=>{if(f.session)f.session.step=el.dataset.step;});render();break;
 case 'foundation-choice':mutateFoundation(f=>{if(f.session&&f.session.step==='check'&&!f.session.selectedChoice)f.session.selectedChoice=el.dataset.choice;});render({keepScroll:true});break;
 case 'foundation-reveal':mutateFoundation(f=>{if(f.session)f.session.keyPointsRevealed=true;});render({keepScroll:true});break;
 case 'foundation-rate':{
  const lesson=foundation.lessons.find(l=>l.id===foundationState.session?.lessonId);
  if(!lesson)break;
  mutateFoundation(f=>answerFoundation(f,lesson,Number(el.dataset.rating)));
  render();
  break;
 }
 case 'foundation-bookmark':{
  const id=el.dataset.lesson;
  mutateFoundation(f=>{f.bookmarks=f.bookmarks.includes(id)?f.bookmarks.filter(x=>x!==id):[...f.bookmarks,id];});
  render({keepScroll:true});
  notify(foundationState.bookmarks.includes(id)?'ブックマークに追加しました':'ブックマークを解除しました');
  break;
 }
 case 'foundation-back':{
  const step=foundationState.session?.step;
  if(step==='check'||step==='review'){mutateFoundation(f=>{if(f.session)f.session.step='intro';});render();}
  else if(step==='reflection'){mutateFoundation(f=>{if(f.session)f.session.step='check';});render();}
  else navigate('#/home');
  break;
 }
 case 'foundation-finish':mutateFoundation(f=>{f.session=null;});navigate('#/home');break;
 case 'foundation-to-practice-topic':mutateFoundation(f=>{f.session=null;});setMode('practice');startWithCheck({category:el.dataset.category||'',topic:el.dataset.topic||''});break;
 case 'start':setMode('practice');startWithCheck({category:el.dataset.category||'',topic:el.dataset.topic||''});break;
 case 'practice':setMode('practice');startWithCheck({category:el.dataset.category||'',topic:el.dataset.topic||'',practice:true});break;
 case 'single':setMode('practice');startWithCheck({question:el.dataset.question});break;
 case 'new-session':startWithCheck();break;
 case 'replace-session':{const opts=JSON.parse(el.dataset.options);closeModal();start(opts);break;}
 case 'resume':closeModal();navigate('#/study');break;
 case 'practice-confirm':{const opts={category:el.dataset.category||'',topic:el.dataset.topic||'',practice:true};closeModal();start(opts);break;}
 case 'go-categories':closeModal();navigate('#/categories');break;
 case 'bookmark':mutate(s=>{const id=el.dataset.question;s.bookmarks=s.bookmarks.includes(id)?s.bookmarks.filter(x=>x!==id):[...s.bookmarks,id];});render({keepScroll:true});notify(state.bookmarks.includes(el.dataset.question)?'ブックマークに追加しました':'ブックマークを解除しました');break;
 case 'skip':mutate(s=>{if(s.session.phase!=='question')return;s.session.pending.push(s.session.pending.shift());s.session.selected=null;});render();notify('未回答のまま、後ろに回しました');break;
 case 'reveal':{const q=content.questions.find(q=>q.id===state.session.pending[0]);if(q.type==='choice'&&state.session.selected===null)return;mutate(s=>{s.session.phase='answer';if(q.type==='choice')answer(s,q);});render();break;}
 case 'rate':{const q=content.questions.find(q=>q.id===state.session.pending[0]);mutate(s=>answer(s,q,Number(el.dataset.rating)));render();break;}
 case 'next':mutate(s=>nextQuestion(s));render();break;
 case 'end-session':showModal({title:'今回の学習を終了しますか？',body:'回答済みの記録は保存されています。スキップした問題は未回答のまま残ります。中断なら、後で続きから再開できます。',buttons:button('今回の学習を終了','finish','primary')+button('中断してホームへ','pause','secondary')+button('学習を続ける','close-modal','secondary')});break;
 case 'finish':mutate(s=>{if(s.session)s.session.phase='done';});closeModal();navigate('#/study');break;
 case 'pause':closeModal();navigate('#/home');break;
 case 'close-modal':closeModal();break;
 case 'export':if(storageError){download(localStorage.getItem(STORAGE_KEY)||'{}',`backend-kb-recovery-${dayKey()}.json`);notify('元の保存データを書き出しました');}else{download(exportBackup(state,foundationState,selectedMode),`backend-kb-${dayKey()}.json`);notify('バックアップを書き出しました');}break;
 case 'raw-export':download(localStorage.getItem(STORAGE_KEY)||'{}',`backend-kb-recovery-${dayKey()}.json`);break;
 case 'import':document.querySelector('#backup-file').click();break;
 case 'confirm-import':if(restoreDraft){saveState(restoreDraft.state);saveFoundationState(restoreDraft.foundations);saveMode(restoreDraft.selectedMode);state=restoreDraft.state;foundationState=restoreDraft.foundations;selectedMode=restoreDraft.selectedMode;storageError='';restoreDraft=null;closeModal();render();notify('バックアップを復元しました');}break;
 case 'chapter':document.getElementById('chapter-'+el.dataset.chapter)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});break;
 case 'check-offline':offlineLabel='保存状態を確認しています…';render({keepScroll:true});await checkOffline();render({keepScroll:true});break;
 }
 }catch(e){notify(e.message||'処理できませんでした。');}
});
document.addEventListener('keydown',e=>{if(!modal)return;if(e.key==='Escape')closeModal();if(e.key==='Tab'){const items=[...document.querySelectorAll('.dialog button,.dialog a')];if(e.shiftKey&&document.activeElement===items[0]){e.preventDefault();items.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===items.at(-1)){e.preventDefault();items[0].focus();}}});
window.addEventListener('hashchange',()=>{closeModal();render();});
window.addEventListener('storage',e=>{
 if([STORAGE_KEY,FOUNDATION_STORAGE_KEY,MODE_STORAGE_KEY].includes(e.key)){
  try{state=loadState();foundationState=loadFoundationState();selectedMode=loadMode();render({keepScroll:true});notify('別の画面で変更された記録を反映しました');}
  catch{notify('学習記録を再読み込みできませんでした');}
 }
});
window.addEventListener('online',()=>notify('オンラインになりました'));
window.addEventListener('offline',()=>notify(offlineLabel==='オフラインで学習できます'?'オフラインで学習を続けられます':'通信が切れました。教材の保存状態を確認してください'));
render();checkOffline().then(()=>render({keepScroll:true}));

