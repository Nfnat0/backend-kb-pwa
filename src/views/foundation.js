import {icon,button,categoryIcon,progress,header,esc,empty,ratingLabel} from '../ui.js';
import {foundationStats,latestFoundation,isWeakFoundation,dueFoundationLessons,recommendedFoundationLesson,dayKey} from '../engine.js';

export function modeSelector(selectedMode='practice'){
 const modes=[
  ['practice','実践編','仕組みと設計判断を深める'],
  ['foundations','基礎編','基本概念から少しずつ学ぶ']
 ];
 return `<div class="mode-selector" role="group" aria-label="学習モードの切り替え">${modes.map(([id,title,subtitle])=>`<button type="button" class="mode-card ${selectedMode===id?'active':''}" data-action="switch-mode" data-mode="${id}" aria-pressed="${selectedMode===id}"><strong>${title}</strong><span>${subtitle}</span></button>`).join('')}</div>`;
}

export function isLessonCompleted(foundationState,evaluated,lessonId){
 return Boolean(foundationState.completedAt[lessonId])||evaluated.has(lessonId);
}

export function orderedTopicsForFoundation(topics,lessons,categoryId=''){
 const priority=id=>{const idx=lessons.findIndex(l=>l.topic===id);return idx===-1?999:idx;};
 return topics.filter(t=>!categoryId||t.category===categoryId).slice().sort((a,b)=>priority(a.id)-priority(b.id));
}

export function orderedCategoriesForFoundation(categories,lessons){
 const priority=c=>Math.min(...c.topics.map(tid=>{const idx=lessons.findIndex(l=>l.topic===tid);return idx===-1?999:idx;}));
 return categories.slice().sort((a,b)=>priority(a)-priority(b));
}

export function foundationCategoryRow(c,ctx){
 const lessons=ctx.foundation.lessons.filter(l=>c.topics.includes(l.topic));
 const evaluated=latestFoundation(ctx.foundationState.events);
 const count=lessons.filter(l=>isLessonCompleted(ctx.foundationState,evaluated,l.id)).length;
 const pct=lessons.length?count/lessons.length*100:0;
 return `<a class="category-row" href="#/category/${c.id}">${categoryIcon(c)}<div class="row-main"><h3>${esc(c.title)}</h3><div class="row-meta"><span>${count}<span class="muted"> / ${lessons.length}レッスン</span></span><span>${Math.round(pct)}%</span></div>${progress(pct,c.color)}</div>${icon('ChevronRight','chevron')}</a>`;
}

