import {it,expect,vi} from 'vitest';
import {renderToString} from 'react-dom/server';
import {learningApi} from '../server/learning-api.mjs';
import {blankPlanning} from '../src/planningTypes';
import {checkTeachingLesson,teachingAnalysis} from '../src/planningFlow';
import {sampleAnalysis,sampleText} from '../src/labSample';
import {acceptPlanningCourse} from '../src/planningEngine';
import {validateData} from '../src/model';
import {createSeed} from '../src/seed';
import {upgradeArchive} from '../src/studioEngine';
import {PlanningSources,PreparationNote} from '../src/PlanningSources';
const book={title:'经济思想史参考书',url:'https://books.example/title',snippet:'图书简介与目录',publisher:'出版社',provider:'检索',kind:'教材',date:'',retrievedAt:'2026-10-27'};
const request=()=>new Request('https://campus.example/api/material-ai',{method:'POST',headers:{Origin:'https://campus.example','Content-Type':'application/json','X-Learning-Key':'test-key'},body:JSON.stringify({action:'course-lesson',text:sampleText,lesson:JSON.stringify({title:'为什么需要经济学',focus:'机会成本与选择'}),sources:JSON.stringify([book])})});
const reply=(sourceMode='intro-guide')=>Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify({usable:true,sourceMode,lesson:sampleAnalysis.lessons[0]})}}]});
it('does not let an unreadable recommended book block a basic lesson or claim that book as evidence',async()=>{
 let model:any;const fetcher=vi.fn(async(url:any,init:any)=>{if(String(url).endsWith('/tools/fetch'))return Response.json({}, {status:404});if(String(url).endsWith('/tools/search'))return Response.json({results:[]});model=JSON.parse(init.body);return reply()});
 const r=await learningApi(request(),fetcher),v=await r.json();expect(r.status).toBe(200);expect(v.value.usable).toBe(true);expect(v.preparation.mode).toBe('intro-guide');expect(v.preparation.sourceUrls).toEqual([]);expect(v.sourceReads[0].note).toContain('购买或借阅');expect(model.messages[0].content).toContain('不编造新闻');const context=JSON.parse(model.messages[1].content.split('\n\nReturn only')[0]);expect(context.externalSources).toBe('[]');expect(context.preferences.sourceMode).toBe('intro-guide');
});
it('replaces a catalog with a concrete public article, without using snippets as body text',async()=>{
 let context:any;const fetcher=vi.fn(async(url:any,init:any)=>{
 if(String(url).endsWith('/tools/fetch'))return Response.json({content:'ISBN 123 定价80 内容简介 图书目录 '.repeat(30)});
 if(String(url).endsWith('/tools/search'))return Response.json({results:[{title:'仅搜索摘要',url:'https://example.edu/snippet',summary:'不应作为正文'.repeat(200)},{title:'公开讲义',url:'https://example.edu/lecture',content:'机会成本指为当前选择放弃的最佳替代方案。'.repeat(30)}]});
 context=JSON.parse(JSON.parse(init.body).messages[1].content.split('\n\nReturn only')[0]);return reply('web');
 });const r=await learningApi(request(),fetcher),v=await r.json();expect(v.preparation.sourceUrls).toEqual(['https://example.edu/lecture']);expect(context.externalSources).not.toContain('不应作为正文');expect(context.externalSources).not.toContain('ISBN');expect(v.sourceReads.some((r:any)=>r.status==='reference_only')).toBe(true);expect(v.sources.some((s:any)=>s.url==='https://example.edu/lecture')).toBe(true);
});
it('does not re-fetch a security-rejected URL or claim a paywall means confirmed copyright restrictions',async()=>{
 const fetcher=vi.fn(async(url:any)=>String(url).endsWith('/tools/fetch')?Response.json({}, {status:403}):String(url).endsWith('/tools/search')?Response.json({results:[]}):reply());const r=await learningApi(request(),fetcher),v=await r.json();expect(r.status).toBe(200);expect(fetcher.mock.calls.filter(c=>String(c[0]).endsWith('/tools/fetch'))).toHaveLength(1);expect(v.sourceReads[0].note).toContain('不一定是版权');expect(v.preparation.mode).toBe('intro-guide');
});
it('preserves lesson basis, recommended book and existing campus data when opening and restoring a course',()=>{
 const d=upgradeArchive(createSeed()),objects=JSON.stringify(d.objects),p=blankPlanning();p.brief.topic='经济思想史';p.outline={title:'经济思想史入门',intro:'先理解不同思想如何回答生活中的经济问题。',lessons:sampleAnalysis.lessons.map(l=>({title:l.title,question:l.question,focus:l.question}))};p.text=sampleText;p.teachingVersion=2;p.sources=[book];p.lessonDrafts=sampleAnalysis.lessons.map(lesson=>checkTeachingLesson({usable:true,lesson},p,{mode:'intro-guide',sourceUrls:[],notice:'AI基础导学，不是对推荐书籍的摘要。'}));p.analysis=teachingAnalysis(p,p.lessonDrafts);d.planning=p;const id=acceptPlanningCourse(d,'社会与公共生活',false);const restored=validateData(JSON.parse(JSON.stringify(d)));expect(JSON.stringify(restored.objects)).toBe(objects);expect(restored.readingLab!.materials.find(m=>m.courseId===id)!.analysis!.lessons.every(l=>l.preparation?.mode==='intro-guide')).toBe(true);expect(restored.resources.some(r=>r.url===book.url)).toBe(true);expect(restored.lessons!.filter(l=>l.courseId===id).every(l=>l.resourceLinks.some(ref=>ref.optional&&ref.scope.includes('非必读')))).toBe(true);
});
it('makes recommendation and actual web evidence visibly distinct, with a basic-guide note',()=>{
 const p=blankPlanning();p.sources=[book,{...book,title:'公开讲义',url:'https://example.edu/open'}];p.sourceReads=[{url:book.url,status:'reference_only',note:'未读取'},{url:'https://example.edu/open',status:'readable',note:'已读片段'}];const html=renderToString(<PlanningSources draft={p}/>);expect(html).toContain('可读的网络资料');expect(html).toContain('延伸推荐');expect(html).toContain('自行购买、借阅');const note=renderToString(<PreparationNote value={{mode:'intro-guide',sourceUrls:[],notice:'尚无网页依据'}}/>);expect(note).toContain('AI 基础导学');expect(note).toContain('尚无网页依据');
});
