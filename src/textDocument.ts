import type {PdfBook} from './bookStore';
import type {TocNode,PdfStructure} from './pdfStructure';
export const TEXT_MAX_BYTES=5*1024*1024;
export interface TextSource {format:'markdown'|'text';characters:number;note?:string;ranges:{from:number;to:number}[]}
export function checkTextFile(file:Pick<File,'size'|'name'>){if(!/\.(md|markdown|txt)$/i.test(file.name))throw new Error('请选择 Markdown 或 TXT 文件');if(file.size>TEXT_MAX_BYTES)throw new Error('文字文件最大支持 5 MB');if(!file.size)throw new Error('文字文件为空')}
export async function readTextFile(file:File){checkTextFile(file);let text:string;try{text=new TextDecoder('utf-8',{fatal:true}).decode(await file.arrayBuffer())}catch{throw new Error('文字编码无法读取，请将文件另存为 UTF-8 后导入。')}if(text.includes('\0'))throw new Error('文件含二进制内容，请选择纯文字文件');if(text.trim().length<40)throw new Error('请至少提供 40 个字符的正文');return text}
export function parseTextDocument(text:string,format:TextSource['format']){
 const headings:{at:number;title:string;level:number}[]=[];let offset=0,fence='',fenceLength=0,tooMany=false;
 for(const line of text.match(/[^\n]*\n|[^\n]+$/g)||[]){const f=/^ {0,3}(`{3,}|~{3,})/.exec(line);if(f){if(!fence){fence=f[1][0];fenceLength=f[1].length}else if(f[1][0]===fence&&f[1].length>=fenceLength&&/^ {0,3}(`+|~+)\s*$/.test(line))fence=''}else if(!fence&&!tooMany&&format==='markdown'){const h=/^ {0,3}(#{1,6})[ \t]+(.+?)[ \t]*$/.exec(line.replace(/\r?\n$/,''));const title=h?.[2].replace(/[ \t]+#+[ \t]*$/,'').trim();if(h&&title)headings.push({at:offset,title:title.slice(0,300),level:h[1].length});if(headings.length>2000){headings.length=0;tooMany=true}}offset+=line.length}
 const starts=[...new Set([0,...headings.map(h=>h.at),text.length])].sort((a,b)=>a-b),ranges:TextSource['ranges']=[],pages:{page:number;text:string}[]=[];
 for(let i=0;i<starts.length-1;i++){let at=starts[i];while(at<starts[i+1]){let end=Math.min(at+6000,starts[i+1]);if(end<starts[i+1]){const paragraph=text.lastIndexOf('\n\n',end);const line=text.lastIndexOf('\n',end);if(paragraph>at+2000)end=paragraph+2;else if(line>at+2000)end=line+1;if(/[\uD800-\uDBFF]/.test(text[end-1])&&/[\uDC00-\uDFFF]/.test(text[end]))end--}ranges.push({from:at,to:end});pages.push({page:pages.length+1,text:text.slice(at,end)});at=end}}
 const nodes:TocNode[]=[],stack:TocNode[]=[];
 for(const [i,h]of headings.entries()){while(stack.length&&(headings[Number(stack.at(-1)!.id.split(':')[1])]?.level||0)>=h.level)stack.pop();const node:TocNode={id:'text:'+i,title:h.title,parentId:stack.at(-1)?.id||null,depth:stack.length,start:ranges.findIndex(r=>r.from===h.at)+1,end:pages.length,samePage:false,rangeSource:'headings'};nodes.push(node);stack.push(node)}
 for(let i=0;i<nodes.length;i++){const next=nodes.slice(i+1).find(n=>n.depth<=nodes[i].depth);nodes[i].end=next?next.start!-1:pages.length}
 // Explicit, non-overlapping teaching scopes preserve title/introduction text.
 let roots=nodes.filter(n=>n.parentId===null);if(roots.length===1){const children=nodes.filter(n=>n.parentId===roots[0].id);if(children.length)roots=children}
 if(roots.length)roots[0].start=1;
 const courseNodeIds:string[]=[];
 const addScopes=(start:number,end:number,title:string,parent:TocNode|null)=>{for(let from=start,i=1;from<=end;from+=3,i++){const id='text-range:'+nodes.length;const node:TocNode={id,title:title+' · 阅读分段 '+i,parentId:parent?.id||null,depth:parent?parent.depth+1:0,start:from,end:Math.min(end,from+2),samePage:false,rangeSource:'learning-segments'};nodes.push(node);courseNodeIds.push(id)}};
 if(!roots.length)addScopes(1,pages.length,'学习材料',null);else for(const n of roots){if(n.end!-n.start!+1>128)addScopes(n.start!,n.end!,n.title,n);else courseNodeIds.push(n.id)}
 // Merge very short scopes into neighbouring text, without deleting any real heading.
 const finalIds:string[]=[];let pending:string[]=[];
 const emit=(ids:string[])=>{if(ids.length===1){finalIds.push(ids[0]);return}const rows=ids.map(id=>nodes.find(n=>n.id===id)!);const n:TocNode={id:'text-merged:'+nodes.length,title:rows.map(n=>n.title).join(' / ').slice(0,300),parentId:null,depth:0,start:rows[0].start,end:rows.at(-1)!.end,samePage:false,rangeSource:'learning-segments'};nodes.push(n);finalIds.push(n.id)};
 for(const id of courseNodeIds){pending.push(id);const first=nodes.find(n=>n.id===pending[0])!,last=nodes.find(n=>n.id===id)!;if(pages.slice(first.start!-1,last.end!).map(p=>p.text).join('').trim().length>=40){emit(pending);pending=[]}}
 if(pending.length){if(finalIds.length)pending.unshift(finalIds.pop()!);emit(pending)}
 const structure:PdfStructure={version:1,readAt:new Date().toISOString(),nodes,pageLabels:null,courseNodeIds:finalIds};
 return {pages,structure,textSource:{format,characters:text.length,ranges,...(tooMany?{note:'标题超过2000项，已保留全文并改按段落分组，避免目录过长。'}:{})} satisfies TextSource};
}
export function validateTextSource(b:PdfBook){if(!b.textSource)return;const s=b.textSource;if(!['markdown','text'].includes(s.format)||!Number.isInteger(s.characters)||s.characters<40||s.characters>TEXT_MAX_BYTES||!Array.isArray(s.ranges)||s.ranges.length!==b.numPages||b.pages.length!==b.numPages)throw new Error('文字资料索引不完整');let offset=0;for(const [i,r]of s.ranges.entries()){const p=b.pages.find(p=>p.page===i+1);if(!r||r.from!==offset||!Number.isInteger(r.to)||r.to<=r.from||!p||p.text.length!==r.to-r.from||p.text.length>6000)throw new Error('文字段落位置与原文不一致');offset=r.to}const scopes=b.structure?.courseNodeIds?.map(id=>b.structure!.nodes.find(n=>n.id===id));let next=1;if(!scopes?.length||scopes.some(n=>{if(!n||n.start!==next||n.end===null||n.end<n.start)return true;next=n.end+1;return false})||next!==b.numPages+1)throw new Error('文字章节未完整覆盖原文');if(offset!==s.characters)throw new Error('文字原文范围不完整')}
