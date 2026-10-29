import {it,expect,vi} from 'vitest';
import {renderToString} from 'react-dom/server';
import {MemoryRouter,Route,Routes} from 'react-router-dom';
import {LessonRoom} from '../src/Lessons';
import {Preparation} from '../src/Preparation';
import {Library} from '../src/Library';
import {Museum} from '../src/Museum';
import {Courses} from '../src/Courses';
import {useStore} from '../src/store';
import {finishLesson,lessonsFor,migrateData} from '../src/lessonEngine';
import {createSeed} from '../src/seed';
// SSR normally uses Zustand's creation-time snapshot. Render the supplied archive
// fixture here; persistence/reload behavior is covered separately in fake IndexedDB.
vi.mock('../src/store',async importOriginal=>{const original=await importOriginal<typeof import('../src/store')>();return {...original,useStore:Object.assign(()=>original.useStore.getState(),original.useStore)}});
const render=(url:string,path:string,page:React.ReactNode)=>renderToString(<MemoryRouter initialEntries={[url]}><Routes><Route path={path} element={page}/></Routes></MemoryRouter>);
it('economics lesson exposes a real textbook URL, specific scope, checkboxes and autosaved draft',()=>{const d=migrateData(createSeed());const l=lessonsFor(d,'course-2')[0];l.notes='我放弃的最佳替代方案';useStore.setState({data:d,ready:true});const html=render(`/lessons/${l.id}`,'/lessons/:id',<LessonRoom/>);for(const text of ['https://books.core-econ.org/the-economy-v1/book/text/03.html','Opportunity cost','学习材料','本节笔记','我放弃的最佳替代方案','type="checkbox"'])expect(html).toContain(text)});
it('all 21 lesson pages render their own steps and exercises',()=>{const d=migrateData(createSeed());useStore.setState({data:d,ready:true});for(const l of d.lessons!){const html=render(`/lessons/${l.id}`,'/lessons/:id',<LessonRoom/>);expect(html).toContain(l.title.replaceAll('&','&amp;'));expect(html).toContain('保存学习记录 / 完成课时');expect(html).toContain('本次范围')}});
it('course-scoped editor exposes saved lessons and a return path to its course',()=>{const d=migrateData(createSeed());useStore.setState({data:d,ready:true});const html=render('/courses/course-2/edit-lessons','/courses/:courseId/edit-lessons',<Preparation/>);expect(html).toContain('href="/courses/course-2"');expect(html).not.toContain('一键选课');expect(html).toContain('编辑内容与资源');expect(html).toContain('为什么时间也是一种成本')});
it('library deep link exposes both lessons using a shared resource',()=>{const d=migrateData(createSeed());useStore.setState({data:d,ready:true});const html=render('/library?resource=pack-eco-cost','/library',<Library/>);expect(html).toContain('为什么时间也是一种成本');expect(html).toContain('多学一小时');expect(html).not.toContain('A digital detox podcast')});
it('a saved lesson appears in Done List with its notes',()=>{let d=migrateData(createSeed());const l=d.lessons![0];l.notes='课堂流程验收笔记';d=finishLesson(d,l.id,{summary:'课堂流程验收记录',minutes:8,url:'',complete:false,masteredIds:[]});useStore.setState({data:d,ready:true});const html=render('/museum','/museum',<Museum/>);expect(html).toContain('课堂流程验收记录');expect(html).toContain('课堂流程验收笔记')});
it('language courses use the common syllabus and offer the studio as an explicit child tool',()=>{const d=migrateData(createSeed());useStore.setState({data:d,ready:true});const html=render('/courses/course-0','/courses/:id',<Courses/>);for(const label of ['教学大纲','原书与参考资料','学习任务','进入语言探索工作室','编辑课时与资料'])expect(html).toContain(label);expect(html).not.toContain('文学阅读角');expect(html).not.toContain('进入课程备课室');});
