import {appRelease} from '../server/app-release.mjs';
import type {BookTeachingFailure} from './pdfTeachingTypes';
export const phaseName={source:'读取原文',outline:'设计大纲',lesson:'准备课时',repair:'补修字段',align:'核对原文与课题',commit:'加入课程'};
export function bookFailure(error:unknown,phase:BookTeachingFailure['phase'],runId:string,index?:number):BookTeachingFailure {
 const e=error as {code?:string;issues?:{field:string}[]};
 return {runId,release:appRelease,at:new Date().toISOString(),phase,...(index===undefined?{}:{lesson:index+1}),code:typeof e?.code==='string'?e.code.slice(0,80):'client_error',fields:Array.isArray(e?.issues)?e.issues.map(i=>i.field).slice(0,20):[]};
}
// This report contains only fixed field paths/counts/version, never the book,
// model response, source text, title or API key. A logging outage cannot fail a lesson.
export async function reportBookFailure(failure:BookTeachingFailure){try{await fetch('/api/learning-diagnostic',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(failure),signal:AbortSignal.timeout(4000)})}catch{/* The full local diagnostic remains on the saved task. */}}
