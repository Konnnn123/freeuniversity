import {expect,it,vi} from 'vitest';
import {renderToString} from 'react-dom/server';
import {MemoryRouter} from 'react-router-dom';
import {createSeed} from '../src/seed';
import {upgradeArchive} from '../src/studioEngine';
import {classroomLessons} from '../src/courseOrganization';
import {activityChapter,firstPoolChapter,generateChapterSchedule,timetableCourses} from '../src/timetablePlanning';
import {TimetablePool} from '../src/TimetablePool';
import {Timetable} from '../src/Timetable';
import {useStore} from '../src/store';
import {weekDates,type Data} from '../src/model';
vi.mock('../src/store',async original=>{const module=await original<typeof import('../src/store')>();return {...module,useStore:Object.assign(()=>module.useStore.getState(),module.useStore)}});
const dates=Array.from({length:7},(_,i)=>'2026-10-'+(19+i));
const options={days:3,count:3,minutes:90,courseId:'course-2',balance:false};
function bulk(count=8){
 const d=upgradeArchive(createSeed()),base=structuredClone(classroomLessons(d,'course-2')[0]),source=d.activities.find(a=>a.lessonId===base.id)!;
 d.lessons=d.lessons!.filter(l=>l.courseId!=='course-2');d.activities=d.activities.filter(a=>a.courseId!=='course-2'||!a.lessonId);
 for(let i=0;i<count;i++){
  const id='bulk-'+i,activityId='bulk-activity-'+i;
  d.lessons.push({...structuredClone(base),id,title:'测试课时 '+i,order:i,unitId:i<5?'unit-2-0':'unit-2-1',prerequisites:[],nextLessonId:'',activityIds:[activityId],status:'未开始'});
  d.activities.push({...source,id:activityId,name:'测试课时 '+i,lessonId:id,completed:false,minutes:20});
 }
 return d;
}
const pool=(d:Data,courseId='')=>renderToString(<MemoryRouter><TimetablePool data={d} courseId={courseId} dates={dates} onCourseChange={()=>{}} onArrange={()=>{}}/></MemoryRouter>);

