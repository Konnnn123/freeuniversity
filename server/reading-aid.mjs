export const readingAidPrompts={
 'reading-translate':'你在帮助学习者对照外语原文。material是原文上下文，report.quote是需要译成简体中文的原样片段。只翻译该片段，利用上下文理解指代，保留人名、专业词、否定、情态、数字、单位和条件。必要时在中文术语后保留原词。不添加教学讲解、原文未说的事实或总结，不把偏好当作原文。原文已经是中文时保留原意，不扩写。只返回JSON：{"text":"完整中文译文"}，总字符最多12000。',
 'reading-explain':'你在帮助学习者理解选中的原文。material是实际原文上下文，report.quote是所选原句，preferences.lesson可能是本课AI讲解的一部分。先用中文解释所选句子的意思、术语或难点，再在有依据时说明它与所给讲解的关系。明确区分作者原话与解释；材料不足以支持某个讲解判断时具体指出缺少的条件，不强行建立支持关系，不冒称读过未提供的页、图表或整本书。只使用当前上下文，不编造背景、引文和现行政策结论。回答自然简洁，约150–350字，只返回JSON：{"text":"选句解释"}，总字符最多3000。'
};
export function validReadingAid(body){if(!['reading-translate','reading-explain'].includes(body?.action))return true;let r;try{r=JSON.parse(body.report||'{}')}catch{return false}return typeof body.text==='string'&&body.text.length<=24000&&typeof r?.quote==='string'&&r.quote.trim().length>0&&r.quote.length<=5000&&body.text.includes(r.quote)}
