import type {Kind,Mode} from './model';
import type {ReadingAnnotation,ReadingState} from './readingTypes';
export type LearningRoute='循序课程'|'主题探索';
export type ResourceVerification='具体资源已核实'|'仅入口已核实'|'内置指南'|'待核实';
export interface ResourceDetails {source?:string;language?:string;difficulty?:string;account?:'不需要'|'需要'|'可能需要';free?:'免费'|'部分免费'|'待确认';verification?:ResourceVerification;verifiedAt?:string;scope?:string;guide?:string}
export interface Lesson {archivedFromClassroom?:boolean;
 pdfTeachingPlan?:{bookId:string;nodeId:string;draftId:string;index:number;chapterOrder:number};
 readingState?:ReadingState;annotations?:ReadingAnnotation[];
 bookId?:string;bookNodeId?:string;
 id:string;courseId:string;unitId:string;title:string;description:string;objectives:string[];minutes:number;difficulty:string;kind:Kind;mode:Mode;
 order:number;prerequisites:string[];nextLessonId:string;milestoneIds:string[];activityIds:string[];
 steps:{id:string;text:string}[];resourceLinks:{resourceId:string;scope:string;optional?:boolean}[];
 exercises:{id:string;prompt:string;hint:string}[];completionCriteria:string[];
 status:'未开始'|'学习中'|'已完成';stepState:Record<string,'完成'|'跳过'>;answers:Record<string,string>;notes:string;criteriaState:Record<string,boolean>;
 packageId?:string;labMaterialId?:string;labLessonIndex?:number;
}
// A future generator produces reviewable content; it cannot mutate a user's archive.
export interface CourseContentProvider {generate(request:{topic:string;route:LearningRoute}):Promise<{lessons:Lesson[];sourceNotes:string[]}>}
