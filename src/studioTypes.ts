export type Language='ja'|'en';
export type Medium='文学'|'文章'|'音乐'|'音频'|'视频'|'图像'|'文化';
export const mediaKinds:Medium[]=['文学','文章','音乐','音频','视频','图像','文化'];
export const languageNames:Record<Language,string>={ja:'日语',en:'英语'};
export interface ExplorationPreference {interests:string[];media:Medium[];creators:string;skills:string;translation:boolean;practice:boolean;hideDecor:boolean}
export interface LanguageProfile {id:Language;level:string;preferences:ExplorationPreference}
export interface MediaResource {id:string;language:Language;title:string;creator:string;source:string;medium:Medium;format:string;description:string;tags:string[];difficulty:string;minutes:number;url:string;origin:'具体作品'|'栏目入口'|'用户导入'|'原创示例';verifiedAt:string;favorite:boolean;state:string;text:string;image:string;translation:string;courseIds:string[];libraryResourceId?:string;archived:boolean;createdAt:string}
export interface MediaCollection {id:string;language:Language;name:string;description:string;resourceIds:string[]}
export interface ExplorationSession {id:string;language:Language;resourceId:string;createdAt:string;updatedAt:string;date:string;paragraph:number;timestamp:string;notes:string;drafts:Record<string,string>;expressionIds:string[];connectionIds:string[];continueWanted:boolean;state:string;intent:'仅浏览'|'留下发现'|'深入学习';logId?:string}
export interface TextAnnotation {id:string;language:Language;resourceId:string;sessionId:string;quote:string; startOffset?:number;note:string;paragraph:number;timestamp:string;point?:{x:number;y:number};createdAt:string}
export interface SavedExpression {id:string;language:Language;resourceId:string;sessionId:string;original:string;context:string;explanation:string;translation:string;usage:string;tags:string[];notes:string;timestamp:string;paragraph:number;review:boolean;createdAt:string}
export interface CulturalTopic {id:string;language:Language;title:string;body:string;evidence:string;resourceIds:string[]}
export interface KnowledgeEndpoint {type:'resource'|'expression'|'topic'|'annotation';id:string}
export interface KnowledgeConnection {id:string;language:Language;from:KnowledgeEndpoint;to:KnowledgeEndpoint;type:string;evidence:string;provenance:'用户建立'|'AI建议'}
export interface StudioData {profiles:LanguageProfile[];media:MediaResource[];sessions:ExplorationSession[];annotations:TextAnnotation[];expressions:SavedExpression[];topics:CulturalTopic[];connections:KnowledgeConnection[];collections:MediaCollection[]}
export interface ExplorationPlan {language:Language;kind:'素材探索'|'自由学习'|'个人项目';mediaId:string;topicId:string;title:string;minutes:number}
// No network implementation: a future provider must return suggestions for review.
export interface LanguageAssistanceProvider {explain(input:{language:Language;text:string;context:string}):Promise<{suggestion:string;sources:string[]}>}
