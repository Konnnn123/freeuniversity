import {uid,type Course,type Data,type LearningActivity,type ScheduleEntry,type Unit} from './model';
import type {Lesson} from './lessonTypes';
import {classroomLessons} from './courseOrganization';
import {lessonReady} from './lessonEngine';
import {entryMinutes} from './studioEngine';

export interface PoolLesson {lesson:Lesson;activity?:LearningActivity;ready:boolean}
export interface PoolChapter {unit:Unit;lessons:PoolLesson[];free:LearningActivity[]}
export interface PoolCourse {course:Course;chapters:PoolChapter[];ready:number;completed:number;total:number}

export function timetableCourses(d:Data):PoolCourse[]{
 return d.courses.map(course=>{
  const rows=classroomLessons(d,course.id).map(lesson=>{
   const activity=d.activities.find(a=>a.courseId===course.id&&a.lessonId===lesson.id);
   return {lesson,activity,ready:!!activity&&(!lesson.pdfTeachingPlan||!!lesson.labMaterialId)&&lessonReady(d,lesson)};
  });
  const free=d.activities.filter(a=>a.courseId===course.id&&!a.lessonId);
  const units=d.units.filter(u=>u.courseId===course.id),chapters:PoolChapter[]=units.map(unit=>({unit,lessons:rows.filter(r=>r.lesson.unitId===unit.id),free:free.filter(a=>d.milestones.some(m=>m.id===a.milestoneId&&m.unitId===unit.id))}));
  const assigned=new Set(chapters.flatMap(c=>c.free.map(a=>a.id))),loose=free.filter(a=>!assigned.has(a.id));
  if(loose.length)chapters.push({unit:{id:'free:'+course.id,courseId:course.id,name:'其他自由任务'},lessons:[],free:loose});
  // PDF chapter order follows its source, and other courses retain saved unit order.
  chapters.sort((a,b)=>{
   const rank=(c:PoolChapter)=>{const saved=units.findIndex(u=>u.id===c.unit.id);return c.lessons.find(r=>r.lesson.pdfTeachingPlan)?.lesson.pdfTeachingPlan?.chapterOrder??(saved<0?Number.MAX_SAFE_INTEGER:saved)};
   return rank(a)-rank(b);
  });
  return {course,chapters:chapters.filter(c=>c.lessons.length||c.free.length),ready:rows.filter(r=>r.ready&&r.lesson.status!=='已完成').length,completed:rows.filter(r=>r.lesson.status==='已完成').length,total:rows.length};
 });
}

export function firstPoolChapter(c:PoolCourse|undefined){return c?.chapters.find(ch=>ch.lessons.some(r=>r.ready&&r.lesson.status!=='已完成'))?.unit.id||c?.chapters[0]?.unit.id||''}

export function activityChapter(d:Data,a:LearningActivity){
 const l=a.lessonId?d.lessons?.find(l=>l.id===a.lessonId):undefined;
 const unitId=l?.unitId||d.milestones.find(m=>m.id===a.milestoneId)?.unitId;
 return d.units.find(u=>u.id===unitId&&u.courseId===a.courseId);
}

export interface ChapterScheduleOptions {days:number;count:number;minutes:number;courseId?:string;unitId?:string;balance:boolean}
export function generateChapterSchedule(d:Data,dates:string[],options:ChapterScheduleOptions):ScheduleEntry[]{
 const {courseId,unitId,balance}=options,days=Math.min(dates.length,Math.max(0,Math.floor(options.days))),count=Math.max(0,Math.floor(options.count)),minutes=Math.max(0,options.minutes);
 if(![days,count,minutes].every(Number.isFinite)||!days||!count||!minutes)return [];
 const scheduled=new Set(d.schedule.filter(s=>dates.includes(s.date)&&s.activityId).map(s=>s.activityId));
 const scheduledLessons=new Set(d.activities.filter(a=>scheduled.has(a.id)&&a.lessonId).map(a=>a.lessonId));
 const queues=timetableCourses(d).filter(g=>g.course.status==='学习中'&&(!courseId||g.course.id===courseId)).map(g=>({course:g.course,rows:g.chapters.filter(ch=>!unitId||ch.unit.id===unitId).flatMap(ch=>ch.lessons).filter(r=>r.ready&&r.lesson.status!=='已完成'&&r.activity&&!scheduled.has(r.activity.id)&&!scheduledLessons.has(r.lesson.id))}));
 const result:ScheduleEntry[]=[];
 for(let i=0;i<days;i++){
  const date=dates[Math.floor(i*dates.length/days)],prior=d.schedule.filter(s=>s.date===date);
  let remaining=Math.max(0,minutes-prior.reduce((n,s)=>n+entryMinutes(d,s),0)),previous='';
  for(let n=prior.length;n<count;n++){
   // Only the first remaining lesson in each course competes for a slot, so a
   // shorter later lesson cannot jump ahead of a long earlier one.
   const eligible=queues.filter(q=>q.rows[0]&&q.rows[0].activity!.minutes<=remaining);
   const q=eligible.find(q=>!balance||q.course.kind!==previous)||eligible[0];if(!q)break;
   const row=q.rows.shift()!,a=row.activity!;result.push({id:uid(),activityId:a.id,date});remaining-=a.minutes;previous=q.course.kind;
  }
 }
 return result;
}
