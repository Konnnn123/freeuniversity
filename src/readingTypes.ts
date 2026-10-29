export type ReadingPhase='question'|'explanation'|'practice';
export type ReadingField='question'|'explanation'|'example'|'boundary';
export interface ReadingState {active:ReadingPhase;phases:Partial<Record<ReadingPhase,'done'|'skipped'>>;completionLogId?:string}
export interface ReadingAnnotation {id:string;field:ReadingField;start:number;end:number;quote:string;prefix:string;suffix:string;style:'highlight'|'underline';color:'yellow'|'green'|'purple';comment:string;createdAt:string}
