import type {ChapterJob} from './bookLearning';
export interface ChapterVersion {id:string;createdAt:string;instruction:string;job:ChapterJob}
export interface ChapterRevision {instruction:string;createdAt:string;job:ChapterJob}
export interface BookGeneration {id:string;scope:'book'|'chapter';mode:'missing'|'regenerate';instruction:string;syncCourse:boolean;nodeIds:string[];unresolved:string[];items:Record<string,{status:'pending'|'running'|'done'|'partial'|'failed';message?:string}>;status:'running'|'paused'|'completed'|'issues';activeNodeId?:string;stage:string;createdAt:string;updatedAt:string;elapsedMs:number}
