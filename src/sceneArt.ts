import {diamond,project,poly,line,rect} from './art';
import type {CampusSpace} from './campusSpaces';
export function drawSpaceTerrain(c:CanvasRenderingContext2D,s:CampusSpace,grid=false){
 const w=s.width,h=s.height;
 diamond(c,0,12,w,h,s.indoor?'#ac987f':'#839b7e');diamond(c,0,5,w,h,s.indoor?'#d7c3a2':'#a3b68f');
 for(let x=0;x<w;x++)for(let y=0;y<h;y++){const p=project(x,y),path=s.theme==='forest'?(Math.abs(y-h*.55-Math.sin(x*.4)*1.5)<1.2):s.theme==='courtyard';const color=s.indoor?((x+y)%2?'#e8d8b9':'#e3d0ae'):path?((x+y)%2?'#e4d7bc':'#ded0b3'):((x+y)%2?'#b6cb9e':'#afc598');diamond(c,p.x,p.y,1,1,color,grid);if(s.indoor)line(c,[p.x+1,p.y+1],[p.x-18,p.y+10],'#d1bb9b')}
 if(s.indoor){
  const a=project(w,0),b=project(0,h),z=78;
  poly(c,[[0,0],[a.x,a.y],[a.x,a.y-z],[0,-z]],s.theme==='library'?'#e8e5ce':'#e8dce9','#a99a9f');poly(c,[[0,0],[b.x,b.y],[b.x,b.y-z],[0,-z]],s.theme==='library'?'#d8ddc6':'#d9cfe0','#a99a9f');
  line(c,[0,-7],[a.x,a.y-7],'#b7a78e');line(c,[0,-7],[b.x,b.y-7],'#aa9b85');line(c,[0,-z],[a.x,a.y-z],'#fff0d4');line(c,[0,-z],[b.x,b.y-z],'#fff0d4');
  for(let i=3;i<w-1;i+=6){const p=project(i,0);poly(c,[[p.x,p.y-59],[p.x+38,p.y-40],[p.x+38,p.y-12],[p.x,p.y-31]],'#9cbfc1','#9b8da0');line(c,[p.x+19,p.y-49],[p.x+19,p.y-21],'#fff0d4');line(c,[p.x,p.y-45],[p.x+38,p.y-26],'#fff0d4')}
  for(const i of [4,9]){const p=project(0,i);poly(c,[[p.x,p.y-59],[p.x-30,p.y-44],[p.x-30,p.y-17],[p.x,p.y-32]],'#b5997c','#958377');poly(c,[[p.x-3,p.y-54],[p.x-27,p.y-42],[p.x-27,p.y-22],[p.x-3,p.y-34]],'#f4e8cf');line(c,[p.x-7,p.y-37],[p.x-23,p.y-42],s.theme==='library'?'#8eaa85':'#ba9bbf');line(c,[p.x-13,p.y-32],[p.x-14,p.y-47],'#abbc96')}
 }else if(s.id==='lakeside'){
  const p=project(17,2);diamond(c,p.x,p.y-1,5,5,'#b6b3a2',true);diamond(c,p.x,p.y-2,4.8,4.8,'#8fbab8');for(let i=0;i<12;i++){const q=project(17.5+(i*7%4),2.5+(i*3%4));line(c,[q.x-5,q.y],[q.x+5,q.y],'#c2e0d3')}
 }else{for(let i=0;i<8;i++){const p=project(2+i*2,1);rect(c,p.x,p.y,2,2,'#d3dba8')}}
}
