import type {Data} from './model';
export type ReadingAidMode='translate'|'explain';
export interface ReadingAidInput {mode:ReadingAidMode;quote:string;context:string;teaching:string}
export function readingAidInput(mode:ReadingAidMode,text:string,start:number,end:number,teaching=''):ReadingAidInput{
 if(!Number.isInteger(start)||!Number.isInteger(end)||start<0||end<=start||end>text.length||end-start>5000)throw new Error('请选择5000字符以内的原文');
 const quote=text.slice(start,end);if(!quote.trim())throw new Error('请先选中一段原文');
 return {mode,quote,context:text.slice(Math.max(0,start-1200),Math.min(text.length,end+1200)),teaching:mode==='explain'?teaching.slice(0,3000):''};
}
export async function readingAidKey(input:ReadingAidInput){const raw=JSON.stringify(['zh-CN',1,input.mode,input.quote,input.context,input.teaching]),hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(raw));return 'reading-aid:'+Array.from(new Uint8Array(hash),n=>n.toString(16).padStart(2,'0')).join('')}
export function cachedReadingAid(data:Pick<Data,'drafts'>,key:string){try{const v=JSON.parse(data.drafts[key]||'null');return v?.version===1&&typeof v.text==='string'&&v.text.trim()&&v.text.length<=12000?v.text as string:''}catch{return ''}}
export function saveReadingAid(data:Data,key:string,text:string){if(!/^reading-aid:[a-f0-9]{64}$/.test(key)||!text.trim()||text.length>12000)throw new Error('没有收到完整的阅读辅助结果');data.drafts[key]=JSON.stringify({version:1,text,at:new Date().toISOString()});const keys=Object.keys(data.drafts).filter(k=>k.startsWith('reading-aid:'));if(keys.length>300){const oldest=keys.filter(k=>k!==key).sort((a,b)=>{try{return String(JSON.parse(data.drafts[a]).at||'').localeCompare(String(JSON.parse(data.drafts[b]).at||''))}catch{return 0}});oldest.slice(0,keys.length-300).forEach(k=>delete data.drafts[k])}}
export function hasForeignText(text:string){return (text.match(/\p{L}/gu)||[]).filter(c=>! /\p{Script=Han}/u.test(c)).length>=5}
export interface ComparePosition {open:boolean;bookId?:string;page?:number;view?:'text'|'pdf'}
export const comparePositionKey=(id:string)=>'source-compare:'+id;
export function comparePosition(data:Pick<Data,'drafts'>,id:string):ComparePosition{try{const v=JSON.parse(data.drafts[comparePositionKey(id)]||'null');return v&&typeof v.open==='boolean'?{open:v.open,bookId:typeof v.bookId==='string'?v.bookId:undefined,page:Number.isInteger(v.page)&&v.page>0?v.page:undefined,view:v.view==='pdf'?'pdf':'text'}:{open:false}}catch{return {open:false}}}
