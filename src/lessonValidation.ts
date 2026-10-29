import type {Data} from './model';
export function validateLessons(d:Data){
 if(d.version>=2&&!Array.isArray(d.lessons))throw new Error('存档缺少课时');
 const ids=new Set<string>();
 for(const l of d.lessons||[]){
  if(l.readingState){const s=l.readingState;if(!['question','explanation','practice'].includes(s.active)||!s.phases||Object.entries(s.phases).some(([k,v])=>!['question','explanation','practice'].includes(k)||!['done','skipped'].includes(v))||(s.completionLogId!==undefined&&typeof s.completionLogId!=='string'))throw new Error('课时阅读进度格式有误')}
  if(l.annotations){const ids=new Set<string>();if(!Array.isArray(l.annotations)||l.annotations.some(a=>!a||typeof a.id!=='string'||ids.has(a.id)||(ids.add(a.id),false)||!['question','explanation','example','boundary'].includes(a.field)||!Number.isInteger(a.start)||!Number.isInteger(a.end)||a.start<0||a.end<=a.start||typeof a.quote!=='string'||a.quote.length>5000||a.end-a.start!==a.quote.length||typeof a.prefix!=='string'||typeof a.suffix!=='string'||!['highlight','underline'].includes(a.style)||!['yellow','green','purple'].includes(a.color)||typeof a.comment!=='string'||a.comment.length>5000||typeof a.createdAt!=='string'))throw new Error('课时标注格式有误')}

  if(l.archivedFromClassroom!==undefined&&typeof l.archivedFromClassroom!=='boolean')throw new Error('旧版课堂状态有误');
  if(l.pdfTeachingPlan){const p=l.pdfTeachingPlan;if(typeof p.bookId!=='string'||typeof p.nodeId!=='string'||typeof p.draftId!=='string'||!Number.isInteger(p.index)||p.index<0||!Number.isInteger(p.chapterOrder)||p.chapterOrder<0)throw new Error('PDF课程大纲关联有误')}
  if((l.bookId!==undefined&&typeof l.bookId!=='string')||(l.bookNodeId!==undefined&&typeof l.bookNodeId!=='string'))throw new Error('课时原书关联有误');if(typeof l.id!=='string'||ids.has(l.id))throw new Error('课时 ID 重复或无效');ids.add(l.id);
  if(!d.courses.some(c=>c.id===l.courseId)||!d.units.some(u=>u.id===l.unitId&&u.courseId===l.courseId))throw new Error('课时课程/章节关联有误');
  for(const k of ['title','description','difficulty','nextLessonId','notes']as const)if(typeof l[k]!=='string')throw new Error('课时文字格式有误');
  if(!Number.isFinite(l.minutes)||l.minutes<1||!Number.isFinite(l.order)||!['未开始','学习中','已完成'].includes(l.status))throw new Error('课时状态或时长有误');
  for(const k of ['objectives','completionCriteria','prerequisites','milestoneIds','activityIds']as const)if(!Array.isArray(l[k])||l[k].some(v=>typeof v!=='string'))throw new Error('课时列表格式有误');
  if(!['语言','理论','实操','创作'].includes(l.kind)||!['视频学习','音频学习','阅读学习','讨论学习','技能实操','自主学习'].includes(l.mode))throw new Error('课时类型有误');
  if(!Array.isArray(l.steps)||l.steps.some(s=>typeof s.id!=='string'||typeof s.text!=='string')||new Set(l.steps.map(s=>s.id)).size!==l.steps.length)throw new Error('学习步骤格式有误');
  if(!Array.isArray(l.exercises)||l.exercises.some(e=>typeof e.id!=='string'||typeof e.prompt!=='string'||typeof e.hint!=='string'))throw new Error('练习格式有误');
  if(!Array.isArray(l.resourceLinks)||l.resourceLinks.some(r=>typeof r.scope!=='string'||!d.resources.some(v=>v.id===r.resourceId)))throw new Error('课时资源关联有误');
  if(l.milestoneIds.some(id=>!d.milestones.some(m=>m.id===id&&d.units.some(u=>u.id===m.unitId&&u.courseId===l.courseId)))||l.activityIds.some(id=>!d.activities.some(a=>a.id===id&&a.courseId===l.courseId)))throw new Error('课时节点或活动关联有误');
  if(l.prerequisites.some(id=>!(d.lessons||[]).some(x=>x.id===id&&x.courseId===l.courseId))||(l.nextLessonId&&!(d.lessons||[]).some(x=>x.id===l.nextLessonId&&x.courseId===l.courseId)))throw new Error('课时路线关联有误');
  if(!l.stepState||Object.values(l.stepState).some(v=>!['完成','跳过'].includes(v))||!l.answers||Object.values(l.answers).some(v=>typeof v!=='string')||!l.criteriaState||Object.values(l.criteriaState).some(v=>typeof v!=='boolean'))throw new Error('课时草稿格式有误');
 }
 for(const a of d.activities)if(a.lessonId&&!(d.lessons||[]).some(l=>l.id===a.lessonId&&l.activityIds.includes(a.id)))throw new Error('课时活动关联有误');
 for(const r of d.resources){for(const k of ['source','language','difficulty','verifiedAt','scope','guide']as const)if(r[k]!==undefined&&typeof r[k]!=='string')throw new Error('资源说明格式有误');if(r.verification&&!['具体资源已核实','仅入口已核实','内置指南','待核实'].includes(r.verification))throw new Error('资源验证状态有误')}
}
