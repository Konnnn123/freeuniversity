import type {Data} from './model';
import {uid} from './model';
import type {CourseSource} from './courseSources';
import {courseBookIds,validateSources} from './courseSources';
import {getBook,getBookFile,saveBook,type PdfBook} from './bookStore';
import {openLocalPdf} from './pdfImport';
import {withSourceLocks} from './sourceLock';
import {bookTaskRegistry} from './bookTaskRegistry';
import {useStore} from './store';
import {labRequest} from './labClient';
import {addMaterial,attachMaterialUnit,validateLab} from './labEngine';
import {generatedPdfLesson,LessonContractError,repairFields,mergeLessonRepair,type LessonIssue} from './lessonContract';
export interface TopicRange {bookId:string;nodeId?:string;from:number;to:number}
export interface TopicSlice {id:string;text:string;source:CourseSource}
export interface TopicOutline {title:string;intro:string;lessons:{title:string;question:string;focus:string;sourceIds:string[]}[]}
export interface TopicDraft {id:string;goal:string;ranges:TopicRange[];slices?:TopicSlice[];notes?:Record<string,string>;outline?:TopicOutline;accepted?:Record<string,string>;pending?:Record<string,{value:unknown;issues:LessonIssue[]}>;unitId?:string;error?:string}
export const topicKey=(id:string)=>'topic-course:'+id;
export function readTopicDraft(data:Data,id:string):TopicDraft|undefined{try{return JSON.parse(data.drafts[topicKey(id)]||'null')||undefined}catch{return}}
export function checkTopicOutline(value:unknown,slices:TopicSlice[]):TopicOutline{
 const v=structuredClone(value) as TopicOutline,str=(x:unknown,n:number)=>typeof x==='string'&&!!x.trim()&&x.length<=n,known=new Map(slices.map(s=>[s.id,s]));
 if(!v||!str(v.title,300)||!str(v.intro,2200)||!Array.isArray(v.lessons)||!v.lessons.length||v.lessons.length>16)throw new Error('主题大纲尚未完整，需要1–16节有依据的小课');
 for(const l of v.lessons){if(!l||typeof l!=='object')throw new Error('主题小课设计不完整');const slots=(l as unknown as {sourceSlots?:unknown}).sourceSlots;if(Array.isArray(slots)){if(slots.some(n=>!Number.isInteger(n)||n<1||n>slices.length))throw new Error('主题小课引用了无效资料，未保存');l.sourceIds=slots.map(n=>slices[n-1].id);delete (l as unknown as {sourceSlots?:unknown}).sourceSlots}if(!l||!str(l.title,300)||!str(l.question,1500)||!str(l.focus,2000)||!Array.isArray(l.sourceIds)||!l.sourceIds.length||l.sourceIds.length>3||new Set(l.sourceIds).size!==l.sourceIds.length||l.sourceIds.some(id=>!known.has(id)))throw new Error('主题小课引用了无效资料，未保存');if(l.sourceIds.reduce((n,id)=>n+known.get(id)!.text.length+300,0)>23000)throw new Error('单课引用范围过长，请减少资料片段')}
 return structuredClone(v);
}
export function sourceSliceText(slices:TopicSlice[]){return slices.map(s=>`[资料片段 ${s.id}] 《${s.source.name}》 ${s.source.kind==='text'?'原文段':'PDF物理页'} ${s.source.pages.join('、')}\n${s.text}`).join('\n\n')}
export function acceptTopicLesson(data:Data,courseId:string,draft:TopicDraft,index:number,value:unknown){
 const course=data.courses.find(c=>c.id===courseId),spec=draft.outline?.lessons[index];if(!course||!spec||!draft.slices)throw new Error('主题备课或课程已不存在');
 const key='topic-accepted:'+draft.id+':'+index,existing=data.lessons?.find(l=>l.courseId===courseId&&l.packageId===key);if(existing)return existing.id;
 const slices=spec.sourceIds.map(id=>draft.slices!.find(s=>s.id===id)!),text=sourceSliceText(slices),lesson=generatedPdfLesson(value,text,spec),sources=slices.map(s=>s.source);validateSources(sources);
 const id=addMaterial(data,{title:lesson.title,text,url:'',goal:draft.goal,exampleDomain:'原文依据与主题情境'}),m=data.readingLab!.materials.find(m=>m.id===id)!;
 m.topicGenerated=true;m.sources=structuredClone(sources);m.analysis={summary:draft.outline!.intro,highlights:[],concepts:[],lessons:[lesson],expressions:[],report:'选一个本课的判断，写下依据、不同资料的差异，以及仍有疑问的地方。'};m.provenance='AI 生成，待核对';
 if(!draft.unitId||!data.units.some(u=>u.id===draft.unitId&&u.courseId===courseId))draft.unitId=uid();
 if(!data.units.some(u=>u.id===draft.unitId))data.units.push({id:draft.unitId,courseId,name:draft.outline!.title});
 attachMaterialUnit(data,id,courseId,draft.outline!.title,draft.unitId);const l=data.lessons!.find(l=>l.labMaterialId===id)!;l.packageId=key;l.minutes=20;l.difficulty='主题探索';data.activities.filter(a=>l.activityIds.includes(a.id)).forEach(a=>a.minutes=20);
 const resource=data.resources.find(r=>r.id===m.resourceId)!;resource.source='多资料原文片段与 AI 教学讲解';resource.scope=sources.map(s=>s.name+' · '+s.pages.join('、')).join('；');
 const route=data.lessons!.filter(l=>l.courseId===courseId&&!l.archivedFromClassroom&&(!l.bookId||l.labMaterialId)).sort((a,b)=>a.order-b.order);route.forEach((l,i)=>l.nextLessonId=route[i+1]?.id||'');validateLab(data);return l.id;
}
async function digest(text:string){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return Array.from(new Uint8Array(bytes),v=>v.toString(16).padStart(2,'0')).join('')}
export async function slicesForRange(book:PdfBook,range:TopicRange):Promise<TopicSlice[]>{
 if(!Number.isInteger(range.from)||!Number.isInteger(range.to)||range.from<1||range.to<range.from||range.to>book.numPages)throw new Error('资料范围有误，请核对起止位置');
 const pieces:{text:string;pages:number[]}[]=[],pending:number[]=[];
 for(let page=range.from;page<=range.to;page++){const p=book.pages.find(p=>p.page===page);if(!p)throw new Error('尚未读取完整原文，未跳过缺页');if(!p.text.trim()){if(pieces.length)pieces.at(-1)!.pages.push(page);else pending.push(page);continue;}for(let at=0;at<p.text.length;){let end=Math.min(at+5500,p.text.length);if(/[\uD800-\uDBFF]/.test(p.text[end-1])&&/[\uDC00-\uDFFF]/.test(p.text[end]||''))end--;const text=p.text.slice(at,end);at=end;const previous=pieces.at(-1);if(previous&&previous.text.length+text.length+40<=6000){previous.text+='\n\n'+text;if(!previous.pages.includes(page))previous.pages.push(page)}else pieces.push({text,pages:[...pending.splice(0),page]})}}
 if(!pieces.length)throw new Error('《'+book.name+'》所选范围没有可提取文字；请先检查扫描页或使用原图查看与图像解读。');
 return Promise.all(pieces.map(async p=>({id:(await digest(JSON.stringify([book.id,range.nodeId,p.pages,p.text]))).slice(0,24),text:p.text,source:{bookId:book.id,name:book.name,nodeId:range.nodeId,pages:p.pages,...(book.textSource?{kind:'text' as const}:{})}})));
}
export function launchTopicCourse(courseId:string,mode:'outline'|'lessons'){
 const taskId='topic:'+courseId;return bookTaskRegistry.start({bookId:taskId,name:useStore.getState().data.courses.find(c=>c.id===courseId)?.name||'主题备课',mode},async ctx=>{
  ctx.update({target:'/courses/'+encodeURIComponent(courseId)+'?tab=resources'});const data=useStore.getState().data,draft=structuredClone(readTopicDraft(data,courseId));if(!draft)throw new Error('请先选择资料范围');
  const unsubscribe=useStore.subscribe(state=>{const c=state.data.courses.find(c=>c.id===courseId);if(!c||draft.ranges.some(r=>!courseBookIds(c).includes(r.bookId)))bookTaskRegistry.pause(taskId)});
  const check=()=>{const current=useStore.getState().data,c=current.courses.find(c=>c.id===courseId);if(ctx.signal.aborted||!c||draft.ranges.some(r=>!courseBookIds(c).includes(r.bookId)))throw new DOMException('已暂停，课程或来源关联发生变化','AbortError')};
  const persist=()=>{check();useStore.getState().change(d=>d.drafts[topicKey(courseId)]=JSON.stringify(draft))};
  const progress=(stage:string)=>ctx.update({stage,progress:{total:1,outlined:draft.outline?1:0,lessons:draft.outline?.lessons.length||0,ready:Object.keys(draft.accepted||{}).length}});
  return withSourceLocks(draft.ranges.map(r=>r.bookId),async()=>{try{
   check();for(const range of draft.ranges)if(!await getBook(range.bookId))throw new Error('所选原资料已删除，请先解除关联或补回资料。');if(!draft.slices){const slices:TopicSlice[]=[];for(const range of draft.ranges){check();const b=await getBook(range.bookId);if(!b)throw new Error('所选资料已不可用，请解除关联或补回原书');let doc:Awaited<ReturnType<typeof openLocalPdf>>|undefined;try{for(let page=range.from;page<=range.to;page++){check();if(b.pages.some(p=>p.page===page))continue;progress('本地读取《'+b.name+'》第 '+page+' 页');if(!doc){const blob=await getBookFile(b.id);if(!blob)throw new Error('原文件已不在本机，请在图书馆补回后继续');doc=await openLocalPdf(new File([blob],b.name,{type:'application/pdf'}))}b.pages.push({page,text:await doc.readPage(page)});if(page%10===0){const current=await getBook(b.id);if(!current)throw new Error('原资料已删除');await saveBook({...current,pages:b.pages})}}b.pages.sort((a,b)=>a.page-b.page);const latest=await getBook(b.id);if(!latest)throw new Error('原资料已删除');await saveBook({...latest,pages:b.pages});slices.push(...await slicesForRange(b,range));if(slices.length>96)throw new Error('本次范围超过96个处理片段，请缩小章节或分成几个主题单元。已读取原文保留。')}finally{await doc?.destroy()}}draft.slices=[...new Map(slices.map(s=>[s.id,s])).values()];persist()}
   draft.notes??={};for(const [i,s]of draft.slices.entries()){check();if(draft.notes[s.id])continue;progress('分析资料 '+(i+1)+'/'+draft.slices.length);const b=await getBook(s.source.bookId);if(!b)throw new Error('原资料已删除');const cached=b.topicNotes?.[s.id];if(cached)draft.notes[s.id]=cached;else{const r=await labRequest('topic-source',{title:s.source.name,text:sourceSliceText([s]),goal:'提取本片段的关键问题、判断条件、限制和可支持的知识；保留不同立场',exampleDomain:''},{},ctx.signal);if(typeof r.value.summary!=='string'||!r.value.summary.trim()||r.value.summary.length>1600)throw new Error('资料分析不完整，已完成部分保留');draft.notes[s.id]=r.value.summary;check();const latest=await getBook(b.id);if(!latest)throw new Error('原资料已删除');await saveBook({...latest,topicNotes:{...latest.topicNotes,[s.id]:r.value.summary}})}persist()}
   if(!draft.outline){progress('根据各份资料组织主题大纲');const text=draft.slices.map((s,index)=>'[资料片段 '+(index+1)+'] 《'+s.source.name+'》 '+(s.source.kind==='text'?'原文段 ':'PDF页 ')+s.source.pages.join('、')+'\n已保存的片段分析（不是原文直接引文）：'+draft.notes![s.id]).join('\n\n');if(text.length>23500)throw new Error('分析结果过多，请拆成几个主题单元；已完成的资料分析可复用');const r=await labRequest('topic-outline',{title:'主题单元',text,goal:draft.goal,exampleDomain:'按主题问题组织，并比较不同资料'}, {},ctx.signal);draft.outline=checkTopicOutline(r.value,draft.slices);persist()}
   if(mode==='lessons'){draft.accepted??={};for(const [i,spec]of draft.outline.lessons.entries()){check();if(draft.accepted[String(i)]&&useStore.getState().data.lessons?.some(l=>l.id===draft.accepted![String(i)]))continue;progress('准备课时 '+(i+1)+'/'+draft.outline.lessons.length+' · '+spec.title);const text=sourceSliceText(spec.sourceIds.map(id=>draft.slices!.find(s=>s.id===id)!));let raw=draft.pending?.[i]?.value;try{if(!raw)raw=(await labRequest('topic-lesson',{title:spec.title,text,goal:draft.goal,exampleDomain:'实际应用与依据比较'},{lesson:JSON.stringify(spec)},ctx.signal)).value;try{generatedPdfLesson(raw,text,spec)}catch(e){if(!(e instanceof LessonContractError)||!repairFields(e.issues).length)throw e;draft.pending??={};draft.pending[i]={value:structuredClone(raw),issues:e.issues};persist();progress('补齐第 '+(i+1)+' 课的练习或讲解字段');const fields=repairFields(e.issues),body=(raw as {lesson?:Record<string,unknown>}).lesson||raw as Record<string,unknown>;let report=JSON.stringify({fields,issues:e.issues,existing:Object.fromEntries(fields.map(k=>[k,body?.[k]]))});if(report.length>7800)report=JSON.stringify({fields,issues:e.issues});const patch=await labRequest('pdf-teaching-repair',{title:spec.title,text,goal:draft.goal,exampleDomain:''},{lesson:JSON.stringify(spec),report},ctx.signal);raw=mergeLessonRepair(raw,patch.value,fields);generatedPdfLesson(raw,text,spec)}}catch(e){if(e instanceof LessonContractError&&raw&&JSON.stringify(raw).length<=60000){draft.pending??={};draft.pending[i]={value:structuredClone(raw),issues:e.issues};persist()}throw e}check();useStore.getState().change(d=>{draft.accepted![String(i)]=acceptTopicLesson(d,courseId,draft,i,raw);if(draft.pending)delete draft.pending[i];d.drafts[topicKey(courseId)]=JSON.stringify(draft)});persist()}}
   delete draft.error;persist();progress(mode==='outline'?'主题大纲已保存，请预览后准备课时':'主题课时已准备好');return {stage:mode==='outline'?'主题大纲已保存，请预览后准备课时':'主题课时已准备好'};
  }catch(e){if((e as Error).name!=='AbortError'){draft.error=(e as Error).message;persist()}throw e}}).finally(unsubscribe);
 });
}
