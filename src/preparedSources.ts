import {preparedInput} from './preparedCourse';
import {sourceHash} from './sourceParagraphs';
import type {OriginalParagraph,PreparedSourceSelection} from './preparedCourseTypes';
const INPUT_LIMIT=18000,OUTPUT_LIMIT=8000,LESSON_LIMIT=22000;
export function sourceSelectionBatches(pool:OriginalParagraph[]){const rows:OriginalParagraph[][]=[];let group:OriginalParagraph[]=[];for(const p of pool){if(group.length&&preparedInput([...group,p]).length>INPUT_LIMIT){rows.push(group);group=[]}if(preparedInput([p]).length>INPUT_LIMIT)throw new Error('原文单段过长，请重新核对提取结果');group.push(p)}if(group.length)rows.push(group);return rows}
export function checkedSourceSelection(raw:unknown,pool:OriginalParagraph[]){const slots=(raw as {sourceSlots?:unknown})?.sourceSlots;if(!Array.isArray(slots)||slots.length>12)throw new Error('原文筛选需要0–12个真实段落编号');const normalized=slots.map(n=>typeof n==='string'&&/^[1-9]\d*$/.test(n)?Number(n):n);if(new Set(normalized).size!==normalized.length||normalized.some(n=>!Number.isSafeInteger(n)||Number(n)<1||Number(n)>pool.length))throw new Error('筛选结果包含重复或不存在的原文段编号');const ids=new Set(normalized.map(n=>pool[Number(n)-1].id)),selected=pool.filter(p=>ids.has(p.id));if(selected.length&&!selected.some(p=>p.role==='body'||p.role==='note'))throw new Error('请选择能支持课题的正文，不能只选标题');if(preparedInput(selected).length>OUTPUT_LIMIT)throw new Error('筛选的原文仍超过本批8000字符，请保留支持课题的关键段落与必要条件');return selected}
export async function selectLessonSources(pool:OriginalParagraph[],lesson:{title:string;question:string;focus:string},cache:PreparedSourceSelection,services:{request:(text:string,report:string)=>Promise<unknown>;save:()=>Promise<void>;progress:(text:string)=>void;signal:AbortSignal}){
 const stop=()=>{if(services.signal.aborted)throw new DOMException('已暂停','AbortError')};stop();
 if(preparedInput(pool).length<=LESSON_LIMIT)return pool;
 const key=await sourceHash(JSON.stringify(['lesson-sources',1,lesson,pool.map(p=>p.id)]));
 if(cache.key!==key){cache.key=key;cache.picks={};delete cache.selected;delete cache.failures;await services.save()}
 if(cache.selected){const ids=new Set(cache.selected),selected=pool.filter(p=>ids.has(p.id));if(ids.size===cache.selected.length&&selected.length===ids.size&&selected.some(p=>p.role==='body'||p.role==='note')&&preparedInput(selected).length<=LESSON_LIMIT)return selected;throw new Error('已保存的课时原文选择与当前资料不一致，请重新核对')}
 let current=pool;
 for(let pass=0;preparedInput(current).length>LESSON_LIMIT;pass++){
  if(pass>=8)throw new Error('原文范围仍过大，已保存筛选进度，请调整这节课的学习范围');const batches=sourceSelectionBatches(current),nextIds=new Set<string>();
  for(const [i,batch]of batches.entries()){
   stop();services.progress('挑选本课对应原文 · '+lesson.title+' · '+(i+1)+'/'+batches.length+(pass?' · 归并第'+(pass+1)+'轮':''));
   const part=await sourceHash(JSON.stringify([key,batch.map(p=>p.id),OUTPUT_LIMIT])),cached=cache.picks[part];let selected:OriginalParagraph[];
   if(cached){const ids=new Set(cached);selected=batch.filter(p=>ids.has(p.id));if(selected.length!==ids.size||ids.size!==cached.length||preparedInput(selected).length>OUTPUT_LIMIT)throw new Error('已保存的原文筛选记录有误，请重新核对')}
   else{
    const previous=cache.failures?.[part],raw=await services.request(preparedInput(batch),JSON.stringify({maximumCharacters:OUTPUT_LIMIT,...(previous?{repair:previous.issue,previousSelection:JSON.stringify(previous.value).slice(0,2000)}:{})}));stop();cache.failures??={};cache.failures[part]={value:raw};await services.save();
    try{selected=checkedSourceSelection(raw,batch)}catch(e){cache.failures[part].issue=(e as Error).message;await services.save();throw e}
    cache.picks[part]=selected.map(p=>p.id);delete cache.failures[part];await services.save();
   }
   for(const p of selected)nextIds.add(p.id);
  }
  const next=current.filter(p=>nextIds.has(p.id));if(!next.some(p=>p.role==='body'||p.role==='note')){for(const batch of batches){const part=await sourceHash(JSON.stringify([key,batch.map(p=>p.id),OUTPUT_LIMIT]));delete cache.picks[part]}await services.save();throw new Error('本轮未选出支持课题的正文，已有分析与大纲保留；可继续核对原文')}
  if(next.length>=current.length&&preparedInput(next).length>=preparedInput(current).length)throw new Error('原文筛选未缩小范围，已保存结果，请调整课题');current=next;
 }
 cache.selected=current.map(p=>p.id);await services.save();return current;
}
