import {expect,it} from 'vitest';
import {upgradeArchive} from '../src/studioEngine';
import {createSeed} from '../src/seed';
import {campusDestinations,campusDestination,legacyStudyPath,activityPath,startCoursePath,navigationSection} from '../src/siteNavigation';
import {schedulePath} from '../src/studioEngine';
import {classroomLessons} from '../src/courseOrganization';
import {hitCampusLabel} from '../src/campusRendering';

it('gives the map exactly the same four destinations as the core navigation',()=>{
 expect(campusDestinations.map(d=>[d.label,d.path])).toEqual([['课表','/timetable'],['课程','/courses'],['图书馆','/library'],['成果馆','/museum']]);
 for(const kind of ['office','workshop','garden'] as const)expect(campusDestination(kind)).toBeUndefined();
 const objects=createSeed().objects.filter(o=>['office','workshop','garden'].includes(o.kind));
 const context={measureText:()=>({width:100})} as unknown as CanvasRenderingContext2D;
 expect(hitCampusLabel(context,objects,{x:0,y:0},{x:0,y:0,scale:1})).toBeUndefined();
});

it('keeps old course and activity bookmarks usable without a second course directory',()=>{
 const d=upgradeArchive(createSeed()),before=JSON.stringify(d),a=d.activities.find(a=>!a.lessonId)!;
 expect(legacyStudyPath(d)).toBe('/courses');
 expect(legacyStudyPath(d,a.courseId)).toBe('/courses/'+a.courseId);
 expect(legacyStudyPath(d,a.courseId,a.id)).toBe('/courses/'+a.courseId+'/tasks/'+a.id);
 const other=d.courses.find(c=>c.id!==a.courseId)!;
 expect(legacyStudyPath(d,other.id,a.id)).toBe('/courses/'+other.id);
 expect(legacyStudyPath(d,'deleted',a.id)).toBe('/courses');
 expect(JSON.stringify(d)).toBe(before);
});

it('takes task and timetable links straight to the existing lesson or scoped free task',()=>{
 const d=upgradeArchive(createSeed()),lessonActivity=d.activities.find(a=>a.lessonId)!,free=d.activities.find(a=>!a.lessonId)!;
 expect(legacyStudyPath(d,lessonActivity.courseId,lessonActivity.id)).toBe('/lessons/'+lessonActivity.lessonId);
 expect(schedulePath(d,{id:'plan',date:'2026-10-29',activityId:free.id})).toBe(activityPath(free));
 expect(schedulePath(d,{id:'plan',date:'2026-10-29',activityId:lessonActivity.id})).toBe(activityPath(lessonActivity));
 expect(schedulePath(d,{id:'stale',date:'2026-10-29',activityId:'deleted'})).toBe('/courses');
});

it('starts the in-progress lesson and keeps manual study inside its own course',()=>{
 const d=upgradeArchive(createSeed()),lessons=classroomLessons(d,'course-2');
 lessons[0].status='已完成';lessons[1].status='学习中';
 expect(startCoursePath(d,'course-2')).toBe('/lessons/'+lessons[1].id);
 expect(startCoursePath({...d,lessons:[]},'course-2')).toBe('/courses/course-2/study');
});

it('keeps deep pages highlighted under courses or library instead of creating new top-level areas',()=>{
 for(const path of ['/courses/course-2/edit-lessons','/courses/course-2/tasks/task','/lessons/lesson','/studio/ja','/course-planner','/classroom'])expect(navigationSection(path)).toBe('/courses');
 for(const path of ['/books/book','/materials/material','/library'])expect(navigationSection(path)).toBe('/library');
 expect(navigationSection('/build')).toBe('/build');expect(navigationSection('/')).toBe('/');
 expect(activityPath({id:'a/b',courseId:'c/d'})).toBe('/courses/c%2Fd/tasks/a%2Fb');
});
