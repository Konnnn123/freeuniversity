import {canonicalParticipationKind} from './participation-schema.mjs';
export const participationPrompt=`新课练习总数控制在1–2项，可以保留一道quiz，并在lesson.activities提供一种其他形式。不要给每课都只出选择题。activities必须是数组，最多2项；kind严格使用以下名称，不使用type、reflection、short_answer等别名。使用以下任一完整结构：
{"kind":"sort","prompt":"把给定步骤按有依据的顺序排列","items":["步骤甲","步骤乙","步骤丙"],"order":[1,0,2],"feedback":"解释顺序及条件"}；order是items从0开始的完整排列，items故意打乱，不能对无固定顺序的概念强编顺序。
{"kind":"classify","prompt":"按明确标准分类","items":["案例甲","案例乙"],"categories":["类别一","类别二"],"answers":[0,1],"feedback":"逐项说明分类依据和边界"}；match同样结构，改kind为match，用于概念配对。
{"kind":"evidence","prompt":"哪些给定片段支持这一判断","items":["有依据的片段","不足以支持的片段"],"correct":[0],"feedback":"逐项说明支持与不能支持的原因"}。evidence的items全部必须为material中逐字存在的片段；包括不支持该判断的片段也必须来自原文。不得编造引文。
{"kind":"response","prompt":"用自己的话回答具体问题","reference":"参考思路而非唯一标准答案","criteria":["检查依据","检查适用条件"]}；observe结构相同，用于对照原文细节观察，不得假装已看见未传入模型的图表。
items和categories各2–8个非空字符串，criteria为1–5个非空字符串。sort/classify/match/evidence的feedback必须是一段非空字符串，不是数组或对象。response/observe使用reference字符串和criteria数组，不使用items或feedback代替这两个字段。所有答案与反馈预先写全，不把待生成当答案。只有参与练习时quiz可为[]，但至少需要一项完整练习。不要在题目中泄露正确分类或顺序。`;
const examples={
 sort:{kind:'sort',prompt:'把步骤按原文支持的顺序排列',items:['执行','确认条件','复核'],order:[1,0,2],feedback:'逐项解释先后关系与适用条件'},
 classify:{kind:'classify',prompt:'按明确标准分类',items:['案例甲','案例乙'],categories:['类别一','类别二'],answers:[0,1],feedback:'逐项解释分类依据与边界'},
 match:{kind:'match',prompt:'把概念与对应解释配对',items:['概念甲','概念乙'],categories:['解释一','解释二'],answers:[1,0],feedback:'逐项解释为什么对应'},
 evidence:{kind:'evidence',prompt:'哪些原文片段支持这个判断',items:['原文中逐字存在的片段一','原文中逐字存在的片段二'],correct:[0],feedback:'逐项说明能支持或不能支持的原因'},
 response:{kind:'response',prompt:'用自己的话回答一个具体问题',reference:'有原文依据的参考思路，不规定唯一措辞',criteria:['核对依据','核对适用条件']},
 observe:{kind:'observe',prompt:'观察当前原文中的具体细节',reference:'依据本次原文可以观察到的内容',criteria:['核对实际细节','区分观察与推断']}
};
const limits='示例中的文字必须换成基于当前原文的完整内容。items/categories各2–8个非空字符串；feedback是一段非空字符串，最多4000字符；reference是非空字符串；criteria为1–5个非空字符串。所有数字答案均为从0开始的有效下标，不得编造题目答案。evidence的每个items片段必须逐字存在于material。不得声称已看见未传入的图片。';
export function participationRepairPrompt(report){
 let r;try{r=JSON.parse(report||'{}')}catch{return ''}
 if(!Array.isArray(r.fields)||!r.fields.includes('activities'))return '';
 const old=Array.isArray(r.existing?.activities)?r.existing.activities:r.existing?.activities?[r.existing.activities]:[];
 const kinds=(old.length?old.slice(0,2):[null]).map(t=>canonicalParticipationKind(t?.kind??t?.type)||'response');
 const fields={};for(const name of r.fields){if(name==='activities')fields.activities=kinds.map(k=>examples[k]);else if(name==='quiz')fields.quiz=[{prompt:'完整题干',options:['选项甲','选项乙','选项丙'],correct:0,feedback:['解释甲','解释乙','解释丙']}];else if(['title','question','explanation','example','boundary'].includes(name))fields[name]='基于原文补齐本字段的完整文字'}
 return '本次需要补修参与练习，必须使用 fields.activities，不使用 lesson.activities 或顶层 activities。仅返回下列字段结构，保留已收到的题意并补齐具体缺失内容，不重写讲解。'+JSON.stringify({fields})+'。'+limits;
}
export function participationDesignPrompt(kind){const selected=canonicalParticipationKind(kind)||'response';return '基于当前原文与本课问题，只追加一项 '+selected+' 练习，返回顶层 activities 数组，不使用 lesson 或 fields 包裹。返回结构：'+JSON.stringify({supported:true,activities:[examples[selected]]})+'。'+limits+' 原文无法支持指定排序或配对时，返回 {"supported":false,"reason":"具体缺少什么依据，建议改用开放回答"}，不要编造固定关系。'}
export const topicPrompts={
 'topic-source':'逐句阅读本次给出的一个完整原文片段，返回JSON：{"summary":"180–300字，概括可支持的具体问题、判断依据、限制、作者立场与缺失证据"}。不要补入别的资料或假装读过原图。保存的分析以后会复用于不同课程，不按用户目标篡改原意。',
 'topic-outline':'输入是多份原资料的分片分析，已标明资料片段序号；分析不是直接引文。围绕学习目标组织一个主题单元，不照抄各文件的目录。只返回JSON：{"title":"单元名称","intro":"说明主题主线和不同资料之间的关系","lessons":[{"title":"一课一个具体问题","question":"学习问题","focus":"讲解重点及需保留的分歧与限制","sourceSlots":[1,2]}]}。1–16课，每课1–3个已给sourceSlots整数序号，不能造序号或页码，不把所有资料强行视作同一立场。不同来源有分歧时具体指出，不做无依据的统一结论。避免仅有封面或标题而无知识内容的课。不要求每份资料都变成一课，但不要遗漏与主题有关的关键依据。',
 'topic-lesson':'这是基于多份资料的主题课堂，material给出本课实际读取的原文与对应来源标识。只依据这些原文讲解，不搜索网页，不把常识冒充作者立场。解释不同资料各支持什么、相互补充或分歧在哪里，保留条件和未解决问题。不要声称分析过原图，不补造图表数值。返回与pdf小课相同的JSON：{"usable":true,"lesson":{"title":"标题","question":"本课问题","explanation":"500–1000字自然讲解","example":"自然引出的完整情境","boundary":"具体限制与分歧","quiz":[],"activities":[]}}。解释不足时返回{"usable":false,"reason":"具体缺少的原文依据"}。paragraphs由程序记录，不编造页码。'
};
