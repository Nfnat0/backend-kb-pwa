export const INTERVALS=[7,14,30,60];
export function dayKey(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
export function addDays(day,n){const [y,m,d]=day.split('-').map(Number);return dayKey(new Date(y,m-1,d+n,12));}
export function schedule(previous,rating,today=dayKey()){
 const interval=rating===0?1:rating===1?3:INTERVALS[Math.min(previous?.rating===2?Math.max(0,INTERVALS.indexOf(previous.interval))+1:0,3)];
 return {rating,interval,due:addDays(today,interval)};
}
export function latest(events,{scheduled=false}={}){
 const map=new Map();for(const e of events)if(!scheduled||!e.practice)map.set(e.question,e);return map;
}
export function isWeak(e){return Boolean(e&&(e.type==='choice'?!e.correct:e.rating<2));}
export function selectQuestions(questions,state,{category='',topic='',practice=false,today=dayKey()}={}){
 const past=latest(state.events,{scheduled:true});
 const scoped=questions.filter(q=>(!category||q.category===category)&&(!topic||q.topic===topic));
 const due=scoped.filter(q=>past.has(q.id)&&past.get(q.id).due<=today).sort((a,b)=>past.get(a.id).due.localeCompare(past.get(b.id).due));
 const fresh=scoped.filter(q=>!past.has(q.id));
 const result=practice?scoped:[...due,...fresh];
 return result.slice(0,state.settings.size).map(q=>q.id);
}
export function makeSession(ids,{category='',topic='',practice=false}={}){
 return {id:crypto.randomUUID(),pending:ids,completed:[],total:ids.length,category,topic,practice,phase:'question',selected:null,startedAt:new Date().toISOString()};
}
export function answer(state,q,rating,now=new Date()){
 const s=state.session;if(!s||s.pending[0]!==q.id||s.phase!=='answer')throw Error('回答状態を確認してください。');
 const previous=latest(state.events,{scheduled:true}).get(q.id);const day=dayKey(now);
 const practice=s.practice||Boolean(previous&&previous.due>day);
 const correct=q.type==='choice'?s.selected===q.correct:null;
 const resultRating=q.type==='choice'?(correct?2:0):rating;
 if(![0,1,2].includes(resultRating))throw Error('評価を選んでください。');
 const next=practice?(previous?{due:previous.due,interval:previous.interval}: {due:day,interval:0}):schedule(previous,resultRating,day);
 const event={id:crypto.randomUUID(),question:q.id,type:q.type,topic:q.topic,rating:resultRating,correct,choice:q.type==='choice'?s.selected:null,at:now.toISOString(),day,practice,...next};
 state.events.push(event);s.completed.push(event.id);s.phase='feedback';s.lastEvent=event.id;return event;
}
export function nextQuestion(state){const s=state.session;s.pending.shift();s.phase=s.pending.length?'question':'done';s.selected=null;delete s.lastEvent;}
export function stats(state,questions,today=dayKey()){
 const ids=new Set(questions.map(q=>q.id));const events=state.events.filter(e=>ids.has(e.question));const evaluated=latest(events);const scheduled=latest(events,{scheduled:true});
 const choice=state.events.filter(e=>e.type==='choice');const explain=[...evaluated.values()].filter(e=>e.type==='explain');
 const days=new Set(state.events.map(e=>e.day));let cursor=days.has(today)?today:addDays(today,-1),streak=0;
 while(days.has(cursor)){streak++;cursor=addDays(cursor,-1);}
 return {answers:state.events.length,learned:evaluated.size,today:state.events.filter(e=>e.day===today).length,days:days.size,streak,due:[...scheduled.values()].filter(e=>e.due<=today).length,choiceTotal:choice.length,accuracy:choice.length?Math.round(choice.filter(e=>e.correct).length/choice.length*100):null,ratings:[0,1,2].map(r=>explain.filter(e=>e.rating===r).length)};
}
export function scheduleFoundation(previous,rating,correct=true,today=dayKey()){
 const advance=rating===2&&correct!==false;
 const prevAdvance=previous&&previous.rating===2&&previous.correct!==false;
 const interval=correct===false||rating===0?1:rating===1?3:INTERVALS[Math.min(prevAdvance?Math.max(0,INTERVALS.indexOf(previous.interval))+1:0,3)];
 return {rating,interval,due:addDays(today,interval),streakReset:!advance};
}
export function latestFoundation(events,{scheduled=false}={}){
 const map=new Map();for(const e of events)if(!scheduled||!e.practice)map.set(e.lesson,e);return map;
}
export function isWeakFoundation(e){return Boolean(e&&(e.rating<2||e.correct===false));}
export function dueFoundationLessons(lessons,foundationState,today=dayKey()){
 const scheduled=latestFoundation(foundationState.events,{scheduled:true});
 return lessons.filter(l=>scheduled.has(l.id)&&scheduled.get(l.id).due<=today).sort((a,b)=>scheduled.get(a.id).due.localeCompare(scheduled.get(b.id).due));
}
export function recommendedFoundationLesson(lessons,foundationState,today=dayKey()){
 const due=dueFoundationLessons(lessons,foundationState,today);
 if(due.length)return {lesson:due[0],isDue:true};
 const evaluated=latestFoundation(foundationState.events);
 const next=lessons.find(l=>!foundationState.completedAt[l.id]&&!evaluated.has(l.id));
 return next?{lesson:next,isDue:false}:null;
}
export function makeFoundationSession(lessonId,{review=false,practice=false}={}){
 return {id:crypto.randomUUID(),lessonId,step:review?'review':'intro',selectedChoice:null,keyPointsRevealed:false,isReview:review,practice,startedAt:new Date().toISOString(),lastEvent:null};
}
export function answerFoundation(foundationState,lesson,rating,now=new Date()){
 const s=foundationState.session;if(!s||s.lessonId!==lesson.id||!['reflection','review'].includes(s.step)||!s.keyPointsRevealed)throw Error('レッスンの進行状態を確認してください。');
 if(![0,1,2].includes(rating))throw Error('評価を選んでください。');
 const previous=latestFoundation(foundationState.events,{scheduled:true}).get(lesson.id);const day=dayKey(now);
 const practice=s.practice||Boolean(previous&&previous.due>day);
 const correct=s.isReview?null:s.selectedChoice===lesson.check.correct;
 const next=practice?(previous?{due:previous.due,interval:previous.interval}:{due:day,interval:0}):scheduleFoundation(previous,rating,correct,day);
 const event={id:crypto.randomUUID(),lesson:lesson.id,topic:lesson.topic,rating,correct,choice:s.isReview?null:s.selectedChoice,practice,day,due:next.due,interval:next.interval,at:now.toISOString()};
 foundationState.events.push(event);
 foundationState.completedAt[lesson.id]=now.toISOString();
 s.step='done';s.lastEvent=event.id;return event;
}
export function foundationStats(foundationState,lessons,today=dayKey()){
 const ids=new Set(lessons.map(l=>l.id));const events=foundationState.events.filter(e=>ids.has(e.lesson));
 const evaluated=latestFoundation(events);const scheduled=latestFoundation(events,{scheduled:true});
 const completed=lessons.filter(l=>Boolean(foundationState.completedAt[l.id])||evaluated.has(l.id)).length;
 const days=new Set(foundationState.events.map(e=>e.day));let cursor=days.has(today)?today:addDays(today,-1),streak=0;
 while(days.has(cursor)){streak++;cursor=addDays(cursor,-1);}
 return {
  answers:foundationState.events.length,
  completed,
  total:lessons.length,
  today:foundationState.events.filter(e=>e.day===today).length,
  days:days.size,
  streak,
  due:[...scheduled.values()].filter(e=>e.due<=today).length,
  weak:lessons.filter(l=>isWeakFoundation(evaluated.get(l.id))).length,
  bookmarks:foundationState.bookmarks.filter(id=>ids.has(id)).length,
  ratings:[0,1,2].map(r=>[...evaluated.values()].filter(e=>e.rating===r).length)
 };
}

