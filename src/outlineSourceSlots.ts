import type {PdfTeachingDraft,PdfTeachingOutline} from './pdfTeachingTypes';
import {checkPdfTeachingOutline} from './pdfTeachingEngine';
export {outlineSourceSlots,type OutlineSourceSlot} from './sourceGroups';
import type {OutlineSourceSlot} from './sourceGroups';
// Source ownership is fixed before a model request. A model never creates IDs.
export function bindOutlineSourceSlot(value:unknown,source:OutlineSourceSlot,draft:PdfTeachingDraft):PdfTeachingOutline{
 const v=value as PdfTeachingOutline;if(!v||!Array.isArray(v.lessons)||!v.lessons.length||v.lessons.length>2)throw new Error('这一组的小课设计尚未完整，已保存其他内容');
 return checkPdfTeachingOutline({title:v.title,intro:v.intro,lessons:v.lessons.map(l=>({title:l?.title,question:l?.question,focus:l?.focus,segmentIds:source.segments.map(s=>s.id)}))},{...draft,segments:source.segments});
}
export function slotOutlineCandidates(value:unknown,slots:OutlineSourceSlot[]):Map<number,unknown>{
 const v=value as {title?:unknown;intro?:unknown;lessons?:({sourceSlot?:unknown}&Record<string,unknown>)[]},found=new Map<number,unknown>();if(!v||!Array.isArray(v.lessons))return found;
 if(slots.length===1){found.set(slots[0].slot,{...v,lessons:v.lessons});return found}
 const positional=v.lessons.length===slots.length&&v.lessons.every(l=>l&&l.sourceSlot===undefined);
 for(const [i,l]of v.lessons.entries()){if(!l)continue;const n=positional?slots[i].slot:l.sourceSlot;if(!Number.isInteger(n)||!slots.some(s=>s.slot===n))continue;const current=found.get(n as number) as {lessons:unknown[]}|undefined;if(current)current.lessons.push(l);else found.set(n as number,{title:v.title,intro:v.intro,lessons:[l]})}
 return found;
}
