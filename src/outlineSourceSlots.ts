import {MAX_OUTLINE_LESSONS} from './pdfTeachingTypes';
import type {PdfTeachingDraft,PdfTeachingOutline} from './pdfTeachingTypes';
import {checkPdfTeachingOutline} from './pdfTeachingEngine';
export {outlineSourceSlots,type OutlineSourceSlot} from './sourceGroups';
import type {OutlineSourceSlot} from './sourceGroups';
export interface OutlineIssue {field:string;reason:string}
export class OutlineContractError extends Error {code='outline_contract';constructor(public issues:OutlineIssue[]){super('大纲待补齐：'+issues.map(i=>i.field+'（'+i.reason+'）').join('；'));this.name='OutlineContractError'}}
const object=(v:unknown):v is Record<string,any>=>!!v&&typeof v==='object'&&!Array.isArray(v);
function normalize(value:unknown):Record<string,any>{let v=object(value)?value:{};for(let depth=0;depth<3;depth++){if(v.usable===false||v.supported===false||Array.isArray(v.lessons)||object(v.lessons)||object(v.lesson)||Array.isArray(v.sourceSlots))break;const key=['outline','data','result'].find(k=>object(v[k]));if(!key)break;const nested=v[key],outer={...v};delete outer[key];v={...outer,...nested}}return {...v,lessons:Array.isArray(v.lessons)?v.lessons:object(v.lessons)?[v.lessons]:object(v.lesson)?[v.lesson]:undefined}}
// Normalize envelopes, never invent teaching text or model-selected source IDs.
export function bindOutlineSourceSlot(value:unknown,source:OutlineSourceSlot,draft:PdfTeachingDraft):PdfTeachingOutline{
 const v=normalize(value),issues:OutlineIssue[]=[];
 if(v.usable===false||v.supported===false)throw new OutlineContractError([{field:'source',reason:typeof v.reason==='string'?v.reason.slice(0,500):'模型未找到足够的可读原文'}]);
 const text=(v:unknown,max:number)=>typeof v==='string'&&v.trim().length>0&&v.length<=max;
 if(!text(v.title,150))issues.push({field:'title',reason:'缺少单元名称或超过150字'});
 if(!text(v.intro,600))issues.push({field:'intro',reason:'缺少单元介绍或超过600字'});
 if(!Array.isArray(v.lessons)||!v.lessons.length||v.lessons.length>MAX_OUTLINE_LESSONS)issues.push({field:'lessons',reason:Array.isArray(v.lessons)?'实际返回 '+v.lessons.length+' 节，需至少1节且不超过单章 '+MAX_OUTLINE_LESSONS+' 节的上限':'未返回可读取的课时列表；收到字段：'+Object.keys(v).filter(k=>v[k]!==undefined).slice(0,12).join('、')});
 else v.lessons.forEach((l:any,i:number)=>{for(const [field,max]of [['title',150],['question',500],['focus',1000]] as const)if(!text(l?.[field],max))issues.push({field:`lessons[${i}].${field}`,reason:'缺失、为空或超过长度限制'})});
 if(issues.length)throw new OutlineContractError(issues);
 return checkPdfTeachingOutline({title:v.title,intro:v.intro,lessons:v.lessons.map((l:any)=>({title:l.title,question:l.question,focus:l.focus,segmentIds:source.segments.map(s=>s.id)}))},{...draft,segments:source.segments});
}
export function slotOutlineCandidates(value:unknown,slots:OutlineSourceSlot[]):Map<number,unknown>{
 const v=normalize(value),found=new Map<number,unknown>();
 if(Array.isArray(v.sourceSlots)){
  // A single requested source owns its mapping. A model may renumber its sole
  // envelope as slot 1, just as it already may renumber a top-level lesson.
  if(slots.length===1&&v.sourceSlots.length===1&&object(v.sourceSlots[0])){const group=normalize(v.sourceSlots[0]);found.set(slots[0].slot,{...group,title:group.title??v.title,intro:group.intro??v.intro,...(v.usable===false?{usable:false,reason:v.reason}:{}),...(v.supported===false?{supported:false,reason:v.reason}:{})});return found}
  const duplicates=new Set<number>();for(const group of v.sourceSlots){if(!object(group))continue;const slot=group.slot??group.sourceSlot;if(!slots.some(s=>s.slot===slot))continue;if(found.has(slot)){found.delete(slot);duplicates.add(slot);continue}if(duplicates.has(slot))continue;found.set(slot,normalize({...group,title:group.title??v.title,intro:group.intro??v.intro,...(v.usable===false?{usable:false,reason:v.reason}:{}),...(v.supported===false?{supported:false,reason:v.reason}:{})}))}return found}
 if(slots.length===1){found.set(slots[0].slot,v);return found}
 if(!Array.isArray(v.lessons))return found;
 const positional=v.lessons.length===slots.length&&v.lessons.every((l:any)=>l&&l.sourceSlot===undefined);
 for(const [i,l]of v.lessons.entries()){if(!l)continue;const n=positional?slots[i].slot:l.sourceSlot;if(!Number.isInteger(n)||!slots.some(s=>s.slot===n))continue;const current=found.get(n as number) as {lessons:unknown[]}|undefined;if(current)current.lessons.push(l);else found.set(n as number,{title:v.title,intro:v.intro,lessons:[l]})}
 return found;
}
