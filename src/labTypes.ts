export interface ConceptCard {term:string;essence:string;analogy:string;boundary:string;notYet:string;action:string;paragraphs:number[]}
export interface ChoiceQuestion {prompt:string;options:string[];correct:number;feedback:string[];paragraphs:number[]}
export interface LessonPreparation {mode:'web'|'intro-guide';sourceUrls:string[];notice:string}
export interface ShortLesson {preparation?:LessonPreparation;title:string;question:string;explanation:string;example:string;boundary:string;paragraphs:number[];quiz:ChoiceQuestion[]}
export interface MaterialAnalysis {summary:string;highlights:{text:string;paragraph:number}[];concepts:ConceptCard[];lessons:ShortLesson[];expressions:{original:string;meaning:string;context:string;paragraph:number}[];report:string}
export interface ReadingMaterial {pdfTeaching?:{nodeId:string;draftId:string;index:number;version:1;pages:number[]};courseGenerated?:boolean;id:string;title:string;text:string;url:string;goal:string;exampleDomain:string;createdAt:string;notes:string;analysis?:MaterialAnalysis;provenance?:'AI 生成，待核对'|'原创演示';model?:string;courseId?:string;resourceId:string;reportDraft?:string;reportFeedback?:ReportFeedback;context?:MaterialContext;sourceFile?:{name:string;pages:number;from:number;to:number;bookId?:string}}
export interface ReadingLab {materials:ReadingMaterial[]}
export interface ContextSource {language?:string;title:string;url:string;snippet:string;date:string;publisher:string;kind:string;provider:string;retrievedAt:string}
export interface MaterialContext {sources:ContextSource[];overview:string;items:{source:number;connection:string;limits:string}[]}
export interface ReportFeedback {strengths:string[];gaps:string[];reasoning:string[];revisions:string[];paragraphs:number[]}
