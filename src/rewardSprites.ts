import type {CampusObject} from './model';
import {rewardById,rewardImage} from './rewardCatalog';
const images=new Map<string,HTMLImageElement>();let revision=0;
export const rewardSpriteRevision=()=>revision;
export function drawRewardObject(c:CanvasRenderingContext2D,o:CampusObject){
 const item=rewardById(o.rewardId||'');if(!item)return;
 let image=images.get(item.id);if(!image&&typeof Image!=='undefined'){image=new Image();image.onload=()=>{revision++};image.src=rewardImage(item.id);images.set(item.id,image)}
 if(!image?.complete||!image.naturalWidth)return;
 const x=(o.x-o.y)*20+(o.w-o.h)*10,y=(o.x+o.y)*10+(o.w+o.h)*10,size=item.size;
 c.drawImage(image,x-size/2,y-size*.9,size,size);
}
