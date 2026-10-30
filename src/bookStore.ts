import {restoreTeachingIdentities} from './pdfTeachingIdentity';
import {validateDiscovery,type PdfDiscovery} from './pdfDiscovery';
import {validatePdfTeaching} from './pdfTeachingEngine';
import type {BookTeachingPlan,PdfTeachingDraft} from './pdfTeachingTypes';
import {validateBookGeneration} from './bookGenerationValidation';
import {checkExploration,type ConceptExploration} from './conceptLearning';
import type {MaterialContext} from './labTypes';
import {validateBookLearning} from './bookLearning';
import {checkStructure,type PdfStructure} from './pdfStructure';
import type {BookOverview,ChapterJob,BookDiagnostic,SavedNarrative} from './bookLearning';
import Dexie from 'dexie';
import type {BookGeneration,ChapterRevision,ChapterVersion} from './bookGenerationTypes';
import {uid} from './model';
import {bookTaskRegistry} from './bookTaskRegistry';
export interface BookChunk {id:string;from:number;to:number;text:string;summary?:string;topics?:{title:string;description:string;from:number;to:number}[]}
export interface PdfBook {teachingIdentityBackup?:{at:string;drafts:unknown};discovery?:PdfDiscovery;teachingCourse?:BookTeachingPlan;teachingDrafts?:Record<string,PdfTeachingDraft>;generation?:BookGeneration;chapterRevisions?:Record<string,ChapterRevision>;chapterHistory?:Record<string,ChapterVersion[]>;id:string;name:string;createdAt:string;numPages:number;pages:{page:number;text:string}[];chunks:BookChunk[];extracted:number;currentPage:number;error?:string;structure?:PdfStructure;overview?:BookOverview;overviewDraft?:(SavedNarrative&{pages:number[]});chapterJobs?:Record<string,ChapterJob>;diagnostic?:BookDiagnostic}
const db=new Dexie('free-university-books');db.version(1).stores({books:'id',files:'id'});
export const listBooks=()=>db.table<PdfBook>('books').toArray();
export async function getBook(id:string){const raw=await db.table<PdfBook>('books').get(id);if(!raw)return;const restored=restoreTeachingIdentities(raw);if(!restored.changed)return raw;let result=restored.book;await db.transaction('rw',db.table('books'),async()=>{const latest=await db.table<PdfBook>('books').get(id);if(!latest)return;const next=restoreTeachingIdentities(latest);result=next.book;if(next.changed)await db.table('books').put(next.book)});return result}
export const getBookFile=async(id:string)=>(await db.table('files').get(id))?.blob as Blob|undefined;
const bookListeners=new Set<(book:PdfBook)=>void>();
export const subscribeBookUpdates=(listener:(book:PdfBook)=>void)=>{bookListeners.add(listener);return()=>{bookListeners.delete(listener)}};
export async function saveBook(book:PdfBook){await db.table('books').put(structuredClone(book));for(const notify of bookListeners){try{notify(structuredClone(book))}catch{/* A view cannot interrupt persisted generation. */}}}
// A background task only owns course-generation fields. Preserve reading position,
// chapter analyses and any other book edits made since the task started.
export async function saveBookTeaching(book:PdfBook){await db.transaction('rw',db.table('books'),async()=>{const latest=await getBook(book.id);if(!latest)throw new Error('原书已移除，后台任务已停止');const pages=[...new Map([...book.pages,...latest.pages].map(p=>[p.page,p])).values()].sort((a,b)=>a.page-b.page);const next={...latest,pages,teachingCourse:book.teachingCourse,teachingDrafts:book.teachingDrafts};await saveBook(next);book.pages=pages})}
export async function importBook(file:File,numPages:number){const id=uid(),book:PdfBook={id,name:file.name,createdAt:new Date().toISOString(),numPages,pages:[],chunks:[],extracted:0,currentPage:1};await db.transaction('rw',db.table('books'),db.table('files'),async()=>{await db.table('files').put({id,blob:file});await db.table('books').put(book)});return id}
export function buildBookChunks(pages:{page:number;text:string}[],limit=14000){const chunks:BookChunk[]=[];let text='',from=0,to=0;const flush=()=>{if(text.trim())chunks.push({id:`${from}-${to}-${chunks.length}`,from,to,text});text='';from=0};for(const p of pages){if(!p.text.trim())continue;const fragments=p.text.match(new RegExp(`[\\s\\S]{1,${limit-80}}`,'g'))||[];for(const piece of fragments){const block=`[PDF 第 ${p.page} 页]\n${piece}\n\n`;if(text.length+block.length>limit)flush();if(!from)from=p.page;to=p.page;text+=block}}flush();return chunks}
export function checkBookTopics(value:unknown,chunk:BookChunk){const v=value as {summary:string;topics:{title:string;description:string;from:number;to:number}[]};if(!v||typeof v.summary!=='string'||!v.summary.trim()||v.summary.length>2500||!Array.isArray(v.topics)||v.topics.length>8||!v.topics.length||v.topics.some(t=>typeof t.title!=='string'||typeof t.description!=='string'||!Number.isInteger(t.from)||!Number.isInteger(t.to)||t.from<chunk.from||t.to>chunk.to||t.to<t.from))throw new Error('目录结果缺少有效页码，请重试该分段');return v}
export function validateBookIndex(input:unknown){const b=input&&typeof input==='object'?restoreTeachingIdentities(input as PdfBook).book:input as PdfBook;if(!b||typeof b.id!=='string'||typeof b.name!=='string'||typeof b.createdAt!=='string'||!Number.isInteger(b.numPages)||b.numPages<1||b.numPages>50000||!Number.isInteger(b.extracted)||b.extracted<0||b.extracted>b.numPages||!Number.isInteger(b.currentPage)||b.currentPage<1||b.currentPage>b.numPages||!Array.isArray(b.pages)||b.pages.some(p=>!Number.isInteger(p.page)||p.page<1||p.page>b.numPages||typeof p.text!=='string'||p.text.length>100000)||new Set(b.pages.map(p=>p.page)).size!==b.pages.length||!Array.isArray(b.chunks)||b.chunks.some(c=>typeof c.id!=='string'||typeof c.text!=='string'||c.text.length>24000||!Number.isInteger(c.from)||!Number.isInteger(c.to)||c.from<1||c.to<c.from||c.to>b.numPages))throw new Error('PDF 索引文件格式不正确');if(b.structure)checkStructure(b.structure,b.numPages);if(b.discovery)validateDiscovery(b.discovery,b.numPages);validateBookLearning(b);validateBookGeneration(b);validatePdfTeaching(b);return structuredClone(b)}
export async function restoreBookIndex(input:unknown){const b=validateBookIndex(input);b.id=uid();await saveBook(b);return b.id}
export async function attachBookFile(id:string,file:File){const b=await getBook(id);if(!b)throw new Error('图书不存在');await db.table('files').put({id,blob:file})}

export async function saveBookConcept(id:string,nodeId:string,term:string,value:ConceptExploration&{context?:MaterialContext}){checkExploration(value);await db.transaction("rw",db.table("books"),async()=>{const book=await getBook(id);const job=book?.chapterJobs?.[nodeId];if(!book||!job)throw new Error("章节已不可用，未覆盖数据");job.explorations??={};job.explorations[term]=structuredClone(value);await saveBook(book)});return (await getBook(id))!}

export async function deleteBook(id:string){if(bookTaskRegistry.isRunning(id))throw new Error('请先暂停这本书的后台备课，再删除原PDF');await db.transaction("rw",db.table("books"),db.table("files"),async()=>{await db.table("books").delete(id);await db.table("files").delete(id)})}
