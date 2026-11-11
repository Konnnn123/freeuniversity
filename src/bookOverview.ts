import type {PdfBook} from './bookStore';
import {checkOverview,tocContext} from './bookLearning';
import {chapterNodes,type TocNode} from './pdfStructure';
export type OverviewRequest=(action:'book-overview-text'|'book-overview-outline',text:string,outline:string,compact:boolean)=>Promise<unknown>;
const boundedFailure=(e:unknown)=>['output_truncated','text_too_long','repair_truncated'].includes((e as {code?:string})?.code||'');
export async function runBookOverview(b:PdfBook,text:string,pages:number[],request:OverviewRequest,persist:()=>Promise<void>,progress:(label:string)=>void,signal?:AbortSignal){
 const stop=()=>{if(signal?.aborted)throw new DOMException('已暂停','AbortError')};
 const roots=chapterNodes(b.structure!),context=tocContext(b.structure!);
 if(!roots.length)throw new Error('没有可用于总览的大章');
 if(!b.overviewDraft?.complete){let last:unknown;for(let attempt=0;attempt<2;attempt++){stop();progress(attempt?'总览输出较长，正在改为简洁的全书主线…':'生成全书主线讲解…');try{
 // The narrative explains relationships, while every chapter is covered in the saved route batches below.
 const titles=context.map(n=>({title:n.title,kind:n.kind}));let narrativeTitles=titles;
 if(JSON.stringify(titles).length>18000){narrativeTitles=[];for(const title of titles){if(JSON.stringify([...narrativeTitles,title]).length>16000)break;narrativeTitles.push(title)}}
 const value=await request('book-overview-text',text,JSON.stringify({chapters:narrativeTitles,totalChapters:roots.length,scope:narrativeTitles.length===titles.length?'完整章名':'部分章名；完整章节路线另行分批整理'}),attempt>0) as {text?:string;complete?:boolean};
 if(typeof value?.text!=='string'||!value.text.trim()||value.complete!==true||value.text.length>5000)throw new Error('总览没有返回完整文字');
 b.overviewDraft={text:value.text,complete:true,createdAt:new Date().toISOString(),pages};await persist();last=undefined;break;
 }catch(e){last=e;const partial=(e as {diagnostic?:{rawResponse?:string}}).diagnostic?.rawResponse;if(partial?.trim()){b.overviewDraft={text:partial.slice(0,24000),complete:false,createdAt:new Date().toISOString(),pages};await persist()}if(!boundedFailure(e)||attempt===1)throw e}}
 if(last)throw last;
 }
 stop();const summary=b.overviewDraft!.text;
 const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify([summary,context])));const fingerprint=Array.from(new Uint8Array(bytes),v=>v.toString(16).padStart(2,'0')).join('');
 if(b.overviewRoutes?.context!==fingerprint){b.overviewRoutes={context:fingerprint,chapters:[],suggestedStart:[]};await persist()}
 const saved=b.overviewRoutes!;
 const run=async(nodes:TocNode[],compact=false):Promise<void>=>{stop();progress('整理章节路线 · 已保存 '+saved.chapters.length+'/'+roots.length+' 章'+(compact?' · 缩小本批输出':''));const outline=JSON.stringify(context.filter(n=>nodes.some(x=>x.id===n.nodeId)));
 try{const raw=await request('book-overview-outline',summary,outline,compact);stop();const checked=checkOverview({...raw as object,summary},{...b.structure!,nodes:nodes.map(n=>({...n,parentId:null}))},b.overviewDraft!.pages);
 saved.chapters.push(...nodes.map(n=>checked.chapters.find(c=>c.nodeId===n.id)!));saved.suggestedStart=[...new Set([...saved.suggestedStart,...checked.suggestedStart])];await persist();
 }catch(e){if(!boundedFailure(e))throw e;if(nodes.length>1){const middle=Math.ceil(nodes.length/2);await run(nodes.slice(0,middle),true);await run(nodes.slice(middle),true)}else if(!compact)await run(nodes,true);else throw e}};
 const pending=roots.filter(n=>!saved.chapters.some(c=>c.nodeId===n.id));let batch:TocNode[]=[];
 for(const node of pending){if(batch.length&&(batch.length>=5||JSON.stringify(context.filter(n=>[...batch,node].some(x=>x.id===n.nodeId))).length>18000)){await run(batch);batch=[]}batch.push(node)}if(batch.length)await run(batch);
 stop();b.overview=checkOverview({summary,chapters:roots.map(n=>saved.chapters.find(c=>c.nodeId===n.id)!),suggestedStart:saved.suggestedStart.slice(0,3)},b.structure!,b.overviewDraft!.pages);delete b.diagnostic;await persist();return b.overview;
}
