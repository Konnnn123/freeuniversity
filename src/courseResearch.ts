import type {LessonPreparation} from './labTypes';
export interface ResearchPlan {queries:string[];rationale:string}
export function fallbackResearchPlan(topic:string):ResearchPlan{const term=topic.trim().slice(0,65);return {queries:[term+' 公开讲解 入门 概念 lang:zh',term+' 开放教材 具体章节 大学讲义 lang:zh'],rationale:'先寻找公开可读的解释和讲义；书籍、目录与付费入口只作延伸推荐。'}}
export function checkLessonPreparation(value:unknown):LessonPreparation{const v=value as LessonPreparation;if(!v||!['web','intro-guide'].includes(v.mode)||!Array.isArray(v.sourceUrls)||v.sourceUrls.length>8||v.sourceUrls.some(u=>typeof u!=='string'||!/^https?:\/\//.test(u))||typeof v.notice!=='string'||v.notice.length>1000||(v.mode==='intro-guide'&&v.sourceUrls.length))throw new Error('课时资料依据格式有误');return structuredClone(v)}
export function checkResearchPlan(value:unknown):ResearchPlan{const v=value as ResearchPlan;if(!v||!Array.isArray(v.queries)||v.queries.length<2||v.queries.length>4||v.queries.some(q=>typeof q!=='string'||!q.trim()||q.length>110)||typeof v.rationale!=='string'||v.rationale.length>1000)throw new Error('检索方案不完整，请继续重试');const queries=[...new Set(v.queries.map(q=>q.trim()))];if(queries.length<2)throw new Error('请提供至少两组不同检索词');return {queries,rationale:v.rationale}}
export interface ResearchRun {query:string;count:number;error?:string}
export interface SourceRead {url:string;status:string;note:string}
