import {useEffect,useRef} from 'react';
import type {ReadingAnnotation,ReadingField} from './readingTypes';
import {anchorAnnotation,readingDocument,type ReadingBlock} from './readingDocument';
import {semanticParts} from './conceptLearning';
export interface ReadingSelection {field:ReadingField;source:string;start:number;end:number;quote:string;x:number;y:number}
function BlockText({block,annotations,emphasis,onOpen,terms=[]}:{block:ReadingBlock;annotations:{annotation:ReadingAnnotation;start:number;end:number}[];emphasis:boolean;terms?:string[];onOpen:(a:ReadingAnnotation)=>void}){
 let at=0;const runs=block.runs.map(r=>{const start=at;at+=r.text.length;return {...r,start,end:at}});at=0;const semantics=semanticParts(block.text).map(r=>{const start=at;at+=r.text.length;return {...r,start,end:at}});
 const marks=annotations.filter(a=>a.end>block.start&&a.start<block.end).map(a=>({...a,start:Math.max(0,a.start-block.start),end:Math.min(block.text.length,a.end-block.start)}));
 const termRanges=terms.flatMap(term=>{const ranges:{start:number;end:number}[]=[];if(!term)return ranges;let at=block.text.indexOf(term);while(at>=0){ranges.push({start:at,end:at+term.length});at=block.text.indexOf(term,at+term.length)}return ranges});
 const points=[...new Set([0,block.text.length,...termRanges.flatMap(r=>[r.start,r.end]),...runs.flatMap(r=>[r.start,r.end]),...semantics.flatMap(r=>[r.start,r.end]),...marks.flatMap(r=>[r.start,r.end])])].sort((a,b)=>a-b);
 return <>{points.slice(0,-1).map((start,i)=>{const end=points[i+1],text=block.text.slice(start,end),bold=runs.find(r=>r.start<=start&&r.end>=end)?.bold||termRanges.some(r=>r.start<=start&&r.end>=end),kind=semantics.find(r=>r.start<=start&&r.end>=end)?.kind||'plain';const mark=marks.filter(m=>m.start<=start&&m.end>=end).at(-1);const content=bold?<strong>{text}</strong>:text;return mark?<mark key={i} className={'reader-mark mark-'+mark.annotation.color+' mark-'+mark.annotation.style} role="button" tabIndex={0} title={mark.annotation.comment||'查看或评论这条标注'} onClick={()=>{if(window.getSelection()?.isCollapsed===false)return;onOpen(mark.annotation)}} onKeyDown={e=>{if(e.key==='Enter')onOpen(mark.annotation)}}>{content}</mark>:<span className={emphasis?'reading-'+kind:undefined} key={i}>{content}</span>})}</>
}
export function AnnotatedReading({field,text,annotations,onSelect,onOpen,emphasis=true,terms=[]}:{field:ReadingField;text:string;annotations:ReadingAnnotation[];onSelect:(s:ReadingSelection)=>void;onOpen:(a:ReadingAnnotation)=>void;emphasis?:boolean;terms?:string[]}){
 const root=useRef<HTMLDivElement>(null),doc=readingDocument(text);
 const readSelection=()=>{const sel=window.getSelection();if(!sel||sel.isCollapsed||!sel.rangeCount||!root.current)return;const r=sel.getRangeAt(0);if(!root.current.contains(r.startContainer)||!root.current.contains(r.endContainer))return;
 const block=(node:Node)=>(node.nodeType===Node.ELEMENT_NODE?node as Element:node.parentElement)?.closest<HTMLElement>('[data-reading-offset]');const first=block(r.startContainer),last=block(r.endContainer);if(!first||!last)return;
 const offset=(el:HTMLElement,node:Node,position:number)=>{const before=document.createRange();before.selectNodeContents(el);before.setEnd(node,position);return Number(el.dataset.readingOffset)+before.toString().length};
 const start=offset(first,r.startContainer,r.startOffset),end=offset(last,r.endContainer,r.endOffset);const quote=doc.text.slice(start,end);if(!quote.trim()||quote.length>5000)return;const rect=r.getBoundingClientRect();onSelect({field,source:text,start,end,quote,x:rect.left,y:rect.bottom});
 };
 useEffect(()=>{const selected=()=>{if(root.current?.contains(window.getSelection()?.anchorNode||null))readSelection()};document.addEventListener('selectionchange',selected);return()=>document.removeEventListener('selectionchange',selected)});
 const anchored=annotations.filter(a=>a.field===field).flatMap(annotation=>{const p=anchorAnnotation(doc.text,annotation);return p?[{annotation,...p}]:[]});
 return <div ref={root} className="annotated-reading reading-body" data-reading-field={field} title="选中文字可高亮、划线或评论" onPointerUp={readSelection} onKeyUp={readSelection}>{doc.blocks.map((b,i)=>{const content=<BlockText block={b} annotations={anchored} onOpen={onOpen} emphasis={emphasis} terms={terms}/>;return b.kind==='heading'?<h3 key={i} data-reading-offset={b.start}>{content}</h3>:b.kind==='list'?<p key={i} className="reading-list-line" data-reading-offset={b.start}>{content}</p>:<p key={i} data-reading-offset={b.start}>{content}</p>})}</div>
}
