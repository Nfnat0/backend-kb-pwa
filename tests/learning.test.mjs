import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {schedule,selectQuestions,makeSession,answer,nextQuestion,stats,addDays} from '../src/engine.js';
import {emptyState,validateState,exportBackup,readBackup} from '../src/store.js';
const content=JSON.parse(readFileSync(new URL('../src/data/content.json',import.meta.url),'utf8'));
test('review interval advances, caps, resets, and crosses month boundaries',()=>{
 let p;for(const days of [7,14,30,60,60]){p=schedule(p,2,'2026-01-28');assert.equal(p.interval,days);}
 assert.equal(schedule(p,0,'2026-01-31').due,'2026-02-01');
 assert.equal(schedule(schedule(p,1,'2026-01-28'),2,'2026-01-28').interval,7);
 assert.equal(addDays('2028-02-28',1),'2028-02-29');
});
test('due questions precede fresh questions, future questions are excluded',()=>{
 const qs=content.questions.slice(0,5);const state=emptyState();state.events=[{question:qs[0].id,due:'2026-09-26'},{question:qs[1].id,due:'2026-09-20'},{question:qs[2].id,due:'2026-09-21'}];
 assert.deepEqual(selectQuestions(qs,state,{today:'2026-09-23'}),[qs[1].id,qs[2].id,qs[3].id,qs[4].id]);
});
test('10-question session persists evaluations and choice correctness independently',()=>{
 const state=emptyState();const qs=content.questions.slice(0,10);state.session=makeSession(qs.map(q=>q.id));
 for(const q of qs){state.session.phase='answer';if(q.type==='choice')state.session.selected=q.correct;answer(state,q,2,new Date('2026-09-23T12:00:00'));assert.throws(()=>answer(state,q,2));nextQuestion(state);}
 assert.equal(state.session.phase,'done');assert.equal(state.events.length,10);assert.equal(stats(state,qs,'2026-09-23').accuracy,100);assert.deepEqual(stats(state,qs).ratings,[0,0,8]);
 assert.deepEqual(readBackup(exportBackup(state)).state,validateState(state));
});
test('early practice records feedback without changing due date or interval',()=>{
 const state=emptyState(),q=content.questions[0];state.session=makeSession([q.id]);state.session.phase='answer';const first=answer(state,q,2,new Date('2026-09-23T12:00:00'));
 state.session=makeSession([q.id]);state.session.phase='answer';const second=answer(state,q,0,new Date('2026-09-24T12:00:00'));
 assert.equal(second.practice,true);assert.equal(second.due,first.due);assert.equal(second.interval,7);
 state.session=makeSession([q.id]);state.session.phase='answer';assert.equal(answer(state,q,2,new Date('2026-09-30T12:00:00')).interval,14);
});
test('malformed backup cannot replace records',()=>{
 assert.throws(()=>readBackup('{"app":"other"}'));
 const s=emptyState();s.settings.size=999;assert.throws(()=>validateState(s));
 s.settings.size=10;s.events=[{id:'bad'}];assert.throws(()=>validateState(s));
});
test('content has full provenance, unique questions, all original chapters and diagrams',()=>{
 assert.equal(content.questions.length,120);assert.equal(new Set(content.questions.map(q=>q.id)).size,120);
 let diagrams=0;
 for(const t of content.topics){const original=readFileSync(new URL(`../public/materials/${t.id}.md`,import.meta.url),'utf8').replace(/^---\n[\s\S]*?\n---\n/,'').trim();assert.equal(t.markdown,original);assert.equal((t.markdown.match(/^## /gm)||[]).length,11);diagrams+=(t.markdown.match(/```mermaid/g)||[]).length;
 const qs=content.questions.filter(q=>q.topic===t.id);assert.equal(qs.filter(q=>q.type==='explain').length,4);assert.equal(qs.filter(q=>q.type==='choice').length,1);
 for(const q of qs){assert.ok(q.prompt.length>10&&q.summary.length>20&&q.detail.length>30);assert.equal(q.source,t.url);if(q.type==='choice')assert.equal(q.choices.filter(o=>o.id===q.correct).length,1);}}
 assert.equal(diagrams,28);
});
test('historical answers remain in lifetime choice accuracy after a content revision',()=>{
 const s=emptyState();s.events=[{question:'retired-question',type:'choice',correct:false,day:'2026-09-23'}];
 const result=stats(s,content.questions,'2026-09-23');assert.equal(result.accuracy,0);assert.equal(result.choiceTotal,1);assert.equal(result.learned,0);assert.equal(result.today,1);
});
