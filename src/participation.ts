export type ParticipationTask=
 |{kind:'sort';prompt:string;items:string[];order:number[];feedback:string}
 |({kind:'classify'}|{kind:'match'})&{prompt:string;items:string[];categories:string[];answers:number[];feedback:string}
 |{kind:'evidence';prompt:string;items:string[];correct:number[];feedback:string}
 |({kind:'response'}|{kind:'observe'})&{prompt:string;reference:string;criteria:string[]};
export function checkParticipation(value:unknown):ParticipationTask[]{
 if(!Array.isArray(value)||value.length>2)throw new Error('参与练习需要1–2项');
 const str=(x:unknown,max=2000)=>typeof x==='string'&&!!x.trim()&&x.length<=max;
 const texts=(x:unknown,min=2,max=8):x is string[]=>Array.isArray(x)&&x.length>=min&&x.length<=max&&x.every(v=>str(v,1000));
 const indexes=(x:unknown,n:number):x is number[]=>Array.isArray(x)&&x.every(i=>Number.isInteger(i)&&i>=0&&i<n);
 for(const t of value){if(!t||!str(t.prompt))throw new Error('参与练习缺少题目');
  if(t.kind==='response'||t.kind==='observe'){if(!str(t.reference,4000)||!texts(t.criteria,1,5))throw new Error('开放练习缺少参考与观察要点')}
  else {if(!texts(t.items)||!str(t.feedback,4000))throw new Error('参与练习缺少项目或反馈');
   if(t.kind==='sort'){if(!indexes(t.order,t.items.length)||t.order.length!==t.items.length||new Set(t.order).size!==t.items.length)throw new Error('排序答案必须完整且不重复')}
   else if(t.kind==='classify'||t.kind==='match'){if(!texts(t.categories)||!indexes(t.answers,t.categories.length)||t.answers.length!==t.items.length)throw new Error('分类或配对答案不完整')}
   else if(t.kind==='evidence'){if(!indexes(t.correct,t.items.length)||!t.correct.length||new Set(t.correct).size!==t.correct.length)throw new Error('证据选择答案有误')}
   else throw new Error('不支持的参与练习类型');
  }
 }return structuredClone(value);
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
