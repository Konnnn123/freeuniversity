import {pdfItemsToText} from './pdfText';
import {checkStructure,type PdfStructure} from './pdfStructure';

export type DiscoverySource='printed-toc'|'headings'|'learning-segments';
export interface PdfLine {text:string;x:number;y:number;size:number}
export interface PdfPageLayout {page:number;text:string;lines:PdfLine[];height:number}
export interface PdfDiagnosis {checked:number;readable:number;garbled:number;tocPages:number[]}
export interface PdfCandidate {id:string;title:string;start:number|null;end:number|null;printedStart?:number;printedEnd?:number;tocPage?:number;matchedPage?:number;note:string}
export interface PdfDiscovery {version:1;source:DiscoverySource;rows:PdfCandidate[];diagnosis:PdfDiagnosis}
type Item={str?:string;transform?:number[];height?:number};

// Keep page coordinates for contents columns; ordinary reading still uses pdfItemsToText.
export function pageLayout(page:number,items:unknown[],height:number):PdfPageLayout {
 const lines:PdfLine[]=[];
 for(const raw of items){const item=raw as Item;if(!item.str?.trim()||!item.transform)continue;const x=item.transform[4],y=item.transform[5],size=Math.abs(item.height||item.transform[3]||10);let line=lines.find(l=>Math.abs(l.y-y)<Math.max(2,Math.min(size,l.size)*.22));if(!line){line={text:'',x,y,size};lines.push(line)}}
 for(const line of lines){line.text=items.map(i=>i as Item).filter(i=>i.str?.trim()&&i.transform&&Math.abs(i.transform[5]-line.y)<Math.max(2,Math.min(Math.abs(i.height||i.transform[3]||10),line.size)*.22)).sort((a,b)=>a.transform![4]-b.transform![4]).map(i=>i.str).join(' ').replace(/\s+/g,' ').trim()}
 return {page,text:pdfItemsToText(items),lines:lines.sort((a,b)=>b.y-a.y),height};
}
const key=(s:string)=>s.replace(/^(?:第[一二三四五六七八九十百\d]+[章节篇部]|chapter\s+\w+|\d+[.、．])/i,'').replace(/[\s\p{P}\p{S}]/gu,'').toLowerCase();
export function diagnosePdf(pages:PdfPageLayout[]):PdfDiagnosis {return {checked:pages.length,readable:pages.filter(p=>p.text.replace(/\s/g,'').length>=20).length,garbled:pages.filter(p=>(p.text.match(/�/g)||[]).length>Math.max(3,p.text.length*.02)).length,tocPages:pages.filter(p=>p.lines.some(l=>/^(目录|目\s*录|contents?)$/i.test(l.text))).map(p=>p.page)}}
const validPage=(n:unknown,total:number)=>typeof n==='number'&&Number.isInteger(n)&&n>=1&&n<=total;
export function discoverPdf(pages:PdfPageLayout[],total:number):PdfDiscovery {
 const diagnosis=diagnosePdf(pages),rows:PdfCandidate[]=[];
 for(const p of pages.filter(p=>diagnosis.tocPages.includes(p.page))){for(const line of p.lines){const m=line.text.match(/^(.+?)\s*[.．·…\s]*(\d{1,5})(?:\s*[~～—–-]\s*(\d{1,5}))?\s*$/);if(!m)continue;const title=m[1].replace(/[.．…\s]+$/g,'').trim(),printedStart=Number(m[2]),printedEnd=m[3]?Number(m[3]):undefined;if(key(title).length<2||!validPage(printedStart,total)||(printedEnd!==undefined&&(!validPage(printedEnd,total)||printedEnd<printedStart)))continue;
 const found=pages.find(q=>q.page>p.page&&!diagnosis.tocPages.includes(q.page)&&q.lines.some(l=>key(l.text)===key(title)));
 rows.push({id:`printed:${p.page}:${rows.length}`,title,start:found?.page??null,end:null,printedStart,printedEnd,tocPage:p.page,matchedPage:found?.page,note:found?'已对照正文标题':'正文标题未匹配，请核对页码'});
 }}
 if(rows.length>=2){const offsets=new Map<number,number>();for(const r of rows)if(r.matchedPage!==undefined){const offset=r.matchedPage-r.printedStart!;offsets.set(offset,(offsets.get(offset)||0)+1)}const best=[...offsets].sort((a,b)=>b[1]-a[1])[0],offset=best&&best[1]>=2?best[0]:undefined;
 for(let i=0;i<rows.length;i++){const r=rows[i];if(r.start===null&&offset!==undefined&&validPage(r.printedStart!+offset,total)){r.start=r.printedStart!+offset;r.note='按已核对章节的页码差换算，仍需核对'}const next=rows[i+1];if(r.printedEnd!==undefined&&r.start!==null){const end=r.printedEnd+(r.start-r.printedStart!);if(validPage(end,total)&&end>=r.start){r.end=end;const page=pages.find(p=>p.page===end);const folio=page?.lines.some(l=>l.y<page.height*.2&&/^\d+$/.test(l.text)&&Number(l.text)===r.printedEnd);r.note+=folio?'；结束页书内页码已核对':'；结束页待核对'}}else if(next?.start!==null&&next?.start!==undefined&&r.start!==null&&next.start>r.start){r.end=next.start-1;r.note+='；结束页按下一章边界划分'}}
 return {version:1,source:'printed-toc',rows,diagnosis};}
 const seen=new Set<string>();for(const p of pages){for(const line of p.lines){if(line.text.length>90||!/^(第[一二三四五六七八九十百\d]+[章篇部]|chapter\s+\w+\b)/i.test(line.text))continue;const k=key(line.text);if(k.length<2||seen.has(k))continue;seen.add(k);rows.push({id:`heading:${p.page}:${rows.length}`,title:line.text,start:p.page,end:null,matchedPage:p.page,note:'从正文标题推测，层级和结束页需核对'})}}
 for(let i=0;i<rows.length;i++)rows[i].end=(rows[i+1]?.start??total+1)-1;
 return {version:1,source:'headings',rows,diagnosis};
}
export function learningSegments(total:number,size=8,diagnosis:PdfDiagnosis={checked:0,readable:0,garbled:0,tocPages:[]}):PdfDiscovery {if(!Number.isInteger(total)||total<1||!Number.isInteger(size)||size<1)throw new Error('分段页数不正确');return {version:1,source:'learning-segments',diagnosis,rows:Array.from({length:Math.ceil(total/size)},(_,i)=>({id:`segment:${i*size+1}`,title:`学习分段 ${i+1}`,start:i*size+1,end:Math.min(total,(i+1)*size),note:'按 PDF 实际页码分段，并非原书章节'}))}}
export function validateDiscovery(value:unknown,total:number):PdfDiscovery {const d=value as PdfDiscovery;if(!d||d.version!==1||!['printed-toc','headings','learning-segments'].includes(d.source)||!Array.isArray(d.rows)||d.rows.length>20000||!d.diagnosis||!Number.isInteger(d.diagnosis.checked)||d.diagnosis.checked<0||d.diagnosis.checked>total||![d.diagnosis.readable,d.diagnosis.garbled].every(n=>Number.isInteger(n)&&n>=0&&n<=d.diagnosis.checked)||!Array.isArray(d.diagnosis.tocPages)||d.diagnosis.tocPages.some(n=>!validPage(n,total))||d.rows.some(r=>!r||typeof r.id!=='string'||typeof r.title!=='string'||r.title.length>500||typeof r.note!=='string'||r.note.length>1000||[r.printedStart,r.printedEnd,r.tocPage,r.matchedPage].some(n=>n!==undefined&&!validPage(n,total))||[r.start,r.end].some(n=>n!==null&&!validPage(n,total))))throw new Error('待确认目录格式有误');return structuredClone(d)}
export function adoptDiscovery(draft:PdfDiscovery,total:number,existing?:PdfStructure):PdfStructure {
 const d=validateDiscovery(draft,total);if(!d.rows.length)throw new Error('请先识别目录或创建学习分段');let previous=0;
 for(const r of d.rows){if(!r.title.trim()||!validPage(r.start,total)||!validPage(r.end,total)||r.end!<r.start!||r.start!<=previous)throw new Error('请核对标题与 PDF 起止页：范围应依次排列且不重叠');previous=r.end!}
 const result:PdfStructure=structuredClone(existing||{version:1,nodes:[],pageLabels:null,readAt:''});
 // Existing analyses and course lesson IDs keep their original anchors.
 for(const r of d.rows){if(result.nodes.some(n=>n.start===r.start&&n.end===r.end&&key(n.title)===key(r.title)))continue;if(result.nodes.some(n=>n.start!==null&&n.end!==null&&r.start!<=n.end&&r.end!>=n.start))throw new Error('该范围与已有章节重叠；已有章节和备课已保留，请使用原目录或调整范围');const at=result.nodes.findIndex(n=>n.parentId===null&&n.start!==null&&n.start>r.start!);result.nodes.splice(at<0?result.nodes.length:at,0,{id:`confirmed:${d.source}:${crypto.randomUUID()}`,parentId:null,depth:0,title:r.title.trim(),start:r.start,end:r.end,pageLabel:r.printedStart===undefined?undefined:String(r.printedStart),samePage:false,rangeSource:d.source})}
 result.readAt=new Date().toISOString();return checkStructure(result,total);
}
