import type {bookTeachingProgress} from './bookTeachingCourse';
export interface BookTaskState {bookId:string;name:string;mode:'outline'|'lessons';status:'running'|'completed'|'issues'|'paused'|'failed';stage:string;error?:string;failures?:{chapter:string;message:string}[];startedAt:number;progress?:ReturnType<typeof bookTeachingProgress>}
export interface BookTaskContext {signal:AbortSignal;update:(patch:Partial<BookTaskState>)=>void}
export function createBookTaskRegistry(){
 let rows:BookTaskState[]=[];const empty:BookTaskState[]=[],listeners=new Set<()=>void>(),jobs=new Map<string,{controller:AbortController;promise:Promise<void>}>();const emit=()=>listeners.forEach(f=>f());
 const update=(bookId:string,patch:Partial<BookTaskState>)=>{rows=rows.map(r=>r.bookId===bookId?{...r,...patch,bookId}:r);emit()};
 return {subscribe:(f:()=>void)=>{listeners.add(f);return()=>{listeners.delete(f)}},getSnapshot:()=>rows,getServerSnapshot:()=>empty,isRunning:(id:string)=>jobs.has(id),
 start(initial:Pick<BookTaskState,'bookId'|'name'|'mode'>,work:(ctx:BookTaskContext)=>Promise<Partial<BookTaskState>>){const old=jobs.get(initial.bookId);if(old)return old.promise;const controller=new AbortController();rows=[...rows.filter(r=>r.bookId!==initial.bookId),{...initial,status:'running',stage:'正在开始备课…',startedAt:Date.now()}];
 const promise=Promise.resolve().then(async()=>{try{const result=await work({signal:controller.signal,update:patch=>update(initial.bookId,patch)});update(initial.bookId,{status:'completed',...result})}catch(e){const paused=(e as Error).name==='AbortError'||controller.signal.aborted;update(initial.bookId,{status:paused?'paused':'failed',stage:paused?'已暂停，已完成部分保留':'本轮未完成，已完成部分保留',error:paused?undefined:(e as Error).message})}finally{jobs.delete(initial.bookId);emit()}});jobs.set(initial.bookId,{controller,promise});emit();return promise},
 pause(bookId:string){const job=jobs.get(bookId);if(job){update(bookId,{stage:'正在暂停并保存进度…'});job.controller.abort()}},dismiss(bookId:string){if(jobs.has(bookId))return;rows=rows.filter(r=>r.bookId!==bookId);emit()}
 };
}
export const bookTaskRegistry=createBookTaskRegistry();
