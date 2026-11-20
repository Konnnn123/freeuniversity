import type {PdfTeachingDraft} from './pdfTeachingTypes';
import {lessonIssueText} from './lessonContract';
export function RetainedPracticePayload({value}:{value:unknown}){
 const root=value&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>:null;
 const body=root?.lesson&&typeof root.lesson==='object'&&!Array.isArray(root.lesson)?root.lesson as Record<string,unknown>:root;
 const payload=body?{activities:body.activities,quiz:body.quiz}:value;
 return <details><summary>查看 AI 实际返回的练习字段</summary><p>这是收到的原始字段，不代表已通过检查；仅保存在本机。</p><pre className="retained-practice-payload">{JSON.stringify(payload??null,null,2)}</pre></details>;
}
export function RetainedLessonDiagnostics({draft}:{draft:PdfTeachingDraft|undefined}){
 return <>{Object.entries(draft?.lessonDrafts||{}).map(([index,row])=><section key={index}><p>第 {Number(index)+1} 课 · {draft?.outline?.lessons[Number(index)]?.title||'未完成课时'} · 收到的设计已保留</p><ul>{row.issues.map((issue,i)=><li key={i}>{lessonIssueText(issue)}</li>)}</ul><RetainedPracticePayload value={row.value}/></section>)}</>;
}
