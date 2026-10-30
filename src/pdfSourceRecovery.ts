import type {Data} from './model';
import type {PdfBook} from './bookStore';
import type {ReadingMaterial} from './labTypes';

export function validPdfSource(m:Pick<ReadingMaterial,'pdfTeaching'|'sourceFile'>){const p=m.pdfTeaching,f=m.sourceFile;return !!p&&p.version===1&&typeof p.nodeId==='string'&&typeof p.draftId==='string'&&Number.isInteger(p.index)&&p.index>=0&&p.index<=255&&!!f&&typeof f.bookId==='string'&&!!f.bookId&&typeof f.name==='string'&&[f.pages,f.from,f.to].every(Number.isInteger)&&f.from>=1&&f.to>=f.from&&f.pages>=f.to&&Array.isArray(p.pages)&&p.pages.length>0&&new Set(p.pages).size===p.pages.length&&p.pages.every(n=>Number.isInteger(n)&&n>=f.from&&n<=f.to)}
// Do not guess missing page numbers. Either match the complete original input
// against a saved PDF draft, or retain the unverified link separately.
export async function recoverPdfSources(input:Data,loadBook:(id:string)=>Promise<PdfBook|undefined>){
 const data=structuredClone(input);let repaired=0,isolated=0;const cache=new Map<string,PdfBook|undefined>();
 if(!Array.isArray(data.readingLab?.materials))return {data,repaired,isolated};
 for(const m of data.readingLab.materials){if(!m||(!m.pdfTeaching&&!m.pdfSourceRecovery)||validPdfSource(m))continue;
  const {teachingInput,teachingPages}=await import('./pdfTeachingEngine');
  const original=m.pdfSourceRecovery?.original||{pdfTeaching:structuredClone(m.pdfTeaching),...(m.sourceFile?{sourceFile:structuredClone(m.sourceFile)}:{})};
  const plans=(data.lessons||[]).filter(l=>l.labMaterialId===m.id&&l.pdfTeachingPlan).map(l=>l.pdfTeachingPlan!);
  const matches:Pick<ReadingMaterial,'pdfTeaching'|'sourceFile'>[]=[];const activePlans=new Set<string>();
  // This exact legacy defect can also be repaired from two independent saved
  // links: the material's draft/index/book and the linked lesson's complete plan.
  const old=original.pdfTeaching as ReadingMaterial['pdfTeaching'],file=original.sourceFile as ReadingMaterial['sourceFile'];
  if(old&&old.nodeId===undefined&&file){for(const plan of plans){if(plan.bookId!==file.bookId||plan.draftId!==old.draftId||plan.index!==old.index||typeof plan.nodeId!=='string'||!plan.nodeId||!(data.lessons||[]).some(l=>l.labMaterialId===m.id&&l.pdfTeachingPlan===plan&&data.courses.some(c=>c.id===l.courseId&&c.bookId===file.bookId)))continue;const candidate={pdfTeaching:{...old,nodeId:plan.nodeId},sourceFile:structuredClone(file)};if(validPdfSource(candidate))matches.push(candidate)}}

  for(const plan of plans){try{if(!cache.has(plan.bookId))cache.set(plan.bookId,await loadBook(plan.bookId));const b=cache.get(plan.bookId),p=b?.teachingDrafts?.[plan.nodeId];if(!b||b.id!==plan.bookId||!p||p.nodeId!==plan.nodeId||p.id!==plan.draftId||teachingInput(p,plan.index)!==m.text)continue;const pages=teachingPages(p,plan.index),value={pdfTeaching:{nodeId:p.nodeId,draftId:p.id,index:plan.index,version:1 as const,pages},sourceFile:{bookId:b.id,name:b.name,pages:b.numPages,from:pages[0],to:pages.at(-1)!}};if(validPdfSource(value)){matches.push(value);if(b.teachingCourse?.nodeIds.includes(plan.nodeId))activePlans.add(JSON.stringify([plan.bookId,plan.nodeId,plan.draftId,plan.index]))}}catch{/* Unavailable books cannot establish a source claim. */}}
  const unique=[...new Map(matches.map(v=>[JSON.stringify([v.pdfTeaching?.nodeId,v.pdfTeaching?.draftId,v.pdfTeaching?.index,v.pdfTeaching?.pages,v.sourceFile?.bookId,v.sourceFile?.name,v.sourceFile?.pages,v.sourceFile?.from,v.sourceFile?.to]),v])).values()];
  if(unique.length===1){m.pdfTeaching=unique[0].pdfTeaching;m.sourceFile=unique[0].sourceFile;delete m.pdfSourceRecovery;for(const l of data.lessons||[]){const plan=l.pdfTeachingPlan;if(l.labMaterialId===m.id&&plan&&activePlans.has(JSON.stringify([plan.bookId,plan.nodeId,plan.draftId,plan.index])))l.archivedFromClassroom=false}repaired++;continue}
  if(m.pdfSourceRecovery)continue;
  m.pdfSourceRecovery={version:1,at:new Date().toISOString(),reason:'原有 PDF 来源关联未通过检查；课文与记录已保留，精确页码待核对。',original};
  delete m.pdfTeaching;delete m.sourceFile;const resource=data.resources?.find(r=>r.id===m.resourceId);if(resource)resource.verification='待核实';isolated++;
 }
 return {data,repaired,isolated};
}
