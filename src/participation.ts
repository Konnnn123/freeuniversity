import {canonicalParticipationKind} from '../server/participation-schema.mjs';
export type ParticipationTask=
 |{kind:'sort';prompt:string;items:string[];order:number[];feedback:string}
 |({kind:'classify'}|{kind:'match'})&{prompt:string;items:string[];categories:string[];answers:number[];feedback:string}
 |{kind:'evidence';prompt:string;items:string[];correct:number[];feedback:string}
 |({kind:'response'}|{kind:'observe'})&{prompt:string;reference:string;criteria:string[]};
export interface ParticipationIssue {field:string;reason:string}
export class ParticipationContractError extends Error {constructor(public issues:ParticipationIssue[]){super(issues.map(i=>i.field+'：'+i.reason).join('；'));this.name='ParticipationContractError'}}
// Equivalent representations only. Missing answers are never invented, and
// numeric indexes are never shifted from an assumed one-based convention.
export function normalizeParticipationInput(value:unknown):unknown{
 const input=structuredClone(value),rows=Array.isArray(input)?input:input&&typeof input==='object'&&('kind' in input||'type' in input)?[input]:null;
 if(!rows)return input;
 return rows.map(raw=>{if(!raw||typeof raw!=='object'||Array.isArray(raw))return raw;const t={...raw} as Record<string,unknown>;
  const kind=canonicalParticipationKind(t.kind??t.type);if(kind)t.kind=kind;
  const alias=(field:string,keys:string[])=>{if(t[field]===undefined){const key=keys.find(k=>t[k]!==undefined);if(key)t[field]=t[key]}};
  alias('prompt',['question']);
  if(kind==='response'||kind==='observe'){alias('reference',['referenceAnswer','sampleAnswer','modelAnswer','answer']);alias('criteria',['rubric','checkpoints']);if(typeof t.criteria==='string'&&t.criteria.trim())t.criteria=[t.criteria]}
  else {alias('items',kind==='sort'?['steps']:kind==='evidence'?['passages','quotes']:['statements','cases']);
   if(Array.isArray(t.items)&&t.items.every(x=>x&&typeof x==='object'&&typeof x.text==='string'))t.items=t.items.map(x=>x.text);
   alias('order',['correctOrder']);alias('answers',['correctAnswers']);
   for(const field of ['order','answers','correct'])if(Array.isArray(t[field]))t[field]=t[field].map((n:unknown)=>typeof n==='string'&&/^\d+$/.test(n)?Number(n):n);
   if(Array.isArray(t.feedback)&&Array.isArray(t.items)&&t.feedback.length===t.items.length&&t.feedback.length>0&&t.feedback.every(x=>typeof x==='string'&&x.trim()))t.feedback=t.feedback.join('\n\n');
  }return t;
 });
}
export function checkParticipation(value:unknown):ParticipationTask[]{
 if(!Array.isArray(value)||value.length>2)throw new ParticipationContractError([{field:'activities',reason:'需要数组，且最多2项练习'}]);
 const issues:ParticipationIssue[]=[];
 const str=(x:unknown,max=2000)=>typeof x==='string'&&!!x.trim()&&x.length<=max;
 const texts=(x:unknown,min=2,max=8):x is string[]=>Array.isArray(x)&&x.length>=min&&x.length<=max&&x.every(v=>str(v,1000));
 const indexes=(x:unknown,n:number):x is number[]=>Array.isArray(x)&&x.every(i=>Number.isInteger(i)&&i>=0&&i<n);
 value.forEach((t,i)=>{const path='activities['+i+']',issue=(field:string,reason:string)=>issues.push({field:path+'.'+field,reason});
  if(!t||typeof t!=='object'||Array.isArray(t)){issues.push({field:path,reason:'缺少完整练习对象'});return}
  if(!str(t.prompt))issue('prompt','缺少完整题目，或题目超过2000字符');
  if(!['sort','classify','match','evidence','response','observe'].includes(t.kind)){issue('kind','不支持的参与练习类型；需要 sort/classify/match/evidence/response/observe');return}
  if(t.kind==='response'||t.kind==='observe'){if(!str(t.reference,4000))issue('reference','缺少参考思路，或超过4000字符');if(!texts(t.criteria,1,5))issue('criteria','需要1–5条非空自检要点，每条最多1000字符')}
  else {if(!texts(t.items))issue('items','需要2–8个非空文字项目，每项最多1000字符');if(!str(t.feedback,4000))issue('feedback','需要一段非空反馈文字，最多4000字符');
   if(t.kind==='sort'){if(!indexes(t.order,t.items?.length||0)||t.order.length!==t.items?.length||new Set(t.order).size!==t.items?.length)issue('order','排序答案必须完整且不重复；使用从0开始的项目下标')}
   else if(t.kind==='classify'||t.kind==='match'){if(!texts(t.categories))issue('categories','需要2–8个非空类别或配对目标');if(!indexes(t.answers,t.categories?.length||0)||t.answers.length!==t.items?.length)issue('answers','分类或配对答案不完整；每个项目需要一个从0开始的类别下标')}
   else if(!indexes(t.correct,t.items?.length||0)||!t.correct.length||new Set(t.correct).size!==t.correct.length)issue('correct','证据选择答案有误；需要不重复的有效项目下标');
  }
 });if(issues.length)throw new ParticipationContractError(issues);return structuredClone(value);
}
export function taskCorrect(task:ParticipationTask,answer:unknown):boolean|null{
 if(task.kind==='response'||task.kind==='observe')return null;
 if(!Array.isArray(answer))return false;
 const expected=task.kind==='sort'?task.order:task.kind==='evidence'?task.correct:task.answers;
 const a=task.kind==='evidence'?[...answer].sort((a,b)=>a-b):answer,e=task.kind==='evidence'?[...expected].sort((a,b)=>a-b):expected;
 return a.length===e.length&&a.every((x,i)=>x===e[i]);
}
export function taskReady(task:ParticipationTask,answer:unknown){if(task.kind==='response'||task.kind==='observe')return typeof answer==='string'&&answer.trim().length>0;if(!Array.isArray(answer))return false;if(task.kind==='evidence')return answer.length>0;return answer.length===task.items.length&&answer.every(x=>Number.isInteger(x)&&x>=0)}
export function initialTaskAnswer(task:ParticipationTask):string|number[]{return task.kind==='response'||task.kind==='observe'?'':task.kind==='sort'?task.items.map((_,i)=>task.order.every((n,j)=>n===j)?(i+1)%task.items.length:i):task.kind==='evidence'?[]:task.items.map(()=>-1)}

export function checkTaskEvidence(tasks:ParticipationTask[],text:string){for(const task of tasks)if(task.kind==='evidence'&&task.items.some(item=>!text.includes(item.trim())))throw new Error('证据练习中的片段未逐字出现在当前原文，未保存');}
