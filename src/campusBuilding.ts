import type {CampusObject,Data} from './model';
import {canPlace,walkable} from './model';
import {campusSpace,isSpaceWater,saveSpaceObjects,spaceObjects,validateCampusSpaces,type CampusSpace} from './campusSpaces';
import {validateRewards,availableRewardQuantity} from './rewardEngine';
export const buildingKinds=new Set(['office','classroom','schedule','library','workshop','museum','garden']);
export {groundObject} from './campusLayers';
export function placementProblem(d:Data,s:CampusSpace,o:CampusObject,ignore=''){
 if(![o.x,o.y,o.w,o.h].every(Number.isInteger)||o.x<0||o.y<0||o.x+o.w>s.width||o.y+o.h>s.height)return '超出这个场景的边界了，往里面挪一点。';
 if(s.indoor&&buildingKinds.has(o.kind))return '室内适合家具和小收藏，建筑可以放在校园里。';
 for(let x=o.x;x<o.x+o.w;x++)for(let y=o.y;y<o.y+o.h;y++)if(isSpaceWater(s,x,y))return '这里是池塘，请放在岸边。';
 if(!ignore&&o.rewardId&&availableRewardQuantity(d,o.rewardId)<1)return '这件收藏已经摆好了，可以先移动或收回它。';
 const objects=spaceObjects(d,s.id).filter(v=>!(!ignore&&['path','grass'].includes(o.kind)&&['path','grass'].includes(v.kind)&&o.x===v.x&&o.y===v.y));if(!canPlace(objects,o,ignore,{width:s.width,height:s.height}))return '这里已经摆了物品，请换一块空地。';return '';
}
export function applyPlacement(d:Data,spaceId:string,o:CampusObject,move=false){const s=campusSpace(spaceId),current=spaceObjects(d,s.id);if(move&&!current.some(v=>v.id===o.id))throw new Error('原物品已不在这个场景中');const problem=placementProblem(d,s,o,move?o.id:'');if(problem)throw new Error(problem);const retained=!move&&['path','grass'].includes(o.kind)?current.filter(v=>!(['path','grass'].includes(v.kind)&&v.x===o.x&&v.y===o.y)):current;saveSpaceObjects(d,s.id,move?retained.map(v=>v.id===o.id?o:v):[...retained,o])}
export const spaceWalkable=(objects:CampusObject[],s:CampusSpace,x:number,y:number)=>!isSpaceWater(s,x,y)&&walkable(objects,x,y,{width:s.width,height:s.height});
export function findSpacePath(objects:CampusObject[],s:CampusSpace,start:{x:number;y:number},end:{x:number;y:number}){
 if(!spaceWalkable(objects,s,end.x,end.y))return [];const q=[start],prev=new Map<string,{x:number;y:number}|null>([[start.x+','+start.y,null]]);
 for(let i=0;i<q.length;i++){const p=q[i];if(p.x===end.x&&p.y===end.y){const path=[];let at:typeof p|null=p;while(at){path.unshift(at);at=prev.get(at.x+','+at.y)??null}return path.slice(1)}for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const n={x:p.x+dx,y:p.y+dy},key=n.x+','+n.y;if(!prev.has(key)&&spaceWalkable(objects,s,n.x,n.y)){prev.set(key,p);q.push(n)}}}return [];
}
export function spaceSpawn(objects:CampusObject[],s:CampusSpace){const wanted={x:Math.floor(s.width/2),y:Math.floor(s.height*.75)};if(spaceWalkable(objects,s,wanted.x,wanted.y))return wanted;for(let y=s.height-1;y>=0;y--)for(let x=0;x<s.width;x++)if(spaceWalkable(objects,s,x,y))return {x,y};return {x:0,y:0}}

export function restoreSpaceLayout(d:Data,id:string,objects:CampusObject[]){
 const before=spaceObjects(d,id);saveSpaceObjects(d,id,structuredClone(objects));
 try{validateCampusSpaces(d);validateRewards(d)}catch(e){saveSpaceObjects(d,id,before);if((e as Error).message.includes('超过已领取'))throw new Error('有收藏已放在其他场景，先收回它后再恢复这一步。');throw e}
}
export function draggedCampusObject(o:CampusObject,point:{worldX:number;worldY:number},offset:{x:number;y:number}){return {...o,x:Math.round(point.worldX-offset.x),y:Math.round(point.worldY-offset.y)}}
