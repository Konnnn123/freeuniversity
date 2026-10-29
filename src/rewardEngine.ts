import {allCampusObjects} from './campusSpaces';
import type {CampusObject,Data} from './model';
import {uid} from './model';
import {classroomLessons} from './courseOrganization';
import {rewardCatalog,rewardById} from './rewardCatalog';
import type {ChapterReward} from './rewardTypes';
export function chapterRewardKey(d:Data,unitId:string){
 const rows=(d.lessons||[]).filter(l=>l.unitId===unitId),pdf=rows.find(l=>l.pdfTeachingPlan)?.pdfTeachingPlan;
 if(pdf)return 'pdf:'+pdf.bookId+':'+pdf.nodeId;
 const material=d.readingLab?.materials.find(m=>m.pdfTeaching&&rows.some(l=>l.labMaterialId===m.id));
 return material?.pdfTeaching&&material.sourceFile?.bookId?'pdf:'+material.sourceFile.bookId+':'+material.pdfTeaching.nodeId:'unit:'+unitId;
}
// Earned chapters are snapshots. Rebuilding a PDF chapter uses the same source
// key; deletion with retained learning records preserves these snapshots.
export function syncChapterRewards(d:Data){
 d.rewards??={chapters:[],claims:[]};
 const known=new Set(d.rewards.chapters.map(c=>c.key));
 for(const u of d.units){
  const rows=classroomLessons(d,u.courseId).filter(l=>l.unitId===u.id),key=chapterRewardKey(d,u.id);
  if(known.has(key)||!rows.length)continue;
  const souvenir=d.artifacts.find(a=>a.chapterUnitId===u.id),complete=rows.every(l=>l.status==='已完成');
  if(!complete&&!souvenir)continue;
  const course=d.courses.find(c=>c.id===u.courseId);if(!course)continue;
  const log=d.logs.find(l=>l.id===souvenir?.logId)||d.logs.find(log=>rows.some(l=>l.id===log.lessonId));
  d.rewards.chapters.push({key,unitId:u.id,courseId:course.id,courseName:course.name,unitName:u.name,earnedAt:log?.date||new Date().toISOString()});known.add(key);
 }
 return d.rewards;
}
export function pendingChapterRewards(d:Data):ChapterReward[]{const claimed=new Set(d.rewards?.claims.map(c=>c.chapterKey));return (d.rewards?.chapters||[]).filter(c=>!claimed.has(c.key))}
export const rewardQuantity=(d:Data,id:string)=>(d.rewards?.claims||[]).filter(c=>c.itemId===id).length;
export const placedRewardQuantity=(d:Data,id:string)=>allCampusObjects(d).filter(o=>o.kind==='collectible'&&o.rewardId===id).length;
export const availableRewardQuantity=(d:Data,id:string)=>Math.max(0,rewardQuantity(d,id)-placedRewardQuantity(d,id));
export function claimChapterReward(d:Data,chapterKey:string,itemId:string){
 syncChapterRewards(d);const item=rewardById(itemId),chapter=d.rewards!.chapters.find(c=>c.key===chapterKey);
 if(!item||!chapter)throw new Error('请先完成一个章节，再领取收藏。');
 if(d.rewards!.claims.some(c=>c.chapterKey===chapterKey))throw new Error('这一章的奖励已经领取了。');
 if(rewardQuantity(d,itemId)>0&&rewardCatalog.some(r=>rewardQuantity(d,r.id)===0))throw new Error('先选一件尚未解锁的收藏吧；收齐后可以继续获得摆放数量。');
 d.rewards!.claims.push({id:uid(),chapterKey,itemId,claimedAt:new Date().toISOString()});return item;
}
export function rewardBuildItem(d:Data,tool:string){
 const item=tool.startsWith('reward:')?rewardById(tool.slice(7)):undefined;
 return item&&rewardQuantity(d,item.id)>0?{kind:'collectible' as const,rewardId:item.id,name:item.name,w:item.w,h:item.h,category:'奖励收藏'}:undefined;
}
export function removeCourseRewards(d:Data,courseId:string,keep:boolean){
 syncChapterRewards(d);if(keep)return;
 const keys=new Set(d.rewards!.chapters.filter(c=>c.courseId===courseId).map(c=>c.key));
 d.rewards!.chapters=d.rewards!.chapters.filter(c=>!keys.has(c.key));d.rewards!.claims=d.rewards!.claims.filter(c=>!keys.has(c.chapterKey));
 const used=new Map<string,number>(),retain=(objects:CampusObject[])=>objects.filter(o=>{if(o.kind!=='collectible')return true;const id=o.rewardId||'',count=(used.get(id)||0)+1;used.set(id,count);return count<=rewardQuantity(d,id)});d.objects=retain(d.objects);if(d.spaces)for(const id of Object.keys(d.spaces))d.spaces[id]=retain(d.spaces[id]);
}
export function validateRewards(d:Data){
 const collection=d.rewards;
 if(collection){
  if(!Array.isArray(collection.chapters)||!Array.isArray(collection.claims)||new Set(collection.chapters.map(c=>c?.key)).size!==collection.chapters.length||new Set(collection.claims.map(c=>c?.id)).size!==collection.claims.length||new Set(collection.claims.map(c=>c?.chapterKey)).size!==collection.claims.length)throw new Error('收藏图鉴存档格式有误');
  for(const c of collection.chapters)if(!c||!['key','unitId','courseId','courseName','unitName','earnedAt'].every(k=>typeof c[k as keyof typeof c]==='string')||!c.key)throw new Error('章节奖励记录有误');
  for(const c of collection.claims)if(!c||typeof c.id!=='string'||!c.id||typeof c.claimedAt!=='string'||!rewardById(c.itemId)||!collection.chapters.some(v=>v.key===c.chapterKey))throw new Error('收藏领取记录有误');
 }
 const used=new Map<string,number>();for(const o of allCampusObjects(d)){
  if(o.kind!=='collectible'){if(o.rewardId!==undefined)throw new Error('校园收藏类型有误');continue}
  const item=rewardById(o.rewardId||'');if(!item||o.w!==item.w||o.h!==item.h)throw new Error('校园收藏关联有误');
  const count=(used.get(item.id)||0)+1;used.set(item.id,count);if(count>rewardQuantity(d,item.id))throw new Error('摆放数量超过已领取的收藏数量');
 }
}
