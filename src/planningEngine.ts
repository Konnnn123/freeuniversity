import type {Data} from './model';
import {uid,weekDates} from './model';
import {addMaterial,courseFromMaterial,attachMaterialUnit} from './labEngine';
import {recommendedLessons} from './lessonEngine';
import {blankPlanning} from './planningTypes';
import {archivePlanning} from './planningVersions';
import {subjectFor} from './courseManagement';
export function startNextUnit(d:Data,courseId:string){
 const course=d.courses.find(c=>c.id===courseId);if(!course)throw new Error('这门课程不在当前存档中');
 if(d.planning?.continuation?.courseId===courseId&&!d.planning.continuation.acceptedUnitId)return;
 const previous=[d.planning,...(d.planningHistory||[]).map(v=>v.draft)].find(p=>p?.courseId===courseId||p?.continuation?.courseId===courseId);
 archivePlanning(d,'准备下一单元前');const p=blankPlanning(),units=d.units.filter(u=>u.courseId===courseId);
 p.brief={topic:course.name,goal:course.goal||'沿着现有课程继续深入，避免重复已有课时',level:'承接已有入门课程；已学与未学内容见课程路线',preferences:previous?.brief.preferences||p.brief.preferences,minutes:previous?.brief.minutes||20,days:previous?.brief.days??3};
 p.continuation={courseId,unitNumber:units.length+1,previousUnits:units.slice(-16).map(u=>({name:u.name,lessons:(d.lessons||[]).filter(l=>l.unitId===u.id).sort((a,b)=>a.order-b.order).map(l=>({title:l.title,question:l.description,completed:l.status==='已完成'}))}))};
 p.subject=subjectFor(course);p.ready=true;p.requirementsConfirmed=true;
 p.messages=[{role:'assistant',text:'继续为「'+course.name+'」准备第 '+p.continuation.unitNumber+' 单元。我会参考已有章节安排下一步。你可以直接生成大纲，也可以在右侧补充想深入的问题；新单元会追加到原课程。'}];d.planning=p;
}
export function acceptPlanningCourse(d:Data,subject:string,schedule:boolean){
 const p=d.planning;if(!p?.analysis||!p.text)throw new Error('请先准备课程草案');
 if(p.courseId&&d.courses.some(c=>c.id===p.courseId))return p.courseId;
 const target=p.continuation&&d.courses.find(c=>c.id===p.continuation!.courseId);if(p.continuation&&!target)throw new Error('原课程已移除，请先恢复课程或开始新草案');
 const materialId=addMaterial(d,{title:target?target.name+' · '+p.outline!.title:p.brief.topic,text:p.text,url:'',goal:p.brief.goal,exampleDomain:p.brief.preferences});
 const m=d.readingLab!.materials.find(m=>m.id===materialId)!;m.analysis=structuredClone(p.analysis);m.provenance='AI 生成，待核对';m.courseGenerated=p.teachingVersion===2;
 const courseId=target?target.id:courseFromMaterial(d,materialId);
 const unitId=target?attachMaterialUnit(d,materialId,courseId,'第'+(d.units.filter(u=>u.courseId===courseId).length+1)+'单元 · '+p.outline!.title):d.lessons!.find(l=>l.labMaterialId===materialId)!.unitId;
 const course=d.courses.find(c=>c.id===courseId)!;
 if(!target){course.name=p.outline?.title||p.brief.topic;course.subject=subject;if(p.teachingVersion===2){course.description=p.outline!.intro;d.units.find(u=>u.id===unitId)!.name='第一单元 · 从这里开始'}}
 const guide=d.resources.find(r=>r.id===m.resourceId)!;guide.courseId=courseId;guide.unitId=unitId;
 if(p.teachingVersion===2){guide.source='本课程学习指南';guide.scope='原创讲解与情境练习；来源集中见课程资源';guide.guide=p.analysis.lessons.map(l=>l.title+'\n'+l.explanation).join('\n\n')}
 const newLessons=d.lessons!.filter(l=>l.labMaterialId===materialId);
 for(const l of newLessons){l.minutes=p.brief.minutes;d.activities.filter(a=>l.activityIds.includes(a.id)).forEach(a=>a.minutes=l.minutes)}
 for(const s of p.sources||[]){let r=d.resources.find(r=>r.url===s.url);if(!r){r={id:uid(),title:s.title,url:s.url,type:'网页',tags:'对话开课,待核实',courseId,unitId,status:'待阅读',source:s.publisher||s.provider,scope:(p.analysis.lessons.some(l=>l.preparation?.sourceUrls.includes(s.url))?'本课参考网页片段，非完整教材；':'延伸推荐，可自行购买、借阅或导入已有资料；未作为已读教材。')+'检索摘要：'+s.snippet,verification:'待核实'};d.resources.push(r)}
  newLessons.forEach(l=>l.resourceLinks.push({resourceId:r!.id,scope:p.analysis!.lessons[l.labLessonIndex??l.order]?.preparation?.sourceUrls.includes(s.url)?'本课参考公开网页片段，非教材全文':'延伸推荐，非必读；未作为本课已读教材，可自行获取',optional:true}));
 }
 if(p.continuation)p.continuation.acceptedUnitId=unitId;p.materialId=materialId;p.courseId=courseId;
 if(schedule&&p.brief.days>0){const dates=weekDates(),planned=new Set(d.schedule.filter(s=>dates.includes(s.date)).map(s=>s.activityId)),lessons=recommendedLessons(d,courseId).filter(l=>l.labMaterialId===materialId&&!planned.has(l.activityIds[0]));lessons.slice(0,p.brief.days).forEach((l,i)=>d.schedule.push({id:uid(),activityId:l.activityIds[0],date:dates[Math.floor(i*7/p.brief.days)]}))}
 return courseId;
}
