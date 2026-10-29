import type {ReadingAnnotation} from './readingTypes';
export interface ReadingRun {text:string;bold:boolean}
export interface ReadingBlock {kind:'heading'|'paragraph'|'list';text:string;runs:ReadingRun[];start:number;end:number}
// Render a small, safe Markdown subset. Offsets refer to readable text, never
// Markdown markup or HTML. This keeps selection anchors stable across formatting.
export function readingDocument(source:string){
 const blocks:ReadingBlock[]=[];let offset=0;
 const chunks=source.replace(/\r\n/g,'\n').replace(/^```(?:markdown|md)?\s*\n?|\n?```$/g,'').split(/\n\s*\n|\n(?=\s*(?:#{1,6}\s|[-*]\s|\d+[.、]\s))/).filter(x=>x.trim());
 for(let chunk of chunks){chunk=chunk.trim();const heading=/^#{1,6}\s+/.test(chunk),list=/^(?:[-*]|\d+[.、])\s+/.test(chunk);chunk=chunk.replace(/^#{1,6}\s+/,'').replace(/^(?:[-*]|\d+[.、])\s+/,'').replace(/\n/g,' ');
 const runs:ReadingRun[]=[];for(const part of chunk.split(/(\*\*[^*]+\*\*|__[^_]+__)/g)){if(!part)continue;const bold=/^(?:\*\*|__)/.test(part);runs.push({text:bold?part.slice(2,-2):part,bold})}
 const text=runs.map(r=>r.text).join('');if(!text)continue;
 const breaks=[0];if(!heading&&!list&&text.length>320)for(const sentence of text.matchAll(/[。！？]\s*/g)){const end=sentence.index!+sentence[0].length;if(end-breaks.at(-1)!>=180&&text.length-end>60)breaks.push(end)}breaks.push(text.length);
 for(let i=0;i<breaks.length-1;i++){const from=breaks[i],to=breaks[i+1];let at=0;const partRuns=runs.flatMap(r=>{const start=at;at+=r.text.length;return at>from&&start<to?[{text:r.text.slice(Math.max(0,from-start),Math.min(r.text.length,to-start)),bold:r.bold}]:[]});const part=text.slice(from,to);blocks.push({kind:heading?'heading':list?'list':'paragraph',text:part,runs:partRuns,start:offset,end:offset+part.length});offset+=part.length+2;}
 }return {blocks,text:blocks.map(b=>b.text).join('\n\n')};
}
export function anchorAnnotation(text:string,a:ReadingAnnotation):{start:number;end:number}|null{
 if(!a.quote.trim())return null;
 const contextMatches=(i:number)=>(!a.prefix||text.slice(Math.max(0,i-a.prefix.length),i)===a.prefix)&&(!a.suffix||text.slice(i+a.quote.length,i+a.quote.length+a.suffix.length)===a.suffix);
 if(text.slice(a.start,a.end)===a.quote&&contextMatches(a.start))return {start:a.start,end:a.end};
 // A revised explanation may move a quote. Reattach only a uniquely identifiable
// occurrence; ambiguous or deleted selections remain in the annotation list.
 const matches:number[]=[];let at=text.indexOf(a.quote);while(at>=0){matches.push(at);at=text.indexOf(a.quote,at+1)}
 const contextual=matches.filter(contextMatches);
 const start=contextual.length===1?contextual[0]:matches.length===1?matches[0]:-1;return start<0?null:{start,end:start+a.quote.length};
}
