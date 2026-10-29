export interface CameraView {zoom:number;panX:number;panY:number}
interface Bounds {width:number;height:number;indoor?:boolean}
export function campusCamera(width:number,height:number,view:CameraView,bounds?:Bounds){
 if(!bounds){const scale=Math.max(.08,Math.min((width-28)/1160,(height-28)/650))*view.zoom;return {scale,x:width/2-80*scale+view.panX,y:height/2-260*scale+view.panY}}
 const {width:w,height:h}=bounds,spanX=(w+h)*20+70,spanY=(w+h)*10+(bounds.indoor?145:205),centerX=(w-h)*10,centerY=(w+h)*5-(bounds.indoor?40:65),scale=Math.max(.05,Math.min((width-28)/spanX,(height-28)/spanY))*view.zoom;
 return {scale,x:width/2-centerX*scale+view.panX,y:height/2-centerY*scale+view.panY};
}
export function screenToWorld(x:number,y:number,width:number,height:number,view:CameraView,bounds?:Bounds){const camera=campusCamera(width,height,view,bounds),sx=(x-camera.x)/camera.scale,sy=(y-camera.y)/camera.scale,worldX=(sx/20+sy/10)/2,worldY=(sy/10-sx/20)/2;return {sx,sy,worldX,worldY,x:Math.floor(worldX),y:Math.floor(worldY)}}
export function zoomCampusAt(view:CameraView,zoom:number,point:{x:number;y:number},width:number,height:number,bounds?:Bounds){const old=campusCamera(width,height,view,bounds),sx=(point.x-old.x)/old.scale,sy=(point.y-old.y)/old.scale,next={...view,zoom:Math.max(.4,Math.min(3,zoom))},camera=campusCamera(width,height,next,bounds);next.panX+=point.x-camera.x-sx*camera.scale;next.panY+=point.y-camera.y-sy*camera.scale;return next}
