import type {Data} from './model';
import type {Lesson} from './lessonTypes';
export const referenceLesson=(l:Lesson)=>!!l.archivedFromClassroom||!!l.bookId&&!l.labMaterialId;
export const classroomLessons=(d:Data,courseId:string)=>(d.lessons||[]).filter(l=>l.courseId===courseId&&!referenceLesson(l)).sort((a,b)=>a.order-b.order);
export function classroomUnits(d:Data,courseId:string){const ids=new Set(classroomLessons(d,courseId).map(l=>l.unitId));return d.units.filter(u=>u.courseId===courseId&&(ids.has(u.id)||!d.lessons?.some(l=>l.unitId===u.id))).sort((a,b)=>{const order=(id:string)=>d.lessons?.find(l=>l.unitId===id&&l.pdfTeachingPlan)?.pdfTeachingPlan?.chapterOrder??100000;return order(a.id)-order(b.id)})}
