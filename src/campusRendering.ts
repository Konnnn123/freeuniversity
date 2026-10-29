import {drawTerrain,drawAvatar,project,diamond} from './art';
import {campusCamera,type CameraView} from './campusCamera';
import type {CampusObject} from './model';
import {objectSprite,campusDrawOrder} from './campusSprites';
import {groundObject} from './campusLayers';
import {drawSpaceTerrain} from './sceneArt';
import type {CampusSpace} from './campusSpaces';
import {campusDestination} from './siteNavigation';
export interface CampusRenderState {objects:CampusObject[];space:CampusSpace;build:boolean;selected:string;ghost?:{object:CampusObject;valid:boolean};player:{x:number;y:number};frame:number}
export function hitCampusLabel(c:CanvasRenderingContext2D,objects:CampusObject[],point:{x:number;y:number},camera:{x:number;y:number;scale:number}){c.font='11px "Microsoft YaHei", sans-serif';return [...objects].reverse().find(o=>{const destination=campusDestination(o.kind);if(!destination)return false;const p=project(o.x+o.w*.55,o.y+o.h),x=Math.round(camera.x+p.x*camera.scale),y=Math.round(camera.y+p.y*camera.scale+4),w=Math.ceil(c.measureText(o.name).width)+16;return point.x>=x-w/2&&point.x<=x+w/2&&point.y>=y&&point.y<=y+21})}
export function createCampusPainter(){
 let terrain:HTMLCanvasElement|undefined,previous:CampusObject[]|undefined,previousGrid=false,previousSpace='';let left=0,top=0;
 return (canvas:HTMLCanvasElement,width:number,height:number,dpr:number,view:CameraView,state:CampusRenderState)=>{
  const {objects,space,build,selected,ghost,player,frame}=state,c=canvas.getContext('2d')!;
  if(!terrain||previous!==objects||previousGrid!==build||previousSpace!==space.id){
   terrain=document.createElement('canvas');left=-space.height*20-30;top=space.indoor?-100:-90;terrain.width=(space.width+space.height)*20+60;terrain.height=(space.width+space.height)*10-top+50;const t=terrain.getContext('2d')!;t.translate(-left,-top);if(space.id==='campus')drawTerrain(t,objects,build);else drawSpaceTerrain(t,space,build);previous=objects;previousGrid=build;previousSpace=space.id;
  }
  c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,width,height);c.imageSmoothingEnabled=false;const camera=campusCamera(width,height,view,space);c.save();c.translate(camera.x,camera.y);c.scale(camera.scale,camera.scale);c.drawImage(terrain,left,top);
  let avatarDrawn=false;const paintAvatar=()=>{drawAvatar(c,player.x,player.y,frame);avatarDrawn=true};
  for(const o of campusDrawOrder(objects)){
   if(!groundObject(o)&&!avatarDrawn&&o.x+o.y+o.w+o.h>player.x+player.y+2)paintAvatar();const p=project(o.x,o.y),sprite=objectSprite(o);
   if(o.id===selected)diamond(c,p.x,p.y,o.w,o.h,'#f3d68e',true);
   c.save();if(ghost?.object.id===o.id)c.globalAlpha=.3;c.drawImage(sprite.canvas,p.x+sprite.left,p.y+sprite.top);c.restore();
  }if(!avatarDrawn)paintAvatar();
  if(ghost){const o=ghost.object,p=project(o.x,o.y),sprite=objectSprite(o);c.save();c.globalAlpha=.7;c.drawImage(sprite.canvas,p.x+sprite.left,p.y+sprite.top);c.globalAlpha=.78;diamond(c,p.x,p.y,o.w,o.h,ghost.valid?'#c4dda2':'#e4a39d',true);c.restore()}
  c.restore();if(!build){c.font='11px "Microsoft YaHei",sans-serif';c.textAlign='center';for(const o of objects.filter(o=>campusDestination(o.kind))){const p=project(o.x+o.w*.55,o.y+o.h),x=Math.round(camera.x+p.x*camera.scale),y=Math.round(camera.y+p.y*camera.scale+4),w=Math.ceil(c.measureText(o.name).width)+16;if(x<0||x>width||y<0||y>height-24)continue;c.fillStyle='#fff6df';c.fillRect(x-w/2,y,w,21);c.strokeStyle='#a89b89';c.strokeRect(x-w/2+.5,y+.5,w-1,20);c.fillStyle='#655a73';c.fillText(o.name,x,y+14)}}
 };
}