it('keeps all courses discoverable, including prepared language lessons, without changing the archive',()=>{
 const d=bulk(),snapshot=JSON.stringify(d),groups=timetableCourses(d),language=groups.find(g=>g.course.id==='course-0')!;
 expect(language.ready).toBeGreaterThan(0);expect(groups.find(g=>g.course.id==='course-2')!.ready).toBe(8);
 expect(groups.find(g=>g.course.id==='course-2')!.chapters.flatMap(ch=>ch.free).length).toBe(4);
 expect(JSON.stringify(d)).toBe(snapshot);
});
it('groups a hundred lessons without rendering a hundred cards in the all-course view',()=>{
 const d=bulk(100),html=pool(d);
 expect(html).toContain('经济学入门');expect(html).not.toContain('测试课时 0');expect(html).not.toContain('测试课时 99');
 expect(html).not.toContain('+ 日语探索');expect(html).not.toContain('显示语言系统路线');
});
it('opens one chapter and shows just its first three ready pending lessons',()=>{
 const d=bulk(),html=pool(d,'course-2');
 for(const n of [0,1,2])expect(html).toContain('测试课时 '+n);
 for(const n of [3,4,5,6,7])expect(html).not.toContain('测试课时 '+n);
 expect(html).toContain('查看本章其余 2 节');expect(html).toContain('自由学习任务');
 expect(html).not.toContain('<b>高级日语表达</b>');expect(html).toContain('供需关系');
});
it('separates completed, pending preparation and historical reference content',()=>{
 const d=bulk();d.lessons!.find(l=>l.id==='bulk-0')!.status='已完成';
 d.lessons!.find(l=>l.id==='bulk-1')!.pdfTeachingPlan={bookId:'book',nodeId:'node',draftId:'draft',index:1,chapterOrder:0};
 d.lessons!.find(l=>l.id==='bulk-2')!.archivedFromClassroom=true;
 const c=timetableCourses(d).find(g=>g.course.id==='course-2')!,rows=c.chapters.flatMap(ch=>ch.lessons),html=pool(d,'course-2');
 expect(rows).toHaveLength(7);expect(rows.find(r=>r.lesson.id==='bulk-1')!.ready).toBe(false);
 expect(c.completed).toBe(1);expect(html).toContain('待备课');expect(html).toContain('复习课时');expect(html).not.toContain('测试课时 2');
});
it('selects the first learnable chapter and retains tasks not attached to a node',()=>{
 const d=bulk();for(const l of d.lessons!.filter(l=>l.id.startsWith('bulk-')&&l.unitId==='unit-2-0'))l.status='已完成';
 d.activities.push({id:'loose',courseId:'course-2',milestoneId:'',name:'我的自由记录',minutes:10,kind:'理论',mode:'自主学习',instructions:'',completed:false});
 const c=timetableCourses(d).find(g=>g.course.id==='course-2')!;
 expect(firstPoolChapter(c)).toBe('unit-2-1');expect(c.chapters.at(-1)!.free[0].id).toBe('loose');
 expect(activityChapter(d,d.activities.find(a=>a.id==='bulk-activity-6')!)!.id).toBe('unit-2-1');
});
it('restricts automatic plans to the selected course and chapter and preserves lesson order',()=>{
 const d=bulk(),snapshot=JSON.stringify(d),entries=generateChapterSchedule(d,dates,{...options,unitId:'unit-2-1'});
 expect(entries.map(s=>s.activityId)).toEqual(['bulk-activity-5','bulk-activity-6','bulk-activity-7']);
 expect(entries.every(s=>d.activities.find(a=>a.id===s.activityId)!.courseId==='course-2')).toBe(true);
 expect(JSON.stringify(d)).toBe(snapshot);
});
it('counts existing tasks and language exploration toward the daily time and slot limits',()=>{
 const d=bulk();d.schedule.push({id:'already',date:dates[0],activityId:'',exploration:{language:'ja',kind:'素材探索',mediaId:'kept',topicId:'',title:'以前安排的探索',minutes:50}});
 const entries=generateChapterSchedule(d,dates,{...options,days:1,count:3,minutes:90});
 expect(entries).toHaveLength(2);expect(entries.map(s=>s.activityId)).toEqual(['bulk-activity-0','bulk-activity-1']);
 expect(d.schedule).toHaveLength(1);expect(d.schedule[0].exploration!.title).toBe('以前安排的探索');
});
it('does not duplicate a lesson already scheduled through another activity for that lesson',()=>{
 const d=bulk(),original=d.activities.find(a=>a.id==='bulk-activity-0')!;
 d.activities.push({...original,id:'another-activity'});d.schedule.push({id:'prior',date:dates[3],activityId:'another-activity'});
 const entries=generateChapterSchedule(d,dates,options);expect(entries.every(e=>e.activityId!=='bulk-activity-0')).toBe(true);
 expect(new Set(entries.map(e=>e.activityId)).size).toBe(entries.length);
});
it('never skips a long first lesson to schedule a shorter later one',()=>{
 const d=bulk();d.activities.find(a=>a.id==='bulk-activity-0')!.minutes=100;
 expect(generateChapterSchedule(d,dates,{...options,minutes:30})).toEqual([]);
 expect(generateChapterSchedule(d,dates,{...options,days:0})).toEqual([]);
});
it('excludes completed, unprepared and paused courses from automatic plans but keeps language classes eligible',()=>{
 const d=bulk();d.courses.find(c=>c.id==='course-2')!.status='暂时休息';expect(generateChapterSchedule(d,dates,options)).toEqual([]);
 const language=generateChapterSchedule(d,dates,{...options,courseId:'course-0'});
 expect(language.length).toBeGreaterThan(0);expect(language.every(e=>!!e.activityId&&!e.exploration)).toBe(true);
});
it('keeps old language schedule entries visible without the removed language-only creation controls',()=>{
 const d=bulk();d.schedule.push({id:'kept-exploration',date:weekDates()[0],activityId:'',exploration:{language:'ja',kind:'素材探索',mediaId:'old',topicId:'',title:'旧语言探索安排',minutes:15}});useStore.setState({data:d,ready:true});
 const html=renderToString(<MemoryRouter initialEntries={['/timetable?course=course-2']}><Timetable/></MemoryRouter>);
 expect(html).toContain('测试课时 0');expect(html).not.toContain('测试课时 5');expect(html).not.toContain('日语探索</button>');expect(html).not.toContain('显示语言系统路线');
 expect(html).toContain('帮我安排一周');expect(html).toContain('按章节找课时');expect(html).toContain('旧语言探索安排');
});
