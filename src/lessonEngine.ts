import {syncChapterRewards} from './rewardEngine';
import {referenceLesson} from './courseOrganization';
import {recordStudy,uid,validateData,type Data,type Course,type Resource} from './model';
import {coursePackages,type CoursePackage} from './coursePackages';
import {packageResources} from './packageResources';
import {createSeed} from './seed';
import type {Lesson} from './lessonTypes';
export const lessonsFor=(d:Data,courseId:string)=>(d.lessons||[]).filter(l=>l.courseId===courseId).sort((a,b)=>a.order-b.order);
export const resourceLessons=(d:Data,id:string)=>(d.lessons||[]).filter(l=>l.resourceLinks.some(r=>r.resourceId===id));
export const resourceCourses=(d:Data,r:Resource)=>d.courses.filter(c=>c.id===r.courseId||resourceLessons(d,r.id).some(l=>l.courseId===c.id));
export function resourceReady(r:Resource|undefined){return !!r&&((r.verification==='内置指南'&&!!r.guide?.trim())||(r.verification==='具体资源已核实'&&/^https?:/.test(r.url)))}
export function lessonReady(d:Data,l:Lesson){if(referenceLesson(l))return false;return l.steps.length>0&&l.completionCriteria.length>0&&l.resourceLinks.some(ref=>resourceReady(d.resources.find(r=>r.id===ref.resourceId)))&&l.resourceLinks.filter(ref=>!ref.optional).every(ref=>resourceReady(d.resources.find(r=>r.id===ref.resourceId)))}
export function readiness(d:Data,l:Lesson){if(l.pdfTeachingPlan&&!l.labMaterialId)return '大纲已确定 · 内容待备课';if(referenceLesson(l))return '原书参考资料';const pdf=d.readingLab?.materials.find(m=>m.id===l.labMaterialId&&m.pdfTeaching);if(pdf)return '原书小课已备好 · 可划线与评论';const material=d.readingLab?.materials.find(m=>m.id===l.labMaterialId&&m.courseGenerated);if(material){const mode=material.analysis?.lessons[l.labLessonIndex??l.order]?.preparation?.mode;return mode==='intro-guide'?'AI基础导学就绪 · 延伸资料可选':mode==='web'?'网络资料讲解就绪 · 来源见资源区':'入门讲解就绪 · 来源见资源区';}return lessonReady(d,l)?l.resourceLinks.some(ref=>d.resources.find(r=>r.id===ref.resourceId)?.verification==='仅入口已核实')?'内置指南就绪 · 外部仅入口':'资料已准备':'待补充资源'}
export function recommendedLessons(d:Data,courseId=''){
 return d.courses.filter(c=>(!courseId||c.id===courseId)&&c.status==='学习中').flatMap(c=>{
  const available=lessonsFor(d,c.id).filter(l=>l.status!=='已完成'&&lessonReady(d,l));
  if(c.learningRoute==='循序课程')return available.filter(l=>l.prerequisites.every(id=>d.lessons?.find(x=>x.id===id)?.status==='已完成')).slice(0,1);
  return available;
 });
}
export function poolActivities(d:Data,free=false){const ids=new Set(recommendedLessons(d).flatMap(l=>l.activityIds));return d.activities.filter(a=>!a.completed&&(free?!a.lessonId:ids.has(a.id))&&d.courses.some(c=>c.id===a.courseId&&c.status==='学习中'))}
export function importPackage(d:Data,p:CoursePackage,existing?:Course){
 d.lessons??=[];
 if(d.courses.some(c=>c.packageId===p.id)&&!existing)return d.courses.find(c=>c.packageId===p.id)!.id;
 const base=createSeed();const template=base.courses.find(c=>c.code===p.code)!;
 const c=existing||{...template,id:uid(),seed:false};
 if(!existing){d.courses.push(c);for(const u of base.units.filter(u=>u.courseId===template.id)){const unitId=uid();d.units.push({id:unitId,courseId:c.id,name:u.name});for(const m of base.milestones.filter(m=>m.unitId===u.id))d.milestones.push({...m,id:uid(),unitId})}}
 if(c.packageId===p.id&&d.lessons.some(l=>l.courseId===c.id&&l.packageId===p.id))return c.id;
 c.packageId=p.id;c.learningRoute=p.route;
 const originalUnits=base.units.filter(u=>u.courseId===template.id);
 const units=d.units.filter(u=>u.courseId===c.id);
 const lessonIds=p.lessons.map((_,i)=>`lesson-${c.id}-${p.id}-${i}`);
 p.lessons.forEach((spec,i)=>{
  let unit=units[spec.unit];
  if(!unit){unit={id:uid(),courseId:c.id,name:originalUnits[spec.unit].name};d.units.push(unit);units[spec.unit]=unit}
  const id=lessonIds[i];if(d.lessons!.some(l=>l.id===id))return;
  const milestoneIds=spec.nodes.map(name=>{let node=d.milestones.find(m=>m.unitId===unit.id&&m.name===name);if(!node){node={id:uid(),unitId:unit.id,name,status:'未开始'};d.milestones.push(node)}return node.id});
  const activityId=`lesson-activity-${id}`;
  const resourceLinks=spec.resources.map(([key,scope])=>{const resource=packageResources.find(r=>r.id===`pack-${key}`);if(!resource)throw new Error(`课程包资源缺失：${key}`);if(!d.resources.some(r=>r.id===resource.id))d.resources.push(structuredClone(resource));return {resourceId:resource.id,scope,optional:resource.verification==='仅入口已核实'}});
  const lesson:Lesson={id,courseId:c.id,unitId:unit.id,title:spec.title,description:spec.description,objectives:[...spec.objectives],minutes:spec.minutes,difficulty:spec.difficulty,kind:c.kind,mode:spec.mode,order:i,prerequisites:p.route==='循序课程'&&i>0?[lessonIds[i-1]]:[],nextLessonId:lessonIds[i+1]||'',milestoneIds,activityIds:[activityId],steps:spec.steps.map((text,j)=>({id:`step-${j}`,text})),resourceLinks,exercises:spec.exercises.map(([prompt,hint],j)=>({id:`exercise-${j}`,prompt,hint})),completionCriteria:[...spec.criteria],status:'未开始',stepState:{},answers:{},notes:'',criteriaState:{},packageId:p.id};
  d.lessons!.push(lesson);d.activities.push({id:activityId,lessonId:id,courseId:c.id,milestoneId:milestoneIds[0],name:spec.title,minutes:spec.minutes,kind:c.kind,mode:spec.mode,instructions:spec.steps.join('\n'),completed:false});
 });
 return c.id;
}
// Additive and idempotent. Only original seed courses receive the first content pack.
// Deleted courses are never recreated; renamed/edited custom courses are not matched by code.
export function migrateData(input:Data):Data{
 const d=structuredClone(input);d.lessons??=[];
 if((d.contentVersion||0)<3){
  for(const [i,p]of coursePackages.entries()){
   const c=d.courses.find(c=>c.id===`course-${i}`&&c.seed===true&&c.code===p.code);
   if(c)importPackage(d,p,c);
  }
  d.contentVersion=3;
 }
 d.version=2;return validateData(d);
}
export function reorderLessons(d:Data,courseId:string,ids:string[]){const course=d.courses.find(c=>c.id===courseId);ids.forEach((id,i)=>{const l=d.lessons?.find(l=>l.id===id&&l.courseId===courseId);if(l){l.order=i;l.nextLessonId=ids[i+1]||'';l.prerequisites=course?.learningRoute==='循序课程'&&i>0?[ids[i-1]]:[]}})}
export function saveLesson(d:Data,lesson:Lesson){
 d.lessons??=[];const existing=d.lessons.findIndex(l=>l.id===lesson.id);
 if(existing<0)d.lessons.push(lesson);else d.lessons[existing]=lesson;
 if(!lesson.milestoneIds.length){const id=uid();d.milestones.push({id,unitId:lesson.unitId,name:lesson.title,status:'未开始'});lesson.milestoneIds=[id]}
 if(!lesson.activityIds.length)lesson.activityIds=[uid()];
 for(const id of lesson.activityIds){const activity=d.activities.find(a=>a.id===id);const values={id,lessonId:lesson.id,courseId:lesson.courseId,milestoneId:lesson.milestoneIds[0],name:lesson.title,minutes:lesson.minutes,kind:lesson.kind,mode:lesson.mode,instructions:lesson.steps.map(s=>s.text).join('\n'),completed:lesson.status==='已完成'};if(activity)Object.assign(activity,values);else d.activities.push(values)}
 reorderLessons(d,lesson.courseId,lessonsFor(d,lesson.courseId).map(l=>l.id));
}
export function finishLesson(data:Data,id:string,input:{summary:string;minutes:number;url:string;complete:boolean;masteredIds:string[]}):Data{
 const lesson=data.lessons?.find(l=>l.id===id);if(!lesson)throw new Error('课时不存在');
 if(input.complete&&!lesson.completionCriteria.every((_,i)=>lesson.criteriaState[i]))throw new Error('请先核对本节完成条件；也可以只保存本次学习');
 const exercises=lesson.exercises.map(e=>`${e.prompt}\n${lesson.answers[e.id]||'（暂未作答）'}`).join('\n\n');
 const next=recordStudy(data,{courseId:lesson.courseId,lessonId:id,activityId:lesson.activityIds[0]||'',milestoneId:lesson.milestoneIds[0]||'',summary:input.summary,notes:[lesson.notes,exercises].filter(Boolean).join('\n\n'),minutes:input.minutes,url:input.url,kind:lesson.kind},false,input.complete);
 const l=next.lessons!.find(l=>l.id===id)!;l.status=input.complete?'已完成':l.status==='已完成'?'已完成':'学习中';
 if(input.complete)for(const a of next.activities)if(l.activityIds.includes(a.id))a.completed=true;
 const log=next.logs[0];for(const nodeId of lesson.milestoneIds){const node=next.milestones.find(m=>m.id===nodeId);if(!node)continue;if(input.masteredIds.includes(nodeId)){node.status='已掌握';if(!next.artifacts.some(a=>a.milestoneId===nodeId))next.artifacts.unshift({id:uid(),logId:log.id,milestoneId:nodeId,title:node.name,type:'知识晶体',displayed:true})}else if(node.status==='未开始')node.status='学习中'}
 if(input.complete){const unitLessons=next.lessons!.filter(x=>x.unitId===l.unitId);if(unitLessons.length&&unitLessons.every(x=>x.status==='已完成')&&!next.artifacts.some(a=>a.chapterUnitId===l.unitId)){const unit=next.units.find(u=>u.id===l.unitId)!;next.artifacts.unshift({id:uid(),logId:log.id,chapterUnitId:unit.id,title:'章节纪念 · '+unit.name,type:'课程纪念章',displayed:true});log.summary+=' · 章节完成：'+unit.name}}
 syncChapterRewards(next);return next;
}
export function blankLesson(course:Course,unitId:string,order:number):Lesson{return {id:uid(),courseId:course.id,unitId,title:'',description:'',objectives:[],minutes:25,difficulty:'入门',kind:course.kind,mode:'自主学习',order,prerequisites:[],nextLessonId:'',milestoneIds:[],activityIds:[],steps:[],resourceLinks:[],exercises:[],completionCriteria:[],status:'未开始',stepState:{},answers:{},notes:'',criteriaState:{}}}
