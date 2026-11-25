import type {OriginalParagraph} from './preparedCourseTypes';
export interface SourceLine {text:string;x:number;y:number;width:number;size:number}
export interface SourceLayout {page:number;width:number;height:number;lines:SourceLine[]}
const median=(values:number[])=>[...values].sort((a,b)=>a-b)[Math.floor(values.length/2)]||10;
export function sourceLayout(page:number,items:unknown[],width:number,height:number):SourceLayout{
 const pieces=items.flatMap(raw=>{const i=raw as {str?:string;width?:number;height?:number;transform?:number[]};return i?.str?.trim()&&i.transform?.length===6?[{text:i.str,x:i.transform[4],y:i.transform[5],width:Math.abs(i.width||i.str.length*5),size:Math.abs(i.height||i.transform[3]||10)}]:[]});
 const rows:SourceLine[][]=[];for(const p of pieces.sort((a,b)=>b.y-a.y||a.x-b.x)){const row=rows.find(r=>Math.abs(r[0].y-p.y)<Math.max(2,Math.min(r[0].size,p.size)*.23));if(row)row.push(p);else rows.push([p])}
 const lines:SourceLine[]=[];for(const row of rows){let line:SourceLine|undefined;for(const p of row.sort((a,b)=>a.x-b.x)){if(!line||p.x-(line.x+line.width)>Math.max(18,p.size*2)){line={...p};lines.push(line)}else{line.text+=(/[A-Za-z0-9]$/.test(line.text)&&/^[A-Za-z0-9]/.test(p.text)?' ':'')+p.text;line.width=Math.max(line.width,p.x+p.width-line.x)}}}
 return {page,width,height,lines};
}
export function orderedSourceLines(layout:SourceLayout){const {lines,width}=layout,candidates:number[]=[];
 for(const a of lines)for(const b of lines)if(b.x>a.x+a.width+18&&Math.abs(a.y-b.y)<Math.max(a.size,b.size))candidates.push(Math.round(((a.x+a.width+b.x)/2)/15)*15);
 const counts=new Map<number,number>();for(const x of candidates)if(x>width*.2&&x<width*.8)counts.set(x,(counts.get(x)||0)+1);const best=[...counts].sort((a,b)=>b[1]-a[1])[0];
 if(!best||best[1]<4)return [...lines].sort((a,b)=>b.y-a.y||a.x-b.x);
 const gutter=best[0],cross=lines.filter(l=>l.x<gutter-8&&l.x+l.width>gutter+8).sort((a,b)=>b.y-a.y),result:SourceLine[]=[];let top=Infinity;
 const band=(bottom:number)=>{const part=lines.filter(l=>!cross.includes(l)&&l.y<top&&l.y>=bottom);result.push(...part.filter(l=>l.x+l.width/2<gutter).sort((a,b)=>b.y-a.y||a.x-b.x),...part.filter(l=>l.x+l.width/2>=gutter).sort((a,b)=>b.y-a.y||a.x-b.x))};
 for(const l of cross){band(l.y);result.push(l);top=l.y}band(-Infinity);return result;
}
export async function sourceHash(text:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))),n=>n.toString(16).padStart(2,'0')).join('')}
const referenceHeading=/^(?:\d+[. ]*)?(?:references|bibliography|参考文献|参考资料)\s*[:：]?$/i;
const metaHeading=/^(?:conflict of interest|funding|author contributions|publisher.?s note|acknowledg(?:e)?ments|版权声明|出版声明|利益冲突|致谢|作者贡献)\s*[:：]?$/i;
const metadata=/^(?:doi\s*:|https?:\/\/doi\.|©|copyright\b|open access$|edited by$|reviewed by$|correspondence\b|received\s|accepted\s|published\s|issn\b)/i;
export async function extractSourceParagraphs(book:{id:string;name:string;textSource?:unknown},layouts:SourceLayout[]):Promise<OriginalParagraph[]>{
 const edgeCounts=new Map<string,number>(),edge=(s:string)=>s.replace(/\d+/g,'#').replace(/\s+/g,' ').trim();
 for(const p of layouts){const keys=new Set(p.lines.filter(l=>l.y>p.height*.93||l.y<p.height*.06).map(l=>edge(l.text)));for(const k of keys)edgeCounts.set(k,(edgeCounts.get(k)||0)+1)}
 const raw:{page:number;text:string;role:OriginalParagraph['role']}[]=[];let sectionRole:OriginalParagraph['role']='body';
 for(const p of layouts){const lines=orderedSourceLines(p),size=median(lines.map(l=>l.size)),width=median(lines.filter(l=>l.width>80).map(l=>l.width));let text='',previous:SourceLine|undefined;
  const flush=()=>{if(text.trim())raw.push({page:p.page,text:text.trim(),role:sectionRole});text='';previous=undefined};
  for(const l of lines){const value=l.text.replace(/\s+/g,' ').trim();if(!value)continue;
   const repeated=(l.y>p.height*.93||l.y<p.height*.06)&&(edgeCounts.get(edge(value))||0)>=Math.max(2,Math.ceil(layouts.length*.5));
   if(repeated||/^\d+$/.test(value)||metadata.test(value)){flush();raw.push({page:p.page,text:value,role:'metadata'});continue}
   const isHeading=referenceHeading.test(value)||metaHeading.test(value)||value.length<120&&(l.size>size*1.18||/^(?:abstract|introduction|methods?|results?|discussion|conclusion|摘要|引言|研究方法|研究结果|讨论|结论)\s*[:：]?$/i.test(value));
   if(isHeading){flush();sectionRole=referenceHeading.test(value)?'reference':metaHeading.test(value)?'metadata':'body';raw.push({page:p.page,text:value,role:sectionRole==='body'?'heading':sectionRole});continue}
   if(l.size<size*.76&&l.y<p.height*.18){flush();raw.push({page:p.page,text:value,role:'note'});continue}
   const split=previous&&(previous.y-l.y>Math.max(size*1.65,previous.size*1.65)||l.y>previous.y+size||Math.abs(l.x-previous.x)>size*1.2||/[.!?。！？]$/.test(previous.text)&&previous.width<width*.78);
   if(split)flush();text+=(text?' ':'')+value;previous=l;
  }flush();
 }
 const result:OriginalParagraph[]=[],pageCounts=new Map<number,number>();for(const r of raw){let at=0;while(at<r.text.length){let end=Math.min(at+3500,r.text.length);if(end<r.text.length){const match=[...r.text.slice(at,end).matchAll(/[.!?。！？]\s/g)].at(-1);if(match&&match.index!>1500)end=at+match.index!+match[0].length;if(/[\uD800-\uDBFF]/.test(r.text[end-1]))end--}const text=r.text.slice(at,end).trim();at=end;if(!text)continue;const local=pageCounts.get(r.page)||0;pageCounts.set(r.page,local+1);const order=r.page*10000+local,id='p-'+(await sourceHash(JSON.stringify([book.id,r.page,order,text]))).slice(0,24);result.push({id,bookId:book.id,name:book.name,page:r.page,order,text,role:r.role,...(book.textSource?{kind:'text' as const}:{})})}}
 return result;
}
export function textSourceLayouts(pages:{page:number;text:string}[]):SourceLayout[]{return pages.map(p=>{const parts=p.text.split(/\n\s*\n|\n(?=#{1,6}\s)/).filter(s=>s.trim());return {page:p.page,width:600,height:Math.max(800,parts.length*50+200),lines:parts.map((s,i)=>({text:s.replace(/^#{1,6}\s+/,''),x:50,y:Math.max(800,parts.length*50+200)-100-i*50,width:480,size:/^#{1,6}\s/.test(s)?15:10}))}})}
