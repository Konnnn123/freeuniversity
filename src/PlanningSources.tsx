import type {PlanningDraft} from './planningTypes';
import type {LessonPreparation} from './labTypes';
import {safeUrl} from './model';
export function PreparationNote({value}:{value?:LessonPreparation}){if(!value)return null;return <aside className="lesson-preparation-note" role="note"><b>{value.mode==='web'?'网络资料入门课':'AI 基础导学'}</b><p>{value.notice}</p></aside>}
export function PlanningSources({draft}:{draft:PlanningDraft}){
 const readable=new Set(draft.sourceReads?.filter(r=>['readable','search_readable'].includes(r.status)).map(r=>r.url));
 const sources=draft.sources||[];
 const render=(ready:boolean)=><>{sources.filter(s=>readable.has(s.url)===ready).map(s=><details className="planner-source-card" key={s.url}><summary>{s.title}</summary><p>{s.snippet}</p><a href={safeUrl(s.url)} target="_blank" rel="noreferrer">{ready?'打开公开资料':'查看推荐来源'} ↗</a><p className="muted">{s.language||'语言待核对'} · {s.publisher||'来源见网页'} · {s.date||'日期未知'}</p>{draft.sourceReads?.filter(r=>r.url===s.url).slice(-1).map((r,i)=><p key={i}>{r.note}</p>)}{!ready&&<p>这条链接不作为已读教材。若有访问或版权限制，可以自行购买、借阅，或将已有资料导入图书馆；无需先获取它才能开始本课。</p>}</details>)}</>;
 return <div className="planner-source-groups"><section><h3>可读的网络资料</h3><p>用于备课的公开网页片段；每课会单独标注依据。</p>{readable.size?render(true):<p className="muted">暂未取得可用正文。系统会继续寻找公开讲解，必要时先准备有明确标注的基础导学。</p>}</section><section><h3>延伸推荐 · 可自行获取</h3><p>未读到正文、只有介绍或尚待核对的资料留在这里。</p>{render(false)}</section></div>
}