export function foundationHome(ctx){
 const lessons=ctx.foundation.lessons;
 const s=foundationStats(ctx.foundationState,lessons);
 const activeSession=ctx.foundationState.session&&ctx.foundationState.session.step!=='done'?ctx.foundationState.session:null;
 const activeLesson=activeSession?lessons.find(l=>l.id===activeSession.lessonId):null;
 const rec=recommendedFoundationLesson(lessons,ctx.foundationState);
 const pct=s.total?Math.min(100,s.completed/s.total*100):0;
 const date=new Intl.DateTimeFormat('ja-JP',{month:'long',day:'numeric',weekday:'short'}).format(new Date());
 const cats=orderedCategoriesForFoundation(ctx.categories,lessons);
 let actionHtml='';
 if(activeLesson){
  actionHtml=`${button(`レッスンを再開する ${icon('Play')}`,'resume-foundation','primary wide')}<p class="daily-note">${icon('BookOpen')}${esc(activeLesson.title)}</p>`;
 }else if(rec){
  actionHtml=`${button(`${rec.isDue?'復習を始める':'次のレッスンへ'} ${icon('ArrowRight')}`,'start-foundation','primary wide',`data-lesson="${rec.lesson.id}" data-review="${rec.isDue?'1':''}"`)}<p class="daily-note">${icon(rec.isDue?'RotateCcw':'BookOpen')}${esc(rec.lesson.title)}</p>`;
 }else{
  actionHtml=`<a class="btn primary wide" href="#/review">${icon('RotateCcw')}復習リストを開く</a><p class="daily-note">全レッスンを学習しました。復習リストから振り返れます。</p>`;
 }
 return `${modeSelector(ctx.selectedMode)}
 <div class="home-heading"><div><p class="date-label">${date}</p><h1>基礎編</h1><p class="intro">バックエンドの基本を、例から少しずつ。</p></div><span class="heading-book">${icon('BookOpen')}</span></div>
 <div class="home-top"><section class="daily-card"><div class="section-line"><h2>レッスンの進み具合</h2><span class="small-chip">${icon('Clock')}1レッスン 5〜10分</span></div><div class="daily-main"><div class="ring" style="--percent:${pct}"><span>${icon(s.completed>=s.total?'Check':'BookOpen')}</span></div><div><p class="daily-number" id="foundation-progress">${s.completed}<span> / ${s.total} 完了</span></p><p class="muted">${s.completed>=s.total?'全30レッスンを完了しました':s.due?`復習待ちのレッスンが ${s.due}件あります`:'推奨順で一歩ずつ進められます'}</p></div><span class="ring-percent">${Math.round(pct)}<small>%</small></span></div>${actionHtml}</section>
 <div class="home-side"><div class="metric-grid"><div class="metric"><span>${icon('CheckCheck')}今日の学習</span><strong>${s.today}<small>回</small></strong></div><div class="metric"><span>${icon('RotateCcw')}復習待ち</span><strong>${s.due}<small>件</small></strong></div><div class="metric"><span>${icon('Bookmark')}ブックマーク</span><strong>${s.bookmarks}<small>件</small></strong></div></div><div class="panel foundation-guide-card"><h3>学習の進め方</h3><p class="muted">短い説明と具体例を読み、理解を確認したら、自分の言葉で説明してみましょう。正解できなくても完了でき、あとから復習できます。</p><div class="guide-links"><a class="btn secondary" href="#/categories">${icon('LayoutGrid')}24トピックから選ぶ</a><a class="btn secondary" href="#/glossary">${icon('BookOpen')}用語一覧（${ctx.foundation.terms.length}語）</a></div></div></div></div>
 <section><div class="section-line section-space"><h2>推奨順で学ぶ</h2><a class="subtle-link" href="#/categories">すべて見る ${icon('ChevronRight')}</a></div><div class="category-grid">${cats.map(c=>foundationCategoryRow(c,ctx)).join('')}</div></section><div class="offline-note">${icon('CloudOff')}<span>${ctx.offlineLabel}</span></div>`;
}

export function foundationCategories(ctx){
 const lessons=ctx.foundation.lessons;
 const evaluated=latestFoundation(ctx.foundationState.events);
 const cats=orderedCategoriesForFoundation(ctx.categories,lessons);
 return `${header('基礎編のトピック','推奨順を案内しますが、どのトピックからでも学べます。各トピック内のレッスンも自由に選べます。')}<div class="article-tools"><a class="btn secondary" href="#/glossary">${icon('BookOpen')}用語一覧（${ctx.foundation.terms.length}語）</a></div><label class="search">${icon('Search')}<input id="category-search" type="search" placeholder="カテゴリ・トピックを検索" aria-label="カテゴリ・トピックを検索" autocomplete="off"></label><div id="category-results">${cats.map(c=>{const topics=orderedTopicsForFoundation(ctx.topics,lessons,c.id);return `<section class="category-group" data-search="${esc(c.title+' '+topics.map(t=>t.title).join(' '))}">${foundationCategoryRow(c,ctx)}<div class="topic-preview">${topics.map(t=>{const tls=lessons.filter(l=>l.topic===t.id),done=tls.filter(l=>isLessonCompleted(ctx.foundationState,evaluated,l.id)).length;return `<a href="#/topic/${t.id}"><span>${esc(t.title)} <small class="muted">(${done}/${tls.length})</small></span>${icon('ChevronRight')}</a>`;}).join('')}</div></section>`;}).join('')}</div><p id="search-empty" class="muted" hidden>該当するカテゴリ・トピックがありません。</p>`;
}

