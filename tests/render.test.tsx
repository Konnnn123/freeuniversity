import {it,expect} from 'vitest';
import {renderToString} from 'react-dom/server';
import {MemoryRouter,Routes,Route} from 'react-router-dom';
import {Courses} from '../src/Courses';
import {CourseStudy} from '../src/CourseStudy';
import {Timetable} from '../src/Timetable';
import {Library} from '../src/Library';
import {Museum} from '../src/Museum';
import {Settings} from '../src/Settings';
import {Campus} from '../src/Campus';
it.each([
['/',<Campus/>, '欢迎回到'],
['/build',<Campus build/>, '校园物品箱'],
['/courses',<Courses/>, '高级日语表达'],
['/courses/course-0',<Courses/>, '高级日语表达'],
['/courses/course-0/tasks/activity-0-0',<CourseStudy/>, '记录本次学习'],
['/timetable',<Timetable/>, '经济学入门'],
['/library',<Library/>, '我的 PDF'],
['/library?tab=resources',<Library/>, 'CORE Econ'],
['/museum',<Museum/>, '学习足迹'],
['/settings',<Settings/>, '导出 JSON 存档'],
] as const)('页面 %s 可渲染且包含真实内容',(path,page,text)=>{
const route=path.includes('/tasks/')?'/courses/:courseId/tasks/:activityId':path.startsWith('/courses/')?'/courses/:id':path.split('?')[0];
const html=renderToString(<MemoryRouter initialEntries={[path]}><Routes><Route path={route} element={page}/></Routes></MemoryRouter>);expect(html).toContain(text);
});
