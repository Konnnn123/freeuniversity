import {useState} from 'react';
import {useNavigate,useSearchParams} from 'react-router-dom';
import {activityPath} from './siteNavigation';
import {entryMinutes,schedulePath} from './studioEngine';
import {languageNames} from './studioTypes';
import {useStore} from './store';
import {weekDates,uid,type LearningActivity,type ScheduleEntry} from './model';
import {PageTitle,Icon,Modal} from './ui';
import {TimetablePool} from './TimetablePool';
import {activityChapter,generateChapterSchedule,timetableCourses} from './timetablePlanning';
const days=['周一','周二','周三','周四','周五','周六','周日'];

export function Timetable(){
 const {data,change,notify}=useStore(),nav=useNavigate(),[params,setParams]=useSearchParams();
 const [offset,setOffset]=useState(0),[choose,setChoose]=useState<{activityId:string;entryId?:string}|null>(null),[auto,setAuto]=useState<{courseId:string;unitId:string}|null>(null);
 const dates=weekDates(offset),courseId=data.courses.some(c=>c.id===params.get('course'))?params.get('course')!:'',groups=timetableCourses(data);
 const add=(activityId:string,date:string,entryId?:string)=>{
  const existing=entryId?data.schedule.find(s=>s.id===entryId):undefined;
  if(entryId&&!existing||!entryId&&!data.activities.some(a=>a.id===activityId)){notify('这项学习内容已经不在列表中。');return}
  if((existing?.activityId||activityId)&&data.schedule.some(s=>s.id!==entryId&&s.date===date&&s.activityId===(existing?.activityId||activityId))){notify('这个课时当天已经安排过了。');return}
  change(d=>{if(entryId){const row=d.schedule.find(s=>s.id===entryId);if(row)row.date=date}else d.schedule.push({id:uid(),activityId,date})});setChoose(null);notify('课表已保存，随时可以再调整');
 };
 const task=(a:LearningActivity,entry:ScheduleEntry)=>{
  const course=data.courses.find(c=>c.id===a.courseId),chapter=activityChapter(data,a);
  return <article className={'schedule-task '+(a.completed?'completed':'')} draggable onDragStart={e=>e.dataTransfer.setData('text/plain',JSON.stringify({activityId:a.id,entryId:entry.id}))} style={{borderLeftColor:course?.color}}>
   <small className="scheduled-course">{course?.name||'已归档课程'}{chapter?' · '+chapter.name:''}</small><b>{a.name}</b><small>{a.minutes} 分钟{a.completed?' · 已完成，可复习':''}</small>
   <div className="task-actions"><button onClick={()=>nav(activityPath(a))}>{a.completed?'再学习':'进入课时'} →</button><button onClick={()=>setChoose({activityId:a.id,entryId:entry.id})}>移动</button><button aria-label={'退回任务池 '+a.name} onClick={()=>change(d=>{d.schedule=d.schedule.filter(s=>s.id!==entry.id)})}>×</button></div>
  </article>;
 };
 const explorationTask=(entry:ScheduleEntry)=>{const p=entry.exploration!;return <article className="schedule-task exploration-task" draggable onDragStart={e=>e.dataTransfer.setData('text/plain',JSON.stringify({entryId:entry.id}))}><small>{languageNames[p.language]} · {p.kind}</small><b>{p.title}</b><small>{p.minutes} 分钟 · {entry.visited?'来过这里':'自由探索'}</small><div className="task-actions"><button onClick={()=>{change(d=>{d.schedule.find(x=>x.id===entry.id)!.visited=true});nav(schedulePath(data,entry))}}>打开素材 →</button><button onClick={()=>setChoose({activityId:'',entryId:entry.id})}>移动</button><button aria-label={'移除探索安排 '+p.title} onClick={()=>change(d=>{d.schedule=d.schedule.filter(x=>x.id!==entry.id)})}>×</button></div></article>};
 const autoGroup=groups.find(g=>g.course.id===auto?.courseId);
 return <div className="page timetable-page chapter-timetable"><PageTitle en="THE WEEKLY NOTICEBOARD" title="为好奇心，留一点时间。" description="按课程和章节找内容，把具体课时安排到合适的一天。" action={<button className="primary" onClick={()=>setAuto({courseId,unitId:''})}><Icon name="star"/>帮我安排一周</button>}/>
  <div className="week-navigation"><button onClick={()=>setOffset(offset-1)}>← 上一周</button><b>{dates[0]} — {dates[6]}</b><button onClick={()=>setOffset(offset+1)}>下一周 →</button><button onClick={()=>setOffset(0)}>本周</button><button className="text-button" onClick={()=>nav('/courses')}>不按课表？去课程直接学习 →</button></div>
  <div className="timetable-layout"><TimetablePool key={courseId} data={data} courseId={courseId} onCourseChange={id=>setParams(id?{course:id}:{})} onArrange={a=>setChoose({activityId:a.id})} dates={dates}/>
   <div className="week-grid">{dates.map((date,i)=>{
    const entries=data.schedule.filter(s=>s.date===date);
    return <section className="day-column" key={date} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();try{const v=JSON.parse(e.dataTransfer.getData('text/plain')),existing=data.schedule.find(s=>s.id===v.entryId);if(existing?.exploration)add('',date,existing.id);else if(data.activities.some(a=>a.id===v.activityId))add(v.activityId,date,v.entryId)}catch{notify('请选择左侧的具体课时')}}}>
     <header><b>{days[i]}</b><small>{date.slice(5).replace('-',' / ')}</small></header><div className="day-content">{entries.map(entry=>{if(entry.exploration)return <div key={entry.id}>{explorationTask(entry)}</div>;const a=data.activities.find(a=>a.id===entry.activityId);return a&&<div key={entry.id}>{task(a,entry)}</div>})}{!entries.length&&<div className="rest-day"><Icon name="leaf" size={27}/><span>留白也很好</span><small>把想学的课时放这里</small></div>}</div><footer>{entries.reduce((n,s)=>n+entryMinutes(data,s),0)} 分钟 · 自由调整</footer>
    </section>;
   })}</div>
  </div><p className="page-footnote">章节用来找内容，课时用来安排时间。移除安排不会删除课程和学习记录。</p>
  {choose&&<Modal title="想在哪天学习？" onClose={()=>setChoose(null)}><div className="date-choices">{dates.map((date,i)=><button key={date} onClick={()=>add(choose.activityId,date,choose.entryId)}>{days[i]}<small>{date.slice(5)}</small></button>)}</div><label>或选择其他日期<input type="date" onChange={e=>{if(e.target.value)add(choose.activityId,e.target.value,choose.entryId)}}/></label></Modal>}
  {auto&&<Modal title="一份轻松的课表建议" onClose={()=>setAuto(null)}><form onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget),result=generateChapterSchedule(data,dates,{days:Number(f.get('days')),count:Number(f.get('count')),minutes:Number(f.get('minutes')),courseId:auto.courseId,unitId:auto.unitId,balance:f.get('balance')==='on'});change(d=>{d.schedule.push(...result)});setAuto(null);notify(result.length?'已添加 '+result.length+' 节课，现有安排保留。':'当前范围没有适合新增的课时，可调整时长、章节或先备课。')}}>
   <p>按所选课程、章节的顺序安排未完成且已备好的课时。保留现有计划，已安排的课时不重复加入。</p>
   <label>课程范围<select value={auto.courseId} onChange={e=>setAuto({courseId:e.target.value,unitId:''})}><option value="">全部学习中的课程</option>{data.courses.map(c=><option value={c.id} key={c.id}>{c.name}{c.status==='暂时休息'?'（暂时休学）':''}</option>)}</select></label>
   {auto.courseId&&<label>章节范围<select value={auto.unitId} onChange={e=>setAuto({...auto,unitId:e.target.value})}><option value="">这门课的全部章节</option>{autoGroup?.chapters.filter(ch=>ch.lessons.length).map(ch=><option key={ch.unit.id} value={ch.unit.id}>{ch.unit.name}</option>)}</select></label>}
   <div className="form-row"><label>每周学习几天<input type="number" name="days" min="0" max="7" defaultValue="3" required/></label><label>每天最多几个课时<input type="number" name="count" min="1" max="10" defaultValue="3" required/></label></div><label>每天建议时长（分钟）<input name="minutes" type="number" min="0" max="600" defaultValue="90" required/></label>
   {!auto.courseId&&<label className="check"><input name="balance" type="checkbox" defaultChecked/>兼顾不同类型的课程</label>}<button className="primary" type="submit">生成建议课表</button>
  </form></Modal>}
 </div>;
}