export function foundationCategory(ctx,id){
 const c=ctx.categories.find(c=>c.id===id);
 if(!c)return empty('Search','カテゴリが見つかりません','一覧から選び直してください。','<a class="btn primary" href="#/categories">カテゴリへ</a>');
 const lessons=ctx.foundation.lessons;
 const evaluated=latestFoundation(ctx.foundationState.events);
 const catLessons=lessons.filter(l=>c.topics.includes(l.topic));
 const done=catLessons.filter(l=>isLessonCompleted(ctx.foundationState,evaluated,l.id)).length;
 const nextLesson=catLessons.find(l=>!isLessonCompleted(ctx.foundationState,evaluated,l.id))||catLessons[0];
 const topics=orderedTopicsForFoundation(ctx.topics,lessons,id);
 return `${header(c.title,c.description,'#/categories')}<section class="category-overview">${categoryIcon(c)}<div><strong>${done}<span> / ${catLessons.length}レッスンを完了</span></strong><p>${c.topics.length}トピック · ${catLessons.length}レッスン（各5〜10分）</p></div></section>${nextLesson?`<div class="action-pair">${button(`${icon('Play')}${esc(nextLesson.title)}を学ぶ`,'start-foundation','primary',`data-lesson="${nextLesson.id}"`)}<a class="btn secondary" href="#/glossary">用語一覧</a></div>`:''}<h2 class="section-space">トピック（推奨順）</h2><div class="topic-list">${topics.map((t,i)=>{const tls=lessons.filter(l=>l.topic===t.id),n=tls.filter(l=>isLessonCompleted(ctx.foundationState,evaluated,l.id)).length;return `<a class="topic-row" href="#/topic/${t.id}"><span class="topic-index">${String(i+1).padStart(2,'0')}</span><div><h3>${esc(t.title)}</h3><span class="muted">${n} / ${tls.length} レッスン · 5〜10分ずつ</span></div>${progress(tls.length?n/tls.length*100:0,c.color)}${icon('ChevronRight')}</a>`;}).join('')}</div>`;
}

export function foundationLessonCards(ctx,topicId){
 const lessons=ctx.foundation.lessons.filter(l=>l.topic===topicId);
 if(!lessons.length)return '';
 const evaluated=latestFoundation(ctx.foundationState.events);
 const scheduled=latestFoundation(ctx.foundationState.events,{scheduled:true});
 const today=dayKey();
 return `<section class="panel foundation-topic-panel"><div class="section-line"><h2>基礎レッスン（${lessons.length}件）</h2><span class="small-chip">${icon('Clock')}5〜10分 / レッスン</span></div><p class="muted">基本概念を具体例で理解し、仕組みを自分の言葉で説明できるようになります。</p><div class="lesson-card-list">${lessons.map((l,i)=>{
  const done=isLessonCompleted(ctx.foundationState,evaluated,l.id);
  const due=scheduled.has(l.id)&&scheduled.get(l.id).due<=today;
  const badge=due?`<span class="lesson-badge due">${icon('RotateCcw')}復習時期</span>`:done?`<span class="lesson-badge done">${icon('CheckCircle2')}学習済み</span>`:`<span class="lesson-badge fresh">未学習</span>`;
  return `<button type="button" class="lesson-card" data-action="start-foundation" data-lesson="${l.id}" data-review="${due?'1':''}" data-practice="${done&&!due?'1':''}"><span class="lesson-index">${String(i+1).padStart(2,'0')}</span><div class="lesson-card-body"><h3>${esc(l.title)}</h3><p>${esc(l.objective)}</p><div class="lesson-meta"><span>5〜10分</span>${badge}</div></div>${icon('ChevronRight')}</button>`;
 }).join('')}</div></section>`;
}

