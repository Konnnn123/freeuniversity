import type {CampusObject,Data,LearningActivity} from './model';
import {classroomLessons} from './courseOrganization';

// Destinations match the bottom navigation; map nameplates keep saved building names.
export const campusDestinations=[
 {kind:'schedule',label:'课表',path:'/timetable'},
 {kind:'classroom',label:'课程',path:'/courses'},
 {kind:'library',label:'图书馆',path:'/library'},
 {kind:'museum',label:'成果馆',path:'/museum'},
] as const;
export const campusDestination=(kind:CampusObject['kind'])=>campusDestinations.find(d=>d.kind===kind);
export const coursePath=(id:string)=>'/courses/'+encodeURIComponent(id);
export const courseEditorPath=(id:string)=>coursePath(id)+'/edit-lessons';
export function activityPath(a:Pick<LearningActivity,'id'|'courseId'|'lessonId'>){return a.lessonId?'/lessons/'+encodeURIComponent(a.lessonId):coursePath(a.courseId)+'/tasks/'+encodeURIComponent(a.id)}
export function legacyStudyPath(d:Data,courseId?:string,activityId?:string){
 const course=d.courses.find(c=>c.id===courseId);if(!course)return '/courses';
 if(!activityId)return coursePath(course.id);
 const activity=d.activities.find(a=>a.id===activityId&&a.courseId===course.id);
 return activity?activityPath(activity):coursePath(course.id);
}
export function startCoursePath(d:Data,id:string){
 const course=d.courses.find(c=>c.id===id);if(!course)return '/courses';
 const all=classroomLessons(d,id),lessons=all.filter(l=>!l.pdfTeachingPlan||!!l.labMaterialId),lesson=lessons.find(l=>l.status==='学习中')||lessons.find(l=>l.status!=='已完成')||lessons[0];
 if(lesson)return '/lessons/'+encodeURIComponent(lesson.id);
 if(course.bookId)return '/books/'+encodeURIComponent(course.bookId)+'?course=1';
 return all.length?coursePath(id):coursePath(id)+'/study';
}
export function navigationSection(path:string){
 if(/^\/(courses|course-planner|lessons|studio|classroom|prep)(\/|$)/.test(path))return '/courses';
 if(/^\/(library|books|materials)(\/|$)/.test(path))return '/library';
 return path;
}

export function courseStudyTarget(d:Data,id:string,activityId?:string,explicitFree=false){
 const course=d.courses.find(c=>c.id===id);if(!course)return '/courses';
 if(activityId){const activity=d.activities.find(a=>a.id===activityId&&a.courseId===id);return !activity?coursePath(id):activity.lessonId?activityPath(activity):null}
 if(explicitFree)return null;
 const target=startCoursePath(d,id);return target===coursePath(id)+'/study'?null:target;
}
