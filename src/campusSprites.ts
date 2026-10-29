import {drawObject,project,treeVariant} from './art';
import type {CampusObject} from './model';
import {groundObject} from './campusLayers';
import {rewardSpriteRevision} from './rewardSprites';
export interface ObjectSprite {canvas:HTMLCanvasElement;left:number;top:number;alpha:Uint8Array}
const cache=new Map<string,ObjectSprite>();let lastRevision=-1;
export function objectSprite(o:CampusObject):ObjectSprite{
 const revision=rewardSpriteRevision();if(revision!==lastRevision){for(const key of cache.keys())if(key.startsWith('collectible/'))cache.delete(key);lastRevision=revision}
 const key=`${o.kind}/${o.rewardId||''}/${o.w}/${o.h}/${o.kind==='tree'?treeVariant(o):0}`;let sprite=cache.get(key);
 if(!sprite){const canvas=document.createElement('canvas'),left=-o.h*20-45,top=-170;canvas.width=(o.w+o.h)*20+90;canvas.height=(o.w+o.h)*10+210;const c=canvas.getContext('2d')!;c.imageSmoothingEnabled=false;const p=project(o.x,o.y);c.translate(-p.x-left,-p.y-top);drawObject(c,o);const rgba=c.getImageData(0,0,canvas.width,canvas.height).data,alpha=new Uint8Array(canvas.width*canvas.height);for(let i=0;i<alpha.length;i++)alpha[i]=rgba[i*4+3];sprite={canvas,left,top,alpha};if(cache.size>128)cache.clear();cache.set(key,sprite)}return sprite;
}
export function campusDrawOrder(objects:CampusObject[]){return [...objects].sort((a,b)=>Number(groundObject(b))-Number(groundObject(a))||a.x+a.y+a.w+a.h-b.x-b.y-b.w-b.h||a.id.localeCompare(b.id))}
export function hitCampusObject(objects:CampusObject[],sx:number,sy:number){
 for(const o of campusDrawOrder(objects).reverse()){const p=project(o.x,o.y),sprite=objectSprite(o),x=Math.floor(sx-p.x-sprite.left),y=Math.floor(sy-p.y-sprite.top);if(x<0||y<0||x>=sprite.canvas.width||y>=sprite.canvas.height)continue;if(sprite.alpha[y*sprite.canvas.width+x]>32)return o}return undefined;
}