export function foundationStudy(ctx){
 const s=ctx.foundationState.session;
 if(!s)return empty('BookOpen','基礎レッスンを始めましょう','具体例と短いステップで基本概念を身につけます。','<a class="btn primary" href="#/home">ホームへ戻る</a>');
 const lesson=ctx.foundation.lessons.find(l=>l.id===s.lessonId);
 if(!lesson)return empty('Info','レッスンが見つかりません','ホームからレッスンを選び直してください。','<a class="btn primary" href="#/home">ホームへ戻る</a>');
 const t=ctx.topics.find(t=>t.id===lesson.topic);
 const c=ctx.categories.find(c=>c.id===t?.category);
 const bookmarked=ctx.foundationState.bookmarks.includes(lesson.id);
 const stepMeta={
  intro:{label:'まず理解する',pct:25},
  check:{label:'理解を確認する',pct:65},
  reflection:{label:'説明して振り返る',pct:90},
  review:{label:'説明して振り返る（復習）',pct:90},
  done:{label:'完了',pct:100}
 }[s.step]||{label:'基礎レッスン',pct:25};

 if(s.step==='done'){
  const e=ctx.foundationState.events.find(ev=>ev.id===s.lastEvent);
  return `<section class="session-complete"><div class="completion-icon">${icon('CheckCheck')}</div><p class="completion-kicker">FOUNDATION LESSON COMPLETE</p><h1>${s.isReview?'復習できました':'レッスン完了'}</h1><p class="muted">「${esc(lesson.title)}」の学習記録はこの端末に保存されました。<br>${e?.practice?'期限前の自主練習を記録しました。復習予定は変更しません。':e?`次の復習は ${e.interval}日後（${e.due}）です。`:''}</p><section class="panel next-step-panel"><h2>次の一歩</h2><p class="muted">基礎を確認できたら、同じトピックの実践問題で設計判断まで考えてみましょう。</p><div class="dialog-actions">${button(`${icon('Play')}「${esc(t?.title||'このトピック')}」の実践問題を学ぶ`,'foundation-to-practice-topic','secondary wide',`data-topic="${lesson.topic}" data-category="${c?.id||''}"`)}${button(`実践編に切り替える ${icon('ArrowRight')}`,'switch-mode','text-button wide','data-mode="practice"')}</div></section>${button(`${icon('House')}ホームへ戻る`,'foundation-finish','primary wide')}<a class="subtle-link" href="#/topic/${lesson.topic}">トピック詳細・元教材へ戻る</a></section>`;
 }

 let bodyHtml='';
 if(s.step==='intro'){
  bodyHtml=`<div class="question-heading"><p>${esc(t?.title||'')}<span>基礎レッスン</span></p><h1>${esc(lesson.title)}</h1></div>
  <section class="panel"><div class="answer-label">${icon('Target')}このレッスンの目標</div><p>${esc(lesson.objective)}</p></section>
  ${lesson.sections.map(sec=>`<section class="panel"><h2>${esc(sec.title)}</h2><p class="lesson-paragraph">${esc(sec.body)}</p></section>`).join('')}
  <section class="panel example-panel"><div class="answer-label">${icon('Lightbulb')}具体例：${esc(lesson.exampleTitle)}</div><p class="lesson-paragraph">${esc(lesson.example)}</p></section>
  <section class="panel"><h2>仕組みの流れ</h2><ol class="flow-list">${lesson.flow.map((step,idx)=>`<li><span class="flow-num">${idx+1}</span><span>${esc(step)}</span></li>`).join('')}</ol></section>
  <a class="source-link" href="#/topic/${lesson.topic}">${icon('FileText')}出典：${esc(lesson.sourceSection)} · 元教材をオフラインで読む ${icon('ChevronRight')}</a>
  <div class="study-footer">${button(`理解チェックへ ${icon('ArrowRight')}`,'foundation-step','primary wide','data-step="check"')}</div>`;
 }else if(s.step==='check'){
  const chosen=s.selectedChoice;
  const isCorrect=chosen===lesson.check.correct;
  bodyHtml=`<div class="question-heading"><p>${esc(lesson.title)}<span>理解チェック</span></p><h1>${esc(lesson.check.prompt)}</h1></div>
  <div class="choices" role="radiogroup" aria-label="理解チェックの選択肢">${lesson.check.choices.map((opt,i)=>{
   const stateCls=chosen?(opt.id===lesson.check.correct?'correct':opt.id===chosen?'wrong':''):'';
   return `<button type="button" class="choice foundation-choice-btn ${chosen===opt.id?'selected':''} ${stateCls}" data-action="foundation-choice" data-choice="${opt.id}" ${chosen?'disabled':''}><span class="choice-letter">${String.fromCharCode(65+i)}</span><span>${esc(opt.text)}</span></button>`;
  }).join('')}</div>
  ${chosen?`<section class="answer-panel"><div class="answer-label ${isCorrect?'':'warn'}">${icon(isCorrect?'CheckCircle2':'Lightbulb')}${isCorrect?'正解です':'ここを確認しましょう'}</div><p class="lesson-paragraph">${esc(lesson.check.explanation)}</p></section><div class="study-footer">${button(`自分の言葉で説明する ${icon('ArrowRight')}`,'foundation-step','primary wide','data-step="reflection"')}</div>`:''}`;
 }else{
  const scheduled=latestFoundation(ctx.foundationState.events,{scheduled:true}).get(lesson.id);
  const isPractice=s.practice||Boolean(scheduled&&scheduled.due>dayKey());
  bodyHtml=`<div class="question-heading"><p>${esc(lesson.title)}<span>自分の言葉で説明</span></p><h1>${esc(lesson.reflectionPrompt)}</h1></div>
  <div class="thinking-space"><span>${icon('BookOpen')}</span><p>頭の中か声に出して説明してみましょう。</p><small>説明してから要点を確認してください。文章入力は不要です。</small></div>
  ${s.keyPointsRevealed?`<section class="answer-panel"><div class="answer-label">${icon('CheckCircle2')}模範解答</div><p class="lesson-paragraph">${esc(lesson.modelAnswer)}</p><div class="answer-points"><h2>押さえたい要点</h2><ol>${lesson.keyPoints.map(p=>`<li>${esc(p)}</li>`).join('')}</ol></div><a class="source-link" href="#/topic/${lesson.topic}">${icon('FileText')}出典：${esc(lesson.sourceSection)} · 元教材を読む ${icon('ChevronRight')}</a></section>
  <div class="self-evaluation"><p>どこまで説明できましたか？</p><div class="rating-buttons">${button(`${icon('X')}<span>説明できない<small>翌日</small></span>`,'foundation-rate','rating bad','data-rating="0"')}${button(`${icon('MoreHorizontal')}<span>一部説明できる<small>3日後</small></span>`,'foundation-rate','rating partial','data-rating="1"')}${button(`${icon('Check')}<span>説明できる<small>7〜60日後</small></span>`,'foundation-rate','rating good','data-rating="2"')}</div>${isPractice?'<small class="footnote">期限前の自主練習のため、復習予定は変更しません。</small>':''}</div>`:`<div class="study-footer">${button(`要点を見る ${icon('ArrowRight')}`,'foundation-reveal','primary wide')}</div>`}`;
 }

 return `<div class="study-shell"><div class="study-top"><button type="button" class="icon-button" data-action="foundation-back" aria-label="戻る">${icon('ChevronLeft')}</button><div><span>${esc(stepMeta.label)}</span><small>5〜10分 · ${esc(t?.title||'')}</small></div><a class="icon-button" href="#/home" aria-label="閉じてホームへ">${icon('X')}</a></div><div class="study-progress"><span style="width:${stepMeta.pct}%;background:${s.keyPointsRevealed?'var(--purple)':'var(--blue)'}"></span></div><div class="study-meta">${c?`<span class="category-tag" style="--color:${c.color}">${icon(c.icon)}${esc(c.title)}</span>`:'<span></span>'}<button type="button" class="icon-button bookmark ${bookmarked?'saved':''}" data-action="foundation-bookmark" data-lesson="${lesson.id}" aria-label="${bookmarked?'ブックマークを解除':'ブックマークに追加'}" aria-pressed="${bookmarked}">${icon('Bookmark')}</button></div>${bodyHtml}</div>`;
}

