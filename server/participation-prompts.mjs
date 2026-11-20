export const participationPrompt=`新课练习总数控制在1–2项，可以保留一道quiz，并在lesson.activities提供一种其他形式。不要给每课都只出选择题。activities最多2项，使用以下任一完整结构：
{"kind":"sort","prompt":"把给定步骤按有依据的顺序排列","items":["步骤甲","步骤乙","步骤丙"],"order":[1,0,2],"feedback":"解释顺序及条件"}；order是items从0开始的完整排列，items故意打乱，不能对无固定顺序的概念强编顺序。
{"kind":"classify","prompt":"按明确标准分类","items":["案例甲","案例乙"],"categories":["类别一","类别二"],"answers":[0,1],"feedback":"逐项说明分类依据和边界"}；match同样结构，改kind为match，用于概念配对。
{"kind":"evidence","prompt":"哪些给定片段支持这一判断","items":["有依据的片段","不足以支持的片段"],"correct":[0],"feedback":"逐项说明支持与不能支持的原因"}。evidence的items全部必须为material中逐字存在的片段；包括不支持该判断的片段也必须来自原文。不得编造引文。
{"kind":"response","prompt":"用自己的话回答具体问题","reference":"参考思路而非唯一标准答案","criteria":["检查依据","检查适用条件"]}；observe结构相同，用于对照原文细节观察，不得假装已看见未传入模型的图表。
items和categories各2–8项，criteria 1–5项。所有反馈预先写全，不把待生成当答案。只有开放题时quiz可为[]；旧式quiz仍支持。不要在题目中泄露正确分类或顺序。`;
export const topicPrompts={
 'topic-source':'逐句阅读本次给出的一个完整原文片段，返回JSON：{"summary":"180–300字，概括可支持的具体问题、判断依据、限制、作者立场与缺失证据"}。不要补入别的资料或假装读过原图。保存的分析以后会复用于不同课程，不按用户目标篡改原意。',
 'topic-outline':'输入是多份原资料的分片分析，已标明资料片段序号；分析不是直接引文。围绕学习目标组织一个主题单元，不照抄各文件的目录。只返回JSON：{"title":"单元名称","intro":"说明主题主线和不同资料之间的关系","lessons":[{"title":"一课一个具体问题","question":"学习问题","focus":"讲解重点及需保留的分歧与限制","sourceSlots":[1,2]}]}。1–16课，每课1–3个已给sourceSlots整数序号，不能造序号或页码，不把所有资料强行视作同一立场。不同来源有分歧时具体指出，不做无依据的统一结论。避免仅有封面或标题而无知识内容的课。不要求每份资料都变成一课，但不要遗漏与主题有关的关键依据。',
 'topic-lesson':'这是基于多份资料的主题课堂，material给出本课实际读取的原文与对应来源标识。只依据这些原文讲解，不搜索网页，不把常识冒充作者立场。解释不同资料各支持什么、相互补充或分歧在哪里，保留条件和未解决问题。不要声称分析过原图，不补造图表数值。返回与pdf小课相同的JSON：{"usable":true,"lesson":{"title":"标题","question":"本课问题","explanation":"500–1000字自然讲解","example":"自然引出的完整情境","boundary":"具体限制与分歧","quiz":[],"activities":[]}}。解释不足时返回{"usable":false,"reason":"具体缺少的原文依据"}。paragraphs由程序记录，不编造页码。'
};
