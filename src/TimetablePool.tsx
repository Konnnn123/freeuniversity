import {useState} from 'react';
import {Link} from 'react-router-dom';
import type {Data,LearningActivity} from './model';
import {activityPath,coursePath} from './siteNavigation';
import {firstPoolChapter,timetableCourses,type PoolCourse,type PoolLesson} from './timetablePlanning';
import {Icon} from './ui';

export function TimetablePool({data,courseId,onCourseChange,onArrange,dates}:{data:Data;courseId:string;onCourseChange:(id:string)=>void;onArrange:(a:LearningActivity)=>void;dates:string[]}){
 const groups=timetableCourses(data);
 const [expandedCourse,setExpandedCourse]=useState(courseId),[expandedChapter,setExpandedChapter]=useState(()=>firstPoolChapter(groups.find(g=>g.course.id===courseId))),[showAll,setShowAll]=useState<Record<string,boolean>>({});
 const pick=(id:string)=>{onCourseChange(id);setExpandedCourse(id);setExpandedChapter(firstPoolChapter(groups.find(g=>g.course.id===id)))};
 const openCourse=(g:PoolCourse)=>{const opening=expandedCourse!==g.course.id;setExpandedCourse(opening?g.course.id:'');setExpandedChapter(opening?firstPoolChapter(g):'')};
 const activity=(a:LearningActivity,title=a.name,review=false)=>{
  const planned=data.schedule.some(s=>dates.includes(s.date)&&(s.activityId===a.id||!!a.lessonId&&data.activities.some(other=>other.id===s.activityId&&other.lessonId===a.lessonId)));
  return <article className={'pool-lesson '+(review?'is-review':'')} key={a.id} draggable onDragStart={e=>e.dataTransfer.setData('text/plain',JSON.stringify({activityId:a.id}))}>
   <b>{title}</b><small>{a.minutes} 分钟{planned?' · 本周已安排':review?' · 已完成，可复习':''}</small>
   <div className="task-actions"><Link className="button" to={activityPath(a)}>{review?'回看':'进入'} →</Link><button onClick={()=>onArrange(a)}>{planned?'再安排':'安排'}</button></div>
  </article>;
 };
 const lesson=(r:PoolLesson)=>r.ready&&r.activity?activity(r.activity,r.lesson.title,r.lesson.status==='已完成'):<article className="pool-lesson is-unprepared" key={r.lesson.id}><b>{r.lesson.title}</b><small>待备课 · 暂不排入课表</small><Link className="text-button" to={coursePath(r.lesson.courseId)}>去课程准备 →</Link></article>;
 return <aside className="task-pool chapter-task-pool pixel-panel"><div className="panel-label"><Icon name="book"/><b>按章节找课时</b></div>
  <label className="pool-course-filter">筛选课程<select aria-label="筛选任务课程" value={courseId} onChange={e=>pick(e.target.value)}><option value="">全部课程</option>{data.courses.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></label>
  <p className="pool-guide">展开一章，选择具体课时安排。每章先显示接下来的 3 节。</p>
  <div className="chapter-pool-scroll">{groups.filter(g=>!courseId||g.course.id===courseId).map(g=>{
   const open=expandedCourse===g.course.id;
   return <section className={'pool-course '+(open?'is-open':'')} key={g.course.id}>
    <button className="pool-course-toggle" aria-expanded={open} onClick={()=>openCourse(g)}><span aria-hidden="true">{open?'▾':'▸'}</span><span><b>{g.course.name}</b><small>{g.course.status==='暂时休息'?'暂时休学 · ':''}{g.chapters.length} 章 · {g.ready} 节待学 · 已完成 {g.completed}/{g.total}</small></span></button>
    {open&&<div className="pool-chapters">{g.chapters.map(ch=>{
     const expanded=expandedChapter===ch.unit.id,pending=ch.lessons.filter(r=>r.lesson.status!=='已完成'),ready=pending.filter(r=>r.ready),waiting=pending.filter(r=>!r.ready),completed=ch.lessons.filter(r=>r.lesson.status==='已完成'),all=!!showAll[ch.unit.id];
     return <section className="pool-chapter" key={ch.unit.id}><button className="pool-chapter-toggle" aria-expanded={expanded} onClick={()=>setExpandedChapter(expanded?'':ch.unit.id)}><span aria-hidden="true">{expanded?'▾':'▸'}</span><span><b>{ch.unit.name}</b><small>{ch.lessons.length} 节课 · {ready.length} 节待学{waiting.length?' · '+waiting.length+' 节待备课':''}</small></span></button>
      {expanded&&<div className="pool-chapter-content">{(all?ready:ready.slice(0,3)).map(lesson)}{ready.length>3&&<button className="pool-show-more" onClick={()=>setShowAll({...showAll,[ch.unit.id]:!all})}>{all?'收起，只看接下来的 3 节':'查看本章其余 '+(ready.length-3)+' 节 →'}</button>}
       {!ready.length&&<p className="pool-empty">{pending.length?'这一章还有内容待备课。':ch.lessons.length?'这一章已学完，可以展开下方复习。':'这一章还没有正式课时。'}</p>}
       {!!waiting.length&&<details className="pool-secondary"><summary>待备课 · {waiting.length} 节</summary>{waiting.map(lesson)}</details>}
       {!!completed.length&&<details className="pool-secondary"><summary>复习课时 · {completed.length} 节</summary>{completed.map(lesson)}</details>}
       {!!ch.free.length&&<details className="pool-secondary"><summary>自由学习任务 · {ch.free.length} 项</summary>{ch.free.map(a=>activity(a,a.name,a.completed))}</details>}
      </div>}
     </section>;
    })}{!g.chapters.length&&<p className="pool-empty">还没有课时或任务，先到课程里准备一点内容。</p>}<Link className="pool-course-link" to={coursePath(g.course.id)}>打开这门课程 →</Link></div>}
   </section>;
  })}{!groups.length&&<p className="pool-empty">还没有课程，先开一门你想学的课。</p>}</div>
  <Link className="pool-add-course" to="/courses">去课程添加或准备内容 →</Link>
 </aside>;
}
