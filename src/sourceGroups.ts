import type {PdfTeachingDraft} from './pdfTeachingTypes';
export interface OutlineSourceSlot {slot:number;segments:PdfTeachingDraft['segments']}
export function outlineSourceSlots(segments:PdfTeachingDraft['segments']):OutlineSourceSlot[]{
 const groups=Array.from({length:Math.ceil(segments.length/2)},(_,i)=>({slot:i+1,segments:segments.slice(i*2,i*2+2)}));const last=groups.at(-1),previous=groups.at(-2);
 // A tiny trailing fragment belongs with real context, rather than becoming a
 // standalone class that fails the minimum-source check.
 if(last?.segments.length===1&&last.segments[0].text.trim().length<40&&previous?.segments.length===2)last.segments.unshift(previous.segments.pop()!);
 return groups;
}
