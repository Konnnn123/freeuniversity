import {preparedInput} from './preparedCourse';
import {sourceHash} from './sourceParagraphs';
import type {OriginalParagraph,PreparedSourceSelection} from './preparedCourseTypes';
const INPUT_LIMIT=18000,OUTPUT_LIMIT=8000,LESSON_LIMIT=22000;
export function sourceSelectionBatches(pool:OriginalParagraph[],maximumParagraphs=48){const rows:OriginalParagraph[][]=[];let group:OriginalParagraph[]=[];for(const p of pool){if(group.length&&(group.length>=maximumParagraphs||preparedInput([...group,p]).length>INPUT_LIMIT)){rows.push(group);group=[]}if(preparedInput([p]).length>INPUT_LIMIT)throw new Error('原文单段过长，请重新核对提取结果');group.push(p)}if(group.length)rows.push(group);return rows}
export function sourceSelectionInput(pool:OriginalParagraph[]){return pool.map((p,i)=>`[R${i+1}]\n${p.text}`).join('\n\n')}
export function checkedSourceSelection(raw:unknown,pool:OriginalParagraph[],maximumCharacters=OUTPUT_LIMIT){
 const value=raw as {keep?:unknown;sourceSlots?:unknown};let selected:OriginalParagraph[];
 const legacy=()=>{const slots=value?.sourceSlots;if(!Array.isArray(slots))throw new Error('原文筛选需要keep布尔数组，按当前'+pool.length+'段的顺序逐项判断');const normalized=slots.map(n=>typeof n==='string'&&/^[1-9]\d*$/.test(n.trim())?Number(n.trim()):n),invalid=normalized.filter(n=>!Number.isSafeInteger(n)||Number(n)<1||Number(n)>pool.length);if(invalid.length)throw new Error('当前批次共'+pool.length+'段，可用编号为1–'+pool.length+'；收到越界或无效编号：'+JSON.stringify(invalid.slice(0,20)));const ids=new Set(normalized.map(n=>pool[Number(n)-1].id));return pool.filter(p=>ids.has(p.id))};
 if(value?.keep!==undefined){if(!Array.isArray(value.keep)||value.keep.length!==pool.length||value.keep.some(v=>typeof v!=='boolean'))throw new Error('keep需恰好'+pool.length+'个true/false，逐项对应R1–R'+pool.length+'；实际收到'+(Array.isArray(value.keep)?value.keep.length+'项':'非数组'));selected=pool.filter((_,i)=>(value.keep as boolean[])[i]);if(value.sourceSlots!==undefined){const older=legacy();if(older.length!==selected.length||older.some((p,i)=>p.id!==selected[i].id))throw new Error('keep与旧编号选择不一致，未猜测原文关联')}}else selected=legacy();
 if(selected.length&&!selected.some(p=>p.role==='body'||p.role==='note'))throw new Error('请选择能支持课题的正文，不能只选标题');if(preparedInput(selected).length>maximumCharacters)throw new Error('筛选的原文仍超过本批'+maximumCharacters+'字符，请保留支持课题的关键段落与必要条件');return selected;
}
export async function selectLessonSources(pool:OriginalParagraph[],lesson:{title:string;question:string;focus:string},cache:PreparedSourceSelection,services:{request:(text:string,report:string)=>Promise<unknown>;save:()=>Promise<void>;progress:(text:string)=>void;signal:AbortSignal}){
 const stop=()=>{if(services.signal.aborted)throw new DOMException('已暂停','AbortError')};stop();
 if(preparedInput(pool).length<=LESSON_LIMIT)return pool;
 const key=await sourceHash(JSON.stringify(['lesson-sources',1,lesson,pool.map(p=>p.id)]));
 if(cache.key!==key){cache.key=key;cache.picks={};delete cache.selected;delete cache.failures;await services.save()}
 if(cache.selected){const ids=new Set(cache.selected),selected=pool.filter(p=>ids.has(p.id));if(ids.size===cache.selected.length&&selected.length===ids.size&&selected.some(p=>p.role==='body'||p.role==='note')&&preparedInput(selected).length<=LESSON_LIMIT)return selected;throw new Error('已保存的课时原文选择与当前资料不一致，请重新核对')}
 let current=pool;
 for(let pass=0;preparedInput(current).length>LESSON_LIMIT;pass++){
  if(pass>=8)throw new Error('原文范围仍过大，已保存筛选进度，请调整这节课的学习范围');
  const jobs:{batch:OriginalParagraph[];limit:number;oldFailure?:string}[]=[],retiredFailures:string[]=[];
  for(const oldBatch of sourceSelectionBatches(current,Infinity)){
   const oldPart=await sourceHash(JSON.stringify([key,oldBatch.map(p=>p.id),OUTPUT_LIMIT]));
   if(cache.picks[oldPart]===undefined&&cache.failures?.[oldPart]){let recovered:OriginalParagraph[]|undefined;try{recovered=checkedSourceSelection(cache.failures[oldPart].value,oldBatch)}catch{}if(recovered){cache.picks[oldPart]=recovered.map(p=>p.id);delete cache.failures[oldPart];await services.save()}}
   if(cache.picks[oldPart]!==undefined)jobs.push({batch:oldBatch,limit:OUTPUT_LIMIT});
   else{for(const batch of sourceSelectionBatches(oldBatch)){const limit=Math.min(OUTPUT_LIMIT,Math.max(...batch.map(p=>preparedInput([p]).length),Math.floor(preparedInput(batch).length*.45)));jobs.push({batch,limit,...(cache.failures?.[oldPart]?{oldFailure:oldPart}:{})})}if(cache.failures?.[oldPart])retiredFailures.push(oldPart)}
  }
  const nextIds=new Set<string>();
  for(const [i,{batch,limit,oldFailure}]of jobs.entries()){
   stop();services.progress('挑选本课对应原文 · '+lesson.title+' · '+(i+1)+'/'+jobs.length+(pass?' · 归并第'+(pass+1)+'轮':''));
   const part=await sourceHash(JSON.stringify([key,batch.map(p=>p.id),limit])),cached=cache.picks[part];let selected:OriginalParagraph[];
   if(cached){const ids=new Set(cached);selected=batch.filter(p=>ids.has(p.id));if(selected.length!==ids.size||ids.size!==cached.length||preparedInput(selected).length>limit)throw new Error('已保存的原文筛选记录有误，请重新核对')}
   else{
    const previous=cache.failures?.[part]||(oldFailure?cache.failures?.[oldFailure]:undefined);let recovered:OriginalParagraph[]|undefined;
    if(cache.failures?.[part]){try{recovered=checkedSourceSelection(cache.failures[part].value,batch,limit)}catch{}}
    if(recovered)selected=recovered;
    else{
     let result:OriginalParagraph[]|undefined;const attempts=previous?1:2;
     for(let attempt=0;attempt<attempts;attempt++){
      stop();const failure=cache.failures?.[part]||previous,report=JSON.stringify({maximumCharacters:limit,paragraphCount:batch.length,paragraphCharacters:batch.map(p=>preparedInput([p]).length),...(failure?{repair:failure.issue,previousSelection:JSON.stringify(failure.value).slice(0,2000)}:{})});
      const raw=await services.request(sourceSelectionInput(batch),report);stop();cache.failures??={};cache.failures[part]={value:raw};await services.save();
      try{result=checkedSourceSelection(raw,batch,limit);break}catch(e){cache.failures[part].issue=(e as Error).message;await services.save();if(attempt===attempts-1)throw e}
     }
     selected=result!;
    }
    cache.picks[part]=selected.map(p=>p.id);if(cache.failures)delete cache.failures[part];await services.save();
   }
   for(const p of selected)nextIds.add(p.id);
  }
  for(const retired of retiredFailures){if(cache.failures)delete cache.failures[retired]}if(retiredFailures.length)await services.save();
  const next=current.filter(p=>nextIds.has(p.id));if(!next.some(p=>p.role==='body'||p.role==='note')){for(const {batch,limit}of jobs){const part=await sourceHash(JSON.stringify([key,batch.map(p=>p.id),limit]));delete cache.picks[part]}await services.save();throw new Error('本轮未选出支持课题的正文，已有分析与大纲保留；可继续核对原文')}
  if(next.length>=current.length&&preparedInput(next).length>=preparedInput(current).length)throw new Error('原文筛选未缩小范围，已保存结果，请调整课题');current=next;
 }
 cache.selected=current.map(p=>p.id);await services.save();return current;
}
