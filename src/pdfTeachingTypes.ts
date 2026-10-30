import type {BookChunk} from './bookStore';
import type {ShortLesson} from './labTypes';
import type {LessonIssue} from './lessonContract';
export interface PdfTeachingOutline {title:string;intro:string;lessons:{title:string;question:string;focus:string;segmentIds:string[]}[]}
export interface PdfLessonDraft {value:unknown;issues:LessonIssue[];createdAt:string;attempts:number}
export interface PdfLessonAlignment {index:number;at:string;previous:PdfTeachingOutline['lessons'][number];next:PdfTeachingOutline['lessons'][number];reason:string;evidence:string[]}
export interface PdfTeachingDraft {outlineResponses?:Record<string,{value:unknown;issues:{field:string;reason:string}[];at:string}>;id:string;nodeId:string;createdAt:string;instruction:string;level:string;minutes:number;segments:BookChunk[];alignments?:PdfLessonAlignment[];outlineSlots?:Record<string,PdfTeachingOutline>;outlineParts?:PdfTeachingOutline[];outline?:PdfTeachingOutline;lessonDrafts?:Record<string,PdfLessonDraft>;lessons:ShortLesson[]}
export interface BookTeachingFailure {runId:string;release:string;at:string;phase:'source'|'outline'|'lesson'|'repair'|'align'|'commit';lesson?:number;code:string;fields:string[]}
export interface BookTeachingPlan {run?:{id:string;release:string;startedAt:string};errorDetails?:Record<string,BookTeachingFailure>;lastMode?:'outline'|'lessons';nodeIds:string[];unresolved:string[];createdAt:string;instruction:string;level:string;minutes:number;status:'paused'|'running'|'completed'|'issues';stage:string;errors:Record<string,string>}
