import {checkPdfRealignment,savePdfRealignment,type PdfRealignInput} from './pdfSourceAlignment';
import {checkLessonContent,generatedPdfLesson,LessonContractError,repairFields,mergeLessonRepair,type LessonIssue} from './lessonContract';
import {outlineSourceSlots} from './sourceGroups';
import type {Data} from './model';
import {uid} from './model';
import {buildBookChunks,type PdfBook} from './bookStore';
import {addMaterial,attachMaterialUnit} from './labEngine';
import {blankLesson,saveLesson} from './lessonEngine';
import {courseFromBook} from './bookCourse';
import type {ShortLesson,MaterialAnalysis} from './labTypes';
import type {PdfTeachingDraft,PdfTeachingOutline} from './pdfTeachingTypes';
const str=(v:unknown,max=500)=>typeof v==='string'&&v.trim().length>0&&v.length<=max;
export function linkPdfClassroomRoute(d:Data,courseId:string){const rows=(d.lessons||[]).filter(l=>l.courseId===courseId&&!l.bookId&&!l.archivedFromClassroom).sort((a,b)=>(a.pdfTeachingPlan?.chapterOrder??100000)-(b.pdfTeachingPlan?.chapterOrder??100000)||(a.pdfTeachingPlan?.index??a.order)-(b.pdfTeachingPlan?.index??b.order));const offset=d.lessons!.filter(l=>l.courseId===courseId&&l.bookId).length;rows.forEach((l,i)=>{l.order=offset+i;l.nextLessonId=rows[i+1]?.id||''})}
export function syncPdfCourseOutline(d:Data,b:PdfBook){const plan=b.teachingCourse;if(!plan||plan.nodeIds.some(id=>!b.teachingDrafts?.[id]?.outline))throw new Error('请先备齐完整课程大纲');const courseId=courseFromBook(d,b),course=d.courses.find(c=>c.id===courseId)!;
 for(const l of d.lessons||[]){const m=d.readingLab?.materials.find(m=>m.id===l.labMaterialId&&m.sourceFile?.bookId===b.id&&m.pdfTeaching);if(m?.pdfTeaching&&(!plan.nodeIds.includes(m.pdfTeaching.nodeId)||b.teachingDrafts?.[m.pdfTeaching.nodeId]?.id!==m.pdfTeaching.draftId))l.archivedFromClassroom=true}
 for(const [chapterOrder,nodeId]of plan.nodeIds.entries()){const p=b.teachingDrafts![nodeId];for(const old of d.lessons||[])if(old.pdfTeachingPlan?.bookId===b.id&&old.pdfTeachingPlan.nodeId===nodeId&&old.pdfTeachingPlan.draftId!==p.id)old.archivedFromClassroom=true;const materials=d.readingLab?.materials.filter(m=>m.pdfTeaching?.draftId===p.id&&m.sourceFile?.bookId===b.id)||[],old=d.lessons?.find(l=>l.pdfTeachingPlan?.draftId===p.id||materials.some(m=>m.id===l.labMaterialId));const unitId=old?.unitId||uid();if(!old)d.units.push({id:unitId,courseId,name:p.outline!.title});else{const unit=d.units.find(u=>u.id===unitId)!;unit.name=unit.name.replace(/ · 新版试读$/,'')}
 p.outline!.lessons.forEach((spec,index)=>{let l=d.lessons?.find(l=>l.pdfTeachingPlan?.draftId===p.id&&l.pdfTeachingPlan.index===index||materials.some(m=>m.pdfTeaching!.index===index&&m.id===l.labMaterialId));if(!l){l=blankLesson(course,unitId,d.lessons!.filter(l=>l.courseId===courseId).length);l.title=spec.title;l.description=spec.question;l.objectives=[spec.focus];l.minutes=p.minutes;l.difficulty=p.level;l.mode='阅读学习';saveLesson(d,l)}l.pdfTeachingPlan={bookId:b.id,nodeId,draftId:p.id,index,chapterOrder}});
 }linkPdfClassroomRoute(d,courseId);return courseId;
}
export function createPdfTeachingDraft(b:PdfBook,nodeId:string,input:{instruction:string;level:string;minutes:number}):PdfTeachingDraft{
 const n=b.structure?.nodes.find(n=>n.id===nodeId);if(!n||n.start===null||n.end===null)throw new Error('请先确认原书章节页码');
 const pages=b.pages.filter(p=>p.page>=n.start!&&p.page<=n.end!);if(pages.length!==n.end-n.start+1)throw new Error('本章原文尚未提取完整，请先在原书页面准备本章资料');
 const segments=buildBookChunks(pages,9000);if(!segments.length)throw new Error('本章没有可读文字，请先提供文字版或完成 OCR');if(segments.length>256)throw new Error('这一章文字过多，请先确认目录范围或分成小节');
 if(!str(input.level,200)||!Number.isInteger(input.minutes)||input.minutes<5||input.minutes>60||input.instruction.length>1000)throw new Error('请确认学习基础和每课时长（5–60分钟）');
 return {id:uid(),nodeId,createdAt:new Date().toISOString(),...input,segments,lessons:[]};
}
export function teachingInput(draft:PdfTeachingDraft,index:number){const l=draft.outline?.lessons[index];if(!l)throw new Error('尚未确认本课大纲');return l.segmentIds.map(id=>draft.segments.find(s=>s.id===id)!.text).join('\n\n')}
export function teachingPages(draft:PdfTeachingDraft,index:number){return [...new Set(draft.outline!.lessons[index].segmentIds.flatMap(id=>{const s=draft.segments.find(s=>s.id===id)!;return Array.from({length:s.to-s.from+1},(_,i)=>s.from+i)}))].sort((a,b)=>a-b)}
export function checkPdfTeachingOutline(value:unknown,draft:PdfTeachingDraft):PdfTeachingOutline{
 const v=value as PdfTeachingOutline,known=new Set(draft.segments.map(s=>s.id));
 if(!v||!str(v.title,150)||!str(v.intro,600)||!Array.isArray(v.lessons)||v.lessons.length<1||v.lessons.length>256)throw new Error('课程大纲需包含完整的小课');
 const used=new Set<string>();for(const l of v.lessons){if(!str(l.title,150)||!str(l.question)||!str(l.focus,1000)||!Array.isArray(l.segmentIds)||!l.segmentIds.length||l.segmentIds.length>2||new Set(l.segmentIds).size!==l.segmentIds.length||l.segmentIds.some(id=>!known.has(id)))throw new Error('小课引用了无效的原文片段，请重新整理大纲');l.segmentIds.forEach(id=>used.add(id));const text=l.segmentIds.map(id=>draft.segments.find(s=>s.id===id)!.text).join('\n\n');if(text.trim().length<40)throw new Error('这一课原文过短，请与相邻内容合并后再备课');if(text.length>22000)throw new Error('单课原文过长，需要进一步拆课')}
 if(used.size!==known.size)throw new Error('大纲遗漏了本章原文片段，请重新整理，原内容保留');return structuredClone(v);
}
function analysis(lesson:ShortLesson,summary:string):MaterialAnalysis{return {summary,highlights:[],concepts:[],lessons:[lesson],expressions:[],report:'可选：挑一个本课的判断，写下你的理解和仍想追问的问题。'}}
export function checkPdfTeachingLesson(value:unknown,draft:PdfTeachingDraft,index:number):ShortLesson{return generatedPdfLesson(value,teachingInput(draft,index),draft.outline!.lessons[index])}
export interface PdfLessonRepairInput {index:number;text:string;value:unknown;issues:LessonIssue[];fields:string[]}
export async function runPdfTeachingDraft(p:PdfTeachingDraft,deps:{request:(index:number,text:string)=>Promise<unknown>;realign?:(input:PdfRealignInput)=>Promise<unknown>;repair?:(input:PdfLessonRepairInput)=>Promise<unknown>;persist:()=>Promise<void>},signal?:AbortSignal){
 if(!p.outline)throw new Error('请先确认小课大纲');checkPdfTeachingOutline(p.outline,p);const stop=()=>{if(signal?.aborted)throw new DOMException('已暂停','AbortError')};p.lessonDrafts??={};
 for(let i=p.lessons.length;i<p.outline.lessons.length;i++){
  stop();const old=p.lessonDrafts[i],oldValue=old?.value as {usable?:boolean}|undefined,text=teachingInput(p,i);
  // A saved source refusal is diagnostic input for realignment. Repeating the
  // identical lesson request cannot repair its unsupported outline.
  let raw=old&&old.value&&typeof old.value==='object'&&!Array.isArray(old.value)&&(oldValue?.usable!==false||deps.realign)?old.value:await deps.request(i,text),lesson:ShortLesson|undefined,realigned=false;
  const retain=async(issues:LessonIssue[])=>{if(JSON.stringify(raw??null).length>60000)throw new Error('本课响应过大，请调整当前课时范围；已完成内容保留');p.lessonDrafts![i]={value:structuredClone(raw??null),issues,createdAt:old?.createdAt||new Date().toISOString(),attempts:p.lessonDrafts![i]?.attempts||0};await deps.persist()};
  while(!lesson){
   try{lesson=checkPdfTeachingLesson(raw,p,i)}catch(e){
    if(!(e instanceof LessonContractError))throw e;await retain(e.issues);
    const refused=raw as {usable?:boolean;reason?:string};
    if(refused?.usable===false&&deps.realign&&!realigned){
     stop();realigned=true;const reason=typeof refused.reason==='string'?refused.reason:'当前课题未能由所给原文支持';
     const revised=await deps.realign({index:i,text,reason,previous:structuredClone(p.outline.lessons[i])});stop();
     savePdfRealignment(p,i,revised,text,reason);await deps.persist();stop();
     raw=await deps.request(i,text);continue;
    }
    const fields=repairFields(e.issues);
    if(deps.repair&&fields.length){
     stop();p.lessonDrafts[i].attempts++;await deps.persist();
     try{const patched=await deps.repair({index:i,text,value:raw,issues:e.issues,fields});raw=mergeLessonRepair(raw,patched,fields);lesson=checkPdfTeachingLesson(raw,p,i)}
     catch(repairError){if(repairError instanceof LessonContractError){await retain(repairError.issues);throw new LessonContractError(repairError.issues.map(x=>({...x,reason:x.reason+'（本次补修未通过，收到的讲解已保留）'})))}throw repairError}
    }else throw e;
   }
  }
  p.lessons.push(lesson);delete p.lessonDrafts[i];await deps.persist();
 }
}
export function validatePdfTeaching(b:PdfBook){if(b.teachingCourse){const p=b.teachingCourse,known=(id:string)=>b.structure?.nodes.some(n=>n.id===id);if(!Array.isArray(p.nodeIds)||!p.nodeIds.length||new Set(p.nodeIds).size!==p.nodeIds.length||p.nodeIds.some(id=>!known(id))||!Array.isArray(p.unresolved)||p.unresolved.some(id=>!known(id))||typeof p.createdAt!=='string'||typeof p.instruction!=='string'||p.instruction.length>1000||!str(p.level,200)||!Number.isInteger(p.minutes)||p.minutes<5||p.minutes>60||!['paused','running','completed','issues'].includes(p.status)||typeof p.stage!=='string'||(p.lastMode!==undefined&&!['outline','lessons'].includes(p.lastMode))||!p.errors||typeof p.errors!=='object'||Object.entries(p.errors).some(([id,v])=>!known(id)||typeof v!=='string'))throw new Error('完整课程进度存档有误')}if(!b.teachingDrafts)return;if(typeof b.teachingDrafts!=='object'||Array.isArray(b.teachingDrafts))throw new Error('新版小课存档格式有误');for(const [id,p]of Object.entries(b.teachingDrafts)){const n=b.structure?.nodes.find(n=>n.id===id);if(!n||p.nodeId!==id||!str(p.id,200)||typeof p.createdAt!=='string'||typeof p.instruction!=='string'||p.instruction.length>1000||!str(p.level,200)||!Number.isInteger(p.minutes)||p.minutes<5||p.minutes>60||!Array.isArray(p.segments)||!p.segments.length||p.segments.length>256||new Set(p.segments.map(s=>s.id)).size!==p.segments.length||p.segments.some(s=>!str(s.id,200)||!str(s.text,9000)||!Number.isInteger(s.from)||!Number.isInteger(s.to)||n.start===null||n.end===null||s.from<n.start||s.to>n.end||s.to<s.from)||!Array.isArray(p.lessons))throw new Error('新版小课原文或需求关联有误');if(p.outlineResponses){if(typeof p.outlineResponses!=='object'||Array.isArray(p.outlineResponses)||Object.keys(p.outlineResponses).length>128)throw new Error('大纲响应存档有误');for(const [key,r]of Object.entries(p.outlineResponses)){if(!/^\d+:[1-8]$/.test(key)||!r||typeof r.at!=='string'||JSON.stringify(r.value??null).length>60000||!Array.isArray(r.issues)||r.issues.length>100||r.issues.some(i=>typeof i.field!=='string'||typeof i.reason!=='string'))throw new Error('未完成大纲的字段记录有误')}}if(p.outlineSlots){if(typeof p.outlineSlots!=='object'||Array.isArray(p.outlineSlots))throw new Error('原文分组大纲存档有误');for(const [key,v]of Object.entries(p.outlineSlots)){const match=/^(\d+):([1-8])$/.exec(key);if(!match)throw new Error('原文分组编号有误');const part=Number(match[1]),segments=outlineSourceSlots(p.segments.slice(part*16,(part+1)*16)).find(s=>s.slot===Number(match[2]))?.segments;if(!segments?.length)throw new Error('原文分组范围有误');checkPdfTeachingOutline(v,{...p,segments})}}if(p.outlineParts){if(!Array.isArray(p.outlineParts)||p.outlineParts.length>Math.ceil(p.segments.length/16))throw new Error('课程分部大纲进度有误');p.outlineParts.forEach((v,i)=>checkPdfTeachingOutline(v,{...p,segments:p.segments.slice(i*16,(i+1)*16)}))}if(p.outline)checkPdfTeachingOutline(p.outline,p);if(p.lessonDrafts){if(typeof p.lessonDrafts!=='object'||Array.isArray(p.lessonDrafts))throw new Error('未完成课时草稿有误');for(const [key,r]of Object.entries(p.lessonDrafts)){const i=Number(key);if(!Number.isInteger(i)||String(i)!==key||i<p.lessons.length||i>=(p.outline?.lessons.length||0)||!r||!('value' in r)||JSON.stringify(r.value??null).length>60000||typeof r.createdAt!=='string'||!Number.isInteger(r.attempts)||r.attempts<0||!Array.isArray(r.issues)||r.issues.some(v=>typeof v.field!=='string'||typeof v.reason!=='string'))throw new Error('未完成课时草稿关联有误')}}if(p.alignments){if(!Array.isArray(p.alignments)||p.alignments.length>1000)throw new Error('课题核对记录有误');for(const a of p.alignments){if(!a||!Number.isInteger(a.index)||a.index<0||a.index>=(p.outline?.lessons.length||0)||typeof a.at!=='string'||typeof a.reason!=='string'||a.reason.length>2000||!a.previous||!a.next||JSON.stringify(a.previous.segmentIds)!==JSON.stringify(a.next.segmentIds)||JSON.stringify(a.next.segmentIds)!==JSON.stringify(p.outline!.lessons[a.index].segmentIds))throw new Error('课题核对的原文范围有误');checkPdfRealignment({supported:true,lesson:a.next,evidence:a.evidence},a.previous,teachingInput(p,a.index))}}if(p.lessons.length>(p.outline?.lessons.length||0))throw new Error('新版小课进度有误');p.lessons.forEach((l,i)=>checkLessonContent(l,teachingInput(p,i),'pdf'))}}
export function acceptPdfTeaching(d:Data,b:PdfBook,p:PdfTeachingDraft){
 if(!p.outline||p.lessons.length!==p.outline.lessons.length)throw new Error('请先备齐所有小课，再加入课程');checkPdfTeachingOutline(p.outline,p);p.lessons.forEach((l,i)=>checkLessonContent(l,teachingInput(p,i),'pdf'));
 const existing=d.readingLab?.materials.filter(m=>m.pdfTeaching?.draftId===p.id&&m.sourceFile?.bookId===b.id)||[];if(existing.length){const ids=d.lessons!.filter(l=>existing.some(m=>m.id===l.labMaterialId)).sort((a,c)=>a.order-c.order);if(ids.length!==p.lessons.length)throw new Error('课程单元关联不完整，请先检查课程存档');return {courseId:ids[0].courseId,lessonId:ids[0].id}}
 const courseId=courseFromBook(d,b);const planned=d.lessons?.find(l=>l.pdfTeachingPlan?.draftId===p.id);const unitId=planned?.unitId||uid();if(!planned)d.units.push({id:unitId,courseId,name:p.outline.title});
 p.lessons.forEach((spec,index)=>{const text=teachingInput(p,index),pages=teachingPages(p,index),id=addMaterial(d,{title:spec.title,text,url:'',goal:p.outline!.lessons[index].focus,exampleDomain:p.instruction||'连贯讲解、生活情境与选择题反馈'}),m=d.readingLab!.materials.find(m=>m.id===id)!;
 m.pdfTeaching={nodeId:p.nodeId,draftId:p.id,index,version:1,pages};m.sourceFile={bookId:b.id,name:b.name,pages:b.numPages,from:pages[0],to:pages.at(-1)!};m.provenance='AI 生成，待核对';m.analysis=analysis(structuredClone(spec),p.outline!.intro);
 const pending=d.lessons?.find(l=>l.pdfTeachingPlan?.draftId===p.id&&l.pdfTeachingPlan.index===index);if(pending){m.courseId=courseId;pending.title=spec.title;pending.description=spec.question;pending.objectives=[spec.question];pending.labMaterialId=m.id;pending.labLessonIndex=0;pending.mode='阅读学习';pending.steps=[spec.explanation,spec.example,spec.boundary].map(text=>({id:uid(),text}));pending.resourceLinks=[{resourceId:m.resourceId,scope:'原书对应片段与课程讲解'}];pending.completionCriteria=['看过问题、阅读解释，并尝试或选择跳过情境练习'];saveLesson(d,pending)}else attachMaterialUnit(d,id,courseId,p.outline!.title,unitId);const l=d.lessons!.find(l=>l.labMaterialId===id)!;l.pdfTeachingPlan={bookId:b.id,nodeId:p.nodeId,draftId:p.id,index,chapterOrder:b.teachingCourse?.nodeIds.indexOf(p.nodeId)??0};l.minutes=p.minutes;l.difficulty=p.level;d.activities.filter(a=>l.activityIds.includes(a.id)).forEach(a=>a.minutes=p.minutes);
 const r=d.resources.find(r=>r.id===m.resourceId)!;r.unitId=unitId;r.courseId=courseId;r.source='原书对应片段与AI教学讲解';r.scope='PDF '+pages.join('、')+' 页（本课引用范围）';r.guide=spec.explanation;
 });linkPdfClassroomRoute(d,courseId);const lessons=d.lessons!.filter(l=>d.readingLab!.materials.some(m=>m.id===l.labMaterialId&&m.pdfTeaching?.draftId===p.id));return {courseId,lessonId:lessons[0].id};
}
