import type {Data} from './model';
import {uid} from './model';
import type {Lesson} from './lessonTypes';
import type {ReadingAnnotation,ReadingField,ReadingPhase,ReadingState} from './readingTypes';
import {finishMaterialStudy} from './labEngine';
import {anchorAnnotation,readingDocument} from './readingDocument';
export const readingPhases:ReadingPhase[]=['question','explanation','practice'];
export function readingState(l:Lesson):ReadingState{return l.readingState||{active:'question',phases:l.status==='已完成'?{question:'done',explanation:'done',practice:'done'}:{}}}
export function readingProgress(l:Lesson){const state=readingState(l);return readingPhases.filter(p=>!!state.phases[p]).length}
export function settleReadingPhase(data:Data,id:string,phase:ReadingPhase,skip=false){
 let d=structuredClone(data);const l=d.lessons?.find(l=>l.id===id);if(!l)throw new Error('课时不存在');
 l.readingState=structuredClone(readingState(l));l.readingState.phases[phase]=skip?'skipped':'done';l.readingState.active=readingPhases[Math.min(2,readingPhases.indexOf(phase)+1)];
 if(l.status==='未开始')l.status='学习中';
 if(readingProgress(l)===3&&l.status!=='已完成'&&!l.readingState.completionLogId){
 d=finishMaterialStudy(d,id,{summary:'完成课时：'+l.title,minutes:0,complete:true,mastered:false});const row=d.lessons!.find(x=>x.id===id)!;row.readingState!.completionLogId=d.logs[0].id;
 }return d;
}
export function addReadingAnnotation(l:Pick<Lesson,'annotations'>,input:{field:ReadingField;source:string;start:number;end:number;style:ReadingAnnotation['style'];color:ReadingAnnotation['color'];comment?:string}){
 const {text}=readingDocument(input.source),quote=text.slice(input.start,input.end);if(!Number.isInteger(input.start)||!Number.isInteger(input.end)||input.start<0||input.end>text.length||!quote.trim()||quote.length>5000)throw new Error('请重新选择一段正文');
 l.annotations??=[];const existing=l.annotations.find(a=>a.field===input.field&&a.start===input.start&&a.end===input.end&&a.quote===quote);if(existing){existing.style=input.style;existing.color=input.color;if(input.comment!==undefined)existing.comment=input.comment.slice(0,5000);return existing.id}
 const a:ReadingAnnotation={id:uid(),field:input.field,start:input.start,end:input.end,quote,prefix:text.slice(Math.max(0,input.start-24),input.start),suffix:text.slice(input.end,input.end+24),style:input.style,color:input.color,comment:(input.comment||'').slice(0,5000),createdAt:new Date().toISOString()};l.annotations.push(a);return a.id;
}
export function annotationNotes(l:Lesson){return (l.annotations||[]).map(a=>'「'+a.quote+'」'+(a.comment?'\n评论：'+a.comment:'')).join('\n\n')}
export function annotationsInSelection(l:Lesson,selection:{field:ReadingField;source:string;start:number;end:number}){const text=readingDocument(selection.source).text;return (l.annotations||[]).filter(a=>{if(a.field!==selection.field)return false;const range=anchorAnnotation(text,a);return !!range&&range.start<selection.end&&range.end>selection.start})}
export function removeReadingAnnotations(l:Pick<Lesson,'annotations'>,ids:string[]){const targets=new Set(ids),removed=(l.annotations||[]).filter(a=>targets.has(a.id));l.annotations=l.annotations?.filter(a=>!targets.has(a.id));return structuredClone(removed)}
export function restoreReadingAnnotations(l:Pick<Lesson,'annotations'>,removed:ReadingAnnotation[],originalOrder:string[]){const current=l.annotations||[],byId=new Map(current.map(a=>[a.id,a]));for(const a of removed)if(!byId.has(a.id))byId.set(a.id,structuredClone(a));const ids=[...new Set([...originalOrder,...current.map(a=>a.id),...removed.map(a=>a.id)])];l.annotations=ids.flatMap(id=>{const a=byId.get(id);return a?[a]:[]})}
