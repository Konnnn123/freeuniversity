import type {ShortLesson} from './labTypes';
export type MaterialKind='auto'|'paper'|'book'|'report'|'guide';
export type ReadingDepth='quick'|'standard'|'deep';
export interface OriginalParagraph {id:string;bookId:string;name:string;page:number;order:number;text:string;role:'body'|'heading'|'reference'|'metadata'|'note';kind?:'text'}
export interface BilingualParagraph extends OriginalParagraph {zh?:string;translationKey?:string}
export interface TeachingSection {id:string;title:string;text:string;paragraphIds:string[]}
export interface PreparedUnit {title:string;lessons:{title:string;question:string;focus:string;paragraphIds:string[]}[]}
export interface PreparedOutline {title:string;intro:string;reason:string;kind:Exclude<MaterialKind,'auto'>;units:PreparedUnit[]}
export interface PreparedCoursePlan {version:1;id:string;createdAt:string;kind:MaterialKind;depth:ReadingDepth;goal:string;level:string;minutes:number;sourceSelections?:Record<string,PreparedSourceSelection>;instruction?:string;outlinePending?:{part:number;value:unknown;issue?:string};outlineParts?:PreparedOutline[];bilingualReady?:boolean;ranges:{bookId:string;from:number;to:number}[];paragraphIds?:string[];notes:Record<string,string>;outline?:PreparedOutline;lessons:Record<string,ShortLesson>;pending?:Record<string,unknown>;error?:string;adoptedCourseId?:string;replaces:boolean}
export interface PreparedTranslation {text:string;at:string}

export interface PreparedSourceSelection {key:string;picks:Record<string,string[]>;selected?:string[];failures?:Record<string,{value:unknown;issue?:string}>}