export function foundationReview(ctx,filter='due'){
 const lessons=ctx.foundation.lessons;
 const evaluated=latestFoundation(ctx.foundationState.events);
 const scheduled=latestFoundation(ctx.foundationState.events,{scheduled:true});
 const today=dayKey();
 const sets={
  due:l=>scheduled.has(l.id)&&scheduled.get(l.id).due<=today,
  weak:l=>isWeakFoundation(evaluated.get(l.id)),
  bookmarks:l=>ctx.foundationState.bookmarks.includes(l.id),
  all:l=>isLessonCompleted(ctx.foundationState,evaluated,l.id)
 };
 if(!sets[filter])filter='due';
 const items=lessons.filter(sets[filter]);
 const dueCount=lessons.filter(sets.due).length;
 const weakCount=lessons.filter(sets.weak).length;
 const bmCount=lessons.filter(sets.bookmarks).length;
 const allCount=lessons.filter(sets.all).length;
 return `${header(filter==='bookmarks'?'基礎編のブックマーク':'基礎編の復習','レッスン単位で振り返り、自分の言葉で説明できるか確認します。')}<div class="segmented">${[['due',`期限到来 (${dueCount})`],['weak',`苦手 (${weakCount})`],['bookmarks',`保存 (${bmCount})`],['all',`学習済み (${allCount})`]].map(([id,label])=>`<a class="${filter===id?'active':''}" href="#/review/${id}" ${filter===id?'aria-current="page"':''}>${label}</a>`).join('')}</div><div class="section-line"><span class="muted">${items.length}レッスン</span></div>${items.length?`<div class="review-list">${items.map(l=>{
  const t=ctx.topics.find(t=>t.id===l.topic),e=evaluated.get(l.id);
  const isDue=scheduled.has(l.id)&&scheduled.get(l.id).due<=today;
  const practice=filter==='bookmarks'||!isDue;
  return `<button type="button" class="review-row" data-action="start-foundation" data-lesson="${l.id}" data-review="1" data-practice="${practice?'1':''}"><span class="status-dot rating-${e?.rating??'none'}"></span><div><h3>${esc(l.title)}</h3><p>${esc(t?.title||'基礎編')}<span>${e?['説明できない','一部説明できる','説明できる'][e.rating]:'未評価'}</span>${scheduled.has(l.id)?`<span>次回 ${scheduled.get(l.id).due}</span>`:''}</p></div>${icon('ChevronRight')}</button>`;
 }).join('')}</div>`:empty(filter==='bookmarks'?'Bookmark':'CheckCircle2',filter==='bookmarks'?'保存したレッスンはありません':filter==='due'?'今の復習は完了です':filter==='weak'?'苦手なレッスンはありません':'まだ基礎編の学習記録がありません','基礎編の学習を進めると、復習対象がここに表示されます。','<a class="btn secondary" href="#/categories">基礎編のトピックを見る</a>')}`;
}

