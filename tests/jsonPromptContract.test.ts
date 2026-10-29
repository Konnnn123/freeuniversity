import {it,expect,vi} from 'vitest';
import {learningApi} from '../server/learning-api.mjs';
const request=(action:string)=>new Request('https://campus.example/api/material-ai',{method:'POST',headers:{Origin:'https://campus.example','Content-Type':'application/json','X-Learning-Key':'test-key'},body:JSON.stringify({action,text:'这是中文课程内容，没有英文格式提示。'.repeat(5),sources:JSON.stringify([{title:'教材正文',url:'https://example.edu/chapter'}])})});
const reply=(content:string)=>Response.json({choices:[{finish_reason:'stop',message:{content}}]});
const error="Prompt must contain the word 'json' in some form to use 'response_format' of type 'json_object'.";
function validatePrompt(payload:any){if(payload.response_format.type==='json_object'){
 // Both roles get an explicit ASCII word; no dependency on Chinese-adjacent
 // uppercase JSON, source data, action-specific wording or provider tokenization.
 const user=payload.messages.filter((m:any)=>m.role==='user').at(-1);
 if(!/\bjson\b/.test(payload.messages[0].content)||!/\bjson\b/.test(user.content))return Response.json({error:{message:error}},{status:400});
 }return null}
it.each(['course-search-plan','course-outline','course-lesson','course-chat','concept-explore','analyze','concept','rephrase','book-index','report','enrich','book-overview','chapter-part','chapter-combine','book-overview-outline','chapter-outline'])('satisfies the real JSON-mode prerequisite for %s',async action=>{
 const fetcher=vi.fn(async(url:RequestInfo|URL,options?:RequestInit)=>{
 if(String(url).endsWith('/tools/fetch'))return Response.json({title:'教材',content:'实际可读的教材正文。'.repeat(30)});
 const payload=JSON.parse(String(options?.body));return validatePrompt(payload)||reply('{"ok":true}');});
 const response=await learningApi(request(action),fetcher);expect(response.status).toBe(200);expect((await response.json()).value.ok).toBe(true);
});
it('keeps the same explicit json instruction on the syntax-repair request',async()=>{
 let attempt=0;const fetcher=vi.fn(async(_url:RequestInfo|URL,options?:RequestInit)=>{const failure=validatePrompt(JSON.parse(String(options?.body)));if(failure)return failure;return reply(++attempt===1?'{"summary":"已有内容",}':'{"summary":"已有内容"}')});
 const response=await learningApi(request('chapter-outline'),fetcher);expect(response.status).toBe(200);expect((await response.json()).formatRepair).toBe(true);expect(fetcher).toHaveBeenCalledTimes(2);
});
it.each(['book-overview-text','chapter-text','chapter-combine-text'])('does not force JSON instructions into prose action %s',async action=>{
 const fetcher=vi.fn(async(_url:RequestInfo|URL,options?:RequestInit)=>{const payload=JSON.parse(String(options?.body));expect(payload.response_format.type).toBe('text');expect(payload.messages.at(-1).content).not.toContain('Return only a valid json object');return reply('这是一段自然的讲解正文。')});
 const response=await learningApi(request(action),fetcher);expect(response.status).toBe(200);expect((await response.json()).value.text).toContain('自然');
});
