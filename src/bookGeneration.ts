import type {PdfBook} from './bookStore';
import type {BookGeneration} from './bookGenerationTypes';
import type {ChapterJob} from './bookLearning';
import {prepareChapter,bookDiagnostic,pendingStagedCalls} from './bookLearning';
import {chapterNodes,type TocNode} from './pdfStructure';
import {chapterReady} from './chapterAssets';
import {uid} from './model';
export function startBookGeneration(b:PdfBook,options:{mode:'missing'|'regenerate';nodeId?:string;instruction?:string;syncCourse?:boolean}){
 if(!b.structure)throw new Error('先读取原书目录，确认章节页码');const all=options.nodeId?b.structure.nodes.filter(n=>n.id===options.nodeId):chapterNodes(b.structure);const nodes=all.filter(n=>n.start!==null&&n.end!==null);if(!nodes.length)throw new Error('还没有已确认页码的章节，请先补全目录');
 b.generation={id:uid(),scope:options.nodeId?'chapter':'book',mode:options.mode,instruction:(options.instruction||'').trim().slice(0,1000),syncCourse:options.syncCourse!==false,nodeIds:nodes.map(n=>n.id),unresolved:all.filter(n=>n.start===null||n.end===null).map(n=>n.id),items:Object.fromEntries(nodes.map(n=>[n.id,{status:options.mode==='missing'&&b.chapterJobs?.[n.id]&&chapterReady(b.chapterJobs[n.id])?'done':'pending'}])),status:'paused',stage:'等待开始',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),elapsedMs:0};return b.generation;
}
function archiveChapter(b:PdfBook,nodeId:string,job:ChapterJob,instruction:string){b.chapterHistory??={};const saved=structuredClone(job);if(saved.result)for(const p of saved.parts)p.text='';b.chapterHistory[nodeId]=[{id:uid(),createdAt:new Date().toISOString(),instruction,job:saved},...(b.chapterHistory[nodeId]||[])].slice(0,3)}
export function restoreChapterVersion(b:PdfBook,nodeId:string,versionId:string){const saved=b.chapterHistory?.[nodeId]?.find(v=>v.id===versionId);if(!saved)throw new Error('找不到这个章节版本');const previous=b.chapterJobs?.[nodeId],version=structuredClone(saved);b.chapterHistory![nodeId]=b.chapterHistory![nodeId].filter(v=>v.id!==versionId);if(previous)archiveChapter(b,nodeId,previous,'恢复旧版前');b.chapterJobs??={};b.chapterJobs[nodeId]=version.job;return b.chapterJobs[nodeId]}
export function generationProgress(g:BookGeneration){const statuses=g.nodeIds.map(id=>g.items[id].status);return {total:statuses.length,processed:statuses.filter(s=>['done','partial','failed'].includes(s)).length,done:statuses.filter(s=>s==='done').length,partial:statuses.filter(s=>s==='partial').length,failed:statuses.filter(s=>s==='failed').length}}
export function remainingBookRequests(b:PdfBook){const g=b.generation;if(!g)return 0;let calls=0;const average=b.pages.length?b.pages.reduce((s,p)=>s+p.text.length,0)/b.pages.length:1000;
 for(const id of g.nodeIds){const item=g.items[id];if(item.status==='done')continue;const node=b.structure?.nodes.find(n=>n.id===id);if(!node||node.start===null||node.end===null)continue;const job=b.chapterRevisions?.[id]?.job||(g.mode==='missing'||item.status==='partial'?b.chapterJobs?.[id]:undefined);
 if(job){calls+=pendingStagedCalls(job);const count=job.result?.concepts.length??6;calls+=job.result?job.result.concepts.filter(c=>!job.explorations?.[c.term]).length:count;calls+=Math.max(0,3-Object.keys(job.resources?.searches||{}).length)+(job.resources?.context?0:1)}else{const cached=b.pages.filter(p=>p.page>=node.start!&&p.page<=node.end!),chars=cached.length===node.end-node.start+1?cached.reduce((s,p)=>s+p.text.length,0):(node.end-node.start+1)*average;const parts=Math.max(1,Math.ceil(chars/17500));calls+=parts*2+Math.max(0,parts-1)*2+10}
 }return calls;
}
export async function runBookGeneration(b:PdfBook,deps:{ensurePages:(b:PdfBook,node:TocNode,signal?:AbortSignal)=>Promise<void>;prepare:(job:ChapterJob,node:TocNode,persist:()=>Promise<void>,progress:(label:string)=>void,signal?:AbortSignal)=>Promise<string[]>;persist:(b:PdfBook)=>Promise<void>;progress?:(label:string)=>void;committed?:(b:PdfBook,nodeId:string)=>Promise<void>|void},signal?:AbortSignal){
 const g=b.generation;if(!g||!b.structure)throw new Error('请先选择生成范围');const initialElapsed=g.elapsedMs,started=Date.now();const stop=()=>{if(signal?.aborted)throw new DOMException('已暂停','AbortError')};
 const persist=async()=>{g.elapsedMs=initialElapsed+Date.now()-started;g.updatedAt=new Date().toISOString();await deps.persist(b)};
 const progress=(label:string)=>{g.stage=label;deps.progress?.(label)};g.status='running';await persist();
 try{for(const id of g.nodeIds){stop();const item=g.items[id];if(item.status==='done')continue;const node=b.structure.nodes.find(n=>n.id===id)!;g.activeNodeId=id;const previousStatus=item.status;item.status='running';delete item.message;progress('准备 '+node.title);await persist();let job:ChapterJob|undefined;
 try{await deps.ensurePages(b,node,signal);stop();b.chapterJobs??={};if(g.mode==='regenerate'&&previousStatus!=='partial'){
 b.chapterRevisions??={};let revision=b.chapterRevisions[id];if(!revision||revision.instruction!==g.instruction){if(revision?.job.result)archiveChapter(b,id,revision.job,'未采用的备课草案');revision={instruction:g.instruction,createdAt:new Date().toISOString(),job:prepareChapter(b,node)};b.chapterRevisions[id]=revision}job=revision.job;
 }else{job=b.chapterJobs[id]||prepareChapter(b,node);b.chapterJobs[id]=job}
 await persist();const errors=await deps.prepare(job,node,persist,progress,signal);stop();if(!job.result)throw new Error('本章没有完整讲解，原版本仍保留');
 if(b.chapterJobs[id]!==job){if(b.chapterJobs[id])archiveChapter(b,id,b.chapterJobs[id],g.instruction);b.chapterJobs[id]=job;delete b.chapterRevisions?.[id]}
 item.status=chapterReady(job)?'done':'partial';if(errors.length)item.message='正文已保存，附加内容待补齐：'+errors.join('；');delete job.diagnostic;await persist();await deps.committed?.(b,id);
 }catch(e){if((e as Error).name==='AbortError'){item.status='pending';throw e}const error=e as Error&{code?:string};item.status='failed';item.message=error.message;if(job)job.diagnostic=bookDiagnostic('整本/局部备课',e,id);b.diagnostic=bookDiagnostic('整本/局部备课',e,id);await persist();if(/401|402|invalid_api_key|insufficient_balance/.test(error.code||'')){g.status='paused';progress('账户连接需要处理，已暂停后续章节');await persist();return g}}
 }
 const p=generationProgress(g);g.status=p.failed||p.partial||g.unresolved.length?'issues':'completed';delete g.activeNodeId;progress(g.status==='completed'?'整本任务已完成':'本轮处理完毕，未完成部分可继续');await persist();return g;
 }catch(e){g.status='paused';progress((e as Error).name==='AbortError'?'已暂停，继续时跳过已完成步骤':'任务已中断，可继续');await persist();if((e as Error).name!=='AbortError')throw e;return g}
}
