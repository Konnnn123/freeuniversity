import type {PdfRealignInput} from './pdfSourceAlignment';
import {appRelease} from '../server/app-release.mjs';
import {bookFailure,phaseName} from './bookDiagnostics';
import {uid} from './model';
import type {PdfBook} from './bookStore';
import {chapterNodes,type TocNode} from './pdfStructure';
import {createPdfTeachingDraft,checkPdfTeachingOutline,runPdfTeachingDraft,type PdfLessonRepairInput} from './pdfTeachingEngine';
import type {PdfTeachingDraft,BookTeachingPlan} from './pdfTeachingTypes';
import {outlineSourceSlots,bindOutlineSourceSlot,slotOutlineCandidates,type OutlineSourceSlot} from './outlineSourceSlots';
export function startBookTeaching(b:PdfBook,preferences:Pick<BookTeachingPlan,'instruction'|'level'|'minutes'>){const nodes=chapterNodes(b.structure!);if(!nodes.length)throw new Error('请先读取原书目录');b.teachingCourse={nodeIds:nodes.filter(n=>n.start!==null&&n.end!==null).map(n=>n.id),unresolved:nodes.filter(n=>n.start===null||n.end===null).map(n=>n.id),createdAt:new Date().toISOString(),...preferences,status:'paused',stage:'课程大纲待准备',errors:{}};if(!b.teachingCourse.nodeIds.length)throw new Error('请先确认章节页码');return b.teachingCourse}
export async function runPdfChapterOutline(p:PdfTeachingDraft,request:(input:{segments:PdfTeachingDraft['segments'];sourceSlots:OutlineSourceSlot[];part:number;total:number;repair?:boolean})=>Promise<unknown>,persist:()=>Promise<void>,signal?:AbortSignal,maxSlots=8){
 if(!Number.isInteger(maxSlots)||maxSlots<1||maxSlots>8)throw new Error('原文分组批次应为1至8组');if(p.outline)return;p.outlineParts??=[];p.outlineSlots??={};const stop=()=>{if(signal?.aborted)throw new DOMException('已暂停','AbortError')};const total=Math.ceil(p.segments.length/16);parts:for(let part=p.outlineParts.length;part<total;part++){stop();const segments=p.segments.slice(part*16,(part+1)*16),slots=outlineSourceSlots(segments),key=(slot:number)=>part+':'+slot,pending=slots.filter(s=>!p.outlineSlots![key(s.slot)]);
 for(let offset=0;offset<pending.length;offset+=maxSlots){stop();const batch=pending.slice(offset,offset+maxSlots);const raw=await request({segments:batch.flatMap(s=>s.segments),sourceSlots:batch,part,total});
 // Accept previously supported, fully valid outputs without rerunning a chapter.
 if(batch.length===slots.length){let valid:ReturnType<typeof checkPdfTeachingOutline>|undefined;try{valid=checkPdfTeachingOutline(raw,{...p,segments})}catch{/* Bind fixed source slots below. */}if(valid){p.outlineParts.push(valid);await persist();continue parts}}
 const candidates=slotOutlineCandidates(raw,batch);for(const slot of batch){try{const value=candidates.get(slot.slot);if(value)p.outlineSlots[key(slot.slot)]=bindOutlineSourceSlot(value,slot,p)}catch{/* Only this source group will be retried. */}}await persist();
 // At most one targeted attempt per missing group; never rerun valid groups.
 for(const slot of batch.filter(s=>!p.outlineSlots![key(s.slot)])){stop();const repaired=await request({segments:slot.segments,sourceSlots:[slot],part,total,repair:true});p.outlineSlots[key(slot.slot)]=bindOutlineSourceSlot(repaired,slot,p);await persist()}
 }
 const rows=slots.map(s=>p.outlineSlots![key(s.slot)]);p.outlineParts.push(checkPdfTeachingOutline({title:rows[0].title,intro:rows[0].intro,lessons:rows.flatMap(v=>v.lessons)},{...p,segments}));await persist();}
 p.outline=checkPdfTeachingOutline({title:p.outlineParts[0].title,intro:p.outlineParts[0].intro,lessons:p.outlineParts.flatMap(v=>v.lessons)},p);await persist();
}
export function bookTeachingProgress(b:PdfBook){const ids=b.teachingCourse?.nodeIds||[];return {total:ids.length,outlined:ids.filter(id=>b.teachingDrafts?.[id]?.outline).length,lessons:ids.reduce((sum,id)=>sum+(b.teachingDrafts?.[id]?.outline?.lessons.length||0),0),ready:ids.reduce((sum,id)=>sum+(b.teachingDrafts?.[id]?.lessons.length||0),0)}}
export async function runBookTeaching(b:PdfBook,mode:'outline'|'lessons',deps:{persist:()=>Promise<void>;ensurePages:(node:TocNode)=>Promise<void>;outline:(p:PdfTeachingDraft,node:TocNode)=>Promise<void>;lesson:(p:PdfTeachingDraft,index:number,text:string)=>Promise<unknown>;realign?:(p:PdfTeachingDraft,input:PdfRealignInput)=>Promise<unknown>;repair?:(p:PdfTeachingDraft,input:PdfLessonRepairInput)=>Promise<unknown>;committed?:(p:PdfTeachingDraft)=>void;failure?:(failure:import('./pdfTeachingTypes').BookTeachingFailure)=>Promise<void>;progress:(s:string)=>void},signal?:AbortSignal,onlyNodeId?:string){
 const plan=b.teachingCourse;if(!plan)throw new Error('请先建立完整课程大纲');
 plan.run={id:uid(),release:appRelease,startedAt:new Date().toISOString()};plan.errorDetails={};plan.lastMode=mode;plan.status='running';plan.errors={};b.teachingDrafts??={};await deps.persist();
 try{
  for(const [index,id] of plan.nodeIds.entries()){
   if(onlyNodeId&&id!==onlyNodeId)continue;
   if(signal?.aborted)throw new DOMException('已暂停','AbortError');
   const node=b.structure!.nodes.find(n=>n.id===id)!;
   let phase:import('./pdfTeachingTypes').BookTeachingFailure['phase']='source',lessonIndex:number|undefined;
   plan.stage=`${mode==='outline'?'整理大纲':'准备课时'} ${index+1}/${plan.nodeIds.length} · ${node.title}`;deps.progress(plan.stage);
   try{
    let p=b.teachingDrafts[id];if(!p){await deps.ensurePages(node);if(signal?.aborted)throw new DOMException('已暂停','AbortError');p=createPdfTeachingDraft(b,id,plan);b.teachingDrafts[id]=p;await deps.persist()}
    phase='outline';await deps.outline(p,node);
    if(mode==='lessons'){
     phase='lesson';lessonIndex=p.lessons.length;
     await runPdfTeachingDraft(p,{
      request:async(i,text)=>{phase='lesson';lessonIndex=i;plan.stage=node.title+' · 课时 '+(i+1)+'/'+p.outline!.lessons.length;deps.progress(plan.stage);return deps.lesson(p,i,text)},
      realign:deps.realign?input=>{phase='align';lessonIndex=input.index;plan.stage=node.title+' · 核对并调整第 '+(input.index+1)+' 课的原文课题';deps.progress(plan.stage);return deps.realign!(p,input)}:undefined,
      repair:deps.repair?input=>{phase='repair';lessonIndex=input.index;plan.stage=node.title+' · 补修第 '+(input.index+1)+' 课（保留已生成讲解）';deps.progress(plan.stage);return deps.repair!(p,input)}:undefined,
      persist:deps.persist
     },signal);
     phase='commit';lessonIndex=undefined;deps.committed?.(p);
    }
   }catch(e){
    if((e as Error).name==='AbortError')throw e;
    const detail=bookFailure(e,phase,plan.run.id,lessonIndex);plan.errorDetails[id]=detail;
    const title=lessonIndex===undefined?'':'第'+(lessonIndex+1)+'课「'+(b.teachingDrafts[id]?.outline?.lessons[lessonIndex]?.title||'未完成课时')+'」 · ';
    plan.errors[id]=title+phaseName[phase]+'：'+(e as Error).message;await deps.persist();
    try{await deps.failure?.(detail)}catch{/* Diagnostics must not replace the real failure. */}
    if(/401|402|invalid_api_key|insufficient_balance|client_update_required/.test((e as {code?:string}).code||''))throw e;
   }
  }
  plan.status=Object.keys(plan.errors).length||plan.unresolved.length?'issues':'completed';const stats=bookTeachingProgress(b);plan.stage=mode==='outline'?(stats.outlined===stats.total?'完整课程大纲已保存':`已保存 ${stats.outlined}/${stats.total} 章大纲，未完成部分可继续`):`已备好 ${stats.ready}/${stats.lessons} 课，进度已保存`;await deps.persist();
 }catch(e){plan.status='paused';plan.stage='已暂停，完成部分已保存';await deps.persist();throw e}
}
