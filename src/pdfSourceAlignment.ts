import type {PdfTeachingDraft,PdfTeachingOutline} from './pdfTeachingTypes';
import type {OutlineSourceSlot} from './sourceGroups';
import {LessonContractError} from './lessonContract';
export type PdfLessonSpec=PdfTeachingOutline['lessons'][number];
export interface PdfRealignInput {index:number;text:string;reason:string;previous:PdfLessonSpec}
// Read full source groups, not just their opening paragraphs or an AI chapter
// summary. The plain-text fallback avoids JSON escaping overflowing the API limit.
export function pdfOutlineMaterial(chapter:string,slots:OutlineSourceSlot[],part:number,total:number){
 const value={chapter:chapter.slice(0,300),part:part+1,total,sourceSlots:slots.map(s=>({slot:s.slot,from:s.segments[0].from,to:s.segments.at(-1)!.to,preview:s.segments.map(v=>v.text).join('\n\n')}))};
 const json=JSON.stringify(value);if(json.length<=24000)return json;
 const plain=slots.map(s=>'[sourceSlot '+s.slot+']\n'+s.segments.map(v=>v.text).join('\n\n')).join('\n\n');
 if(plain.length>24000)throw new Error('这一组原文超过单次读取范围，请拆分原文分组。');return plain;
}
export function checkPdfRealignment(value:unknown,previous:PdfLessonSpec,text:string):{lesson:PdfLessonSpec;evidence:string[]}{
 const v=value as {supported?:boolean;reason?:string;lesson?:Partial<PdfLessonSpec>;evidence?:unknown};
 const fail=(reason:string):never=>{throw new LessonContractError([{field:'usable',reason}])};
 if(v?.supported!==true)fail('核对原文后，仍未找到足以授课的内容。'+(typeof v?.reason==='string'?v.reason.slice(0,500):'请查看对应原文是否缺页或文字未提取。'));
 const l=v.lesson;if(!l||!['title','question','focus'].every(k=>{const s=l[k as keyof typeof l];return typeof s==='string'&&s.trim()&&s.length<=({title:150,question:500,focus:1000}[k]||0)}))fail('按原文调整的课题尚不完整；原有课程与课时保留。');
 if(!Array.isArray(v.evidence)||!v.evidence.length||v.evidence.length>3||v.evidence.some(s=>typeof s!=='string'||s.trim().length<8||s.length>300||!text.includes(s)))fail('新课题的依据未能在本课原文中找到，未采用这次调整。');
 return {lesson:{title:l!.title!,question:l!.question!,focus:l!.focus!,segmentIds:[...previous.segmentIds]},evidence:v.evidence as string[]};
}
export function savePdfRealignment(p:PdfTeachingDraft,index:number,raw:unknown,text:string,reason:string){
 if(index<p.lessons.length||!p.outline?.lessons[index])throw new Error('已完成的课时不会自动调整课题。');
 const previous=structuredClone(p.outline.lessons[index]),checked=checkPdfRealignment(raw,previous,text);
 p.outline.lessons[index]=checked.lesson;p.alignments??=[];p.alignments.push({index,at:new Date().toISOString(),previous,next:structuredClone(checked.lesson),reason:reason.slice(0,2000),evidence:checked.evidence});
 delete p.lessonDrafts?.[index];
}