export function foundationStatistics(ctx){
 const lessons=ctx.foundation.lessons;
 const s=foundationStats(ctx.foundationState,lessons);
 const evaluated=latestFoundation(ctx.foundationState.events);
 const orderedTopics=orderedTopicsForFoundation(ctx.topics,lessons);
 return `${header('基礎編の統計','基本概念の理解と説明の積み重ねを振り返る。')}<div class="stats-cards"><div class="stat-card">${icon('CheckCheck')}<span>完了レッスン</span><strong>${s.completed}<small> / ${s.total}</small></strong><p>復習待ち ${s.due}件</p></div><div class="stat-card">${icon('RotateCcw')}<span>学習回数</span><strong>${s.answers}<small>回</small></strong><p>今日 ${s.today}回</p></div><div class="stat-card">${icon('Flame')}<span>学習日数</span><strong>${s.days}<small>日</small></strong><p>連続 ${s.streak}日</p></div></div><section class="panel"><h2>最新の自己評価</h2><p class="muted">各レッスンの最新評価 · 未学習は含みません</p><div class="distribution">${['説明できない','一部説明できる','説明できる'].map((label,i)=>`<div class="distribution-row"><span class="status-dot rating-${i}"></span><span>${label}</span><strong>${s.ratings[i]}<small>レッスン</small></strong></div>`).join('')}</div></section><section class="panel"><h2>トピック別の進み具合</h2><p class="muted">全24トピックの基礎レッスン完了状況</p><div class="category-stats">${orderedTopics.map(t=>{
  const c=ctx.categories.find(c=>c.id===t.category);
  const tls=lessons.filter(l=>l.topic===t.id);
  const done=tls.filter(l=>isLessonCompleted(ctx.foundationState,evaluated,l.id)).length;
  return `<div><div class="section-line"><a href="#/topic/${t.id}"><i style="background:${c?.color||'var(--blue)'}"></i>${esc(t.title)}</a><strong>${done}<small> / ${tls.length}</small></strong></div>${progress(tls.length?done/tls.length*100:0,c?.color||'var(--blue)')}</div>`;
 }).join('')}</div></section><p class="footnote">基礎編と実践編の学習記録は独立して端末内に保存されます。設定から両モードを含むバックアップを作成できます。</p>`;
}

export function foundationGlossary(ctx){
 const terms=ctx.foundation.terms.slice().sort((a,b)=>a.japanese.localeCompare(b.japanese,'ja'));
 return `${header('用語一覧','基礎編の学習を支える、日本語の定義と一般的な英語名・略語。','#/home')}<label class="search">${icon('Search')}<input id="glossary-search" type="search" placeholder="用語・英語名・説明を検索" aria-label="用語を検索" autocomplete="off"></label><div class="glossary-list" id="glossary-results">${terms.map(term=>{
  const t=ctx.topics.find(t=>t.id===term.topic);
  return `<article class="panel glossary-item" data-search="${esc((term.japanese+' '+(term.english||'')+' '+term.definition+' '+(t?.title||'')).toLocaleLowerCase())}"><div class="glossary-head"><h3>${esc(term.japanese)}</h3>${term.english?`<span class="glossary-en">${esc(term.english)}</span>`:''}</div><p class="muted">${esc(term.definition)}</p>${t?`<a class="glossary-topic" href="#/topic/${t.id}">${icon('BookOpen')}${esc(t.title)} ${icon('ChevronRight')}</a>`:''}</article>`;
 }).join('')}</div><p id="glossary-empty" class="muted" hidden>該当する用語がありません。</p>`;
}
