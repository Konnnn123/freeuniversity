import type {CampusObject,Data} from './model';
export interface CampusSpace {id:string;name:string;description:string;theme:'campus'|'library'|'studio'|'forest'|'courtyard';width:number;height:number;indoor:boolean}
export const campusSpaces:CampusSpace[]=[
 {id:'campus',name:'校园全景',description:'课表、课程、图书馆与成果馆，从地图标注或底部进入。',theme:'campus',width:32,height:24,indoor:false},
 {id:'reading-room',name:'图书馆阅读室',description:'木地板、书架与阅读桌，给自己留一个安静的角落。',theme:'library',width:18,height:14,indoor:true},
 {id:'creative-studio',name:'创作工作室',description:'把画架、作品与小收藏，放在自己喜欢的位置。',theme:'studio',width:18,height:14,indoor:true},
 {id:'woodland',name:'林间花园',description:'在树影与花坛之间，留一点散步和发呆的地方。',theme:'forest',width:24,height:18,indoor:false},
 {id:'lakeside',name:'湖畔庭院',description:'沿着小池塘布置长椅、路灯和收藏，慢慢歇一会儿。',theme:'courtyard',width:24,height:18,indoor:false}
];
export const campusSpace=(id:string|null|undefined)=>campusSpaces.find(s=>s.id===id)||campusSpaces[0];
export function initialSpaceObjects(id:string):CampusObject[]{
 const rows:[CampusObject['kind'],string,number,number,number,number][]=[];
 if(id==='reading-room')rows.push(['bookcase','靠墙书架',1,1,2,1],['bookcase','靠墙书架',4,1,2,1],['bookcase','靠墙书架',7,1,2,1],['reading-table','长阅读桌',4,5,3,2],['reading-table','长阅读桌',10,5,3,2],['stool','阅读椅',4,8,1,1],['stool','阅读椅',6,8,1,1],['stool','阅读椅',10,8,1,1],['stool','阅读椅',12,8,1,1],['indoor-plant','室内绿植',15,2,1,1]);
 if(id==='creative-studio')rows.push(['reading-table','创作长桌',4,5,3,2],['stool','创作椅',5,8,1,1],['easel-prop','小画架',11,3,1,1],['easel-prop','小画架',13,5,1,1],['bookcase','作品架',2,1,2,1],['indoor-plant','室内绿植',15,2,1,1]);
 if(id==='woodland')rows.push(['tree','林间的树',2,2,1,1],['tree','林间的树',5,2,1,1],['tree','林间的树',19,3,1,1],['tree','林间的树',20,12,1,1],['tree','林间的树',3,13,1,1],['flowers','花坛',6,5,2,1],['flowers','花坛',15,10,2,1],['bench','林间长椅',8,7,2,1],['lamp','林间路灯',10,7,1,1]);
 if(id==='lakeside')rows.push(['bench','湖畔长椅',12,8,2,1],['bench','庭院长椅',8,12,2,1],['lamp','庭院路灯',11,8,1,1],['tree','庭院的树',3,3,1,1],['tree','庭院的树',4,13,1,1],['flowers','庭院花坛',6,4,2,1],['flowers','庭院花坛',15,12,2,1]);
 if(id==='woodland')rows.push(['tree','林间的树',9,1,1,1],['tree','林间的树',14,2,1,1],['tree','林间的树',21,6,1,1],['tree','林间的树',21,15,1,1],['tree','林间的树',8,15,1,1],['tree','林间的树',1,9,1,1],['tree','林间的树',2,5,1,1],['bench','林间长椅',13,12,2,1],['flowers','林间花坛',4,11,2,1],['flowers','林间花坛',16,5,2,1],['lamp','林间路灯',15,12,1,1]);
 if(id==='lakeside')rows.push(['tree','庭院的树',2,9,1,1],['tree','庭院的树',10,2,1,1],['tree','庭院的树',21,12,1,1],['tree','庭院的树',18,15,1,1],['flowers','庭院花坛',12,3,2,1],['flowers','庭院花坛',4,7,2,1],['flowers','庭院花坛',18,10,2,1],['bench','湖畔长椅',16,8,2,1],['lamp','庭院路灯',18,8,1,1]);
 return rows.map(([kind,name,x,y,w,h],i)=>({id:'space-'+id+'-'+i,kind,name,x,y,w,h}));
}
export const spaceObjects=(d:Data,id:string)=>id==='campus'?d.objects:d.spaces?.[id]||[];
export const allCampusObjects=(d:Data)=>[...d.objects,...Object.values(d.spaces||{}).flat()];
export function ensureCampusSpace(d:Data,id:string){if(id==='campus')return;if(!campusSpaces.some(s=>s.id===id))throw new Error('找不到这个场景');d.spaces??={};d.spaces[id]??=initialSpaceObjects(id)}
export function saveSpaceObjects(d:Data,id:string,objects:CampusObject[]){if(id==='campus')d.objects=objects;else{ensureCampusSpace(d,id);d.spaces![id]=objects}}
export const isSpaceWater=(s:CampusSpace,x:number,y:number)=>s.id==='lakeside'&&x>=17&&x<22&&y>=2&&y<7;
export function validateCampusSpaces(d:Data){
 if(d.spaces===undefined)return;if(!d.spaces||typeof d.spaces!=='object'||Array.isArray(d.spaces))throw new Error('场景布置存档有误');
 const ids=new Set(d.objects.map(o=>o.id));for(const [id,objects]of Object.entries(d.spaces)){
  const s=campusSpaces.find(s=>s.id===id&&id!=='campus');if(!s||!Array.isArray(objects))throw new Error('场景类型有误');
  for(const o of objects){if(!o||typeof o.id!=='string'||!o.id||ids.has(o.id)||typeof o.name!=='string'||!['collectible','tree','flowers','bench','lamp','fountain','path','grass','reading-table','stool','bookcase','easel-prop','indoor-plant'].includes(o.kind)||![o.x,o.y,o.w,o.h].every(Number.isInteger)||o.w<1||o.h<1||o.x<0||o.y<0||o.x+o.w>s.width||o.y+o.h>s.height)throw new Error('场景物品或占地有误');ids.add(o.id);for(let x=o.x;x<o.x+o.w;x++)for(let y=o.y;y<o.y+o.h;y++)if(isSpaceWater(s,x,y))throw new Error('场景物品不能放在池塘里')}
 }
}
