import {drawRewardObject} from './rewardSprites';
import type {CampusObject} from './model';
export const tileW=20,tileH=10;
export const project=(x:number,y:number)=>({x:(x-y)*tileW,y:(x+y)*tileH});
const ink='#655a73';
type C=CanvasRenderingContext2D;
type Point=[number,number];
export function rect(c:C,x:number,y:number,w:number,h:number,color:string){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)))}
// Integer scanlines and Bresenham edges give the art true pixel steps.
export function line(c:C,a:Point,b:Point,color:string){let x=Math.round(a[0]),y=Math.round(a[1]);const bx=Math.round(b[0]),by=Math.round(b[1]),dx=Math.abs(bx-x),dy=-Math.abs(by-y),sx=x<bx?1:-1,sy=y<by?1:-1;let err=dx+dy;for(;;){rect(c,x,y,1,1,color);if(x===bx&&y===by)break;const e=2*err;if(e>=dy){err+=dy;x+=sx}if(e<=dx){err+=dx;y+=sy}}}
export function poly(c:C,points:Point[],color:string,border?:string){const p=points.map(([x,y])=>[Math.round(x),Math.round(y)]as Point);const top=Math.min(...p.map(p=>p[1])),bottom=Math.max(...p.map(p=>p[1]));for(let y=top;y<bottom;y++){const xs:number[]=[];for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];if((a[1]<=y&&b[1]>y)||(b[1]<=y&&a[1]>y))xs.push(a[0]+(y-a[1])/(b[1]-a[1])*(b[0]-a[0]))}xs.sort((a,b)=>a-b);for(let j=0;j<xs.length;j+=2)rect(c,Math.ceil(xs[j]),y,Math.floor(xs[j+1])-Math.ceil(xs[j])+1,1,color)}if(border)p.forEach((p1,i)=>line(c,p1,p[(i+1)%p.length],border))}
export function diamond(c:C,x:number,y:number,w:number,h:number,color:string,stroke=false){poly(c,[[x,y],[x+w*20,y+w*10],[x+(w-h)*20,y+(w+h)*10],[x-h*20,y+h*10]],color,stroke?'#94a980':undefined)}
export function box(c:C,x:number,y:number,w:number,h:number,z:number,top:string,left:string,right:string){const a=project(w,0),b=project(w,h),d=project(0,h);poly(c,[[x+d.x,y+d.y],[x+b.x,y+b.y],[x+b.x,y+b.y-z],[x+d.x,y+d.y-z]],left,ink);poly(c,[[x+a.x,y+a.y],[x+b.x,y+b.y],[x+b.x,y+b.y-z],[x+a.x,y+a.y-z]],right,ink);diamond(c,x,y-z,w,h,top);line(c,[x,y-z],[x+a.x,y+a.y-z],ink);line(c,[x,y-z],[x+d.x,y+d.y-z],ink)}
function roof(c:C,x:number,y:number,w:number,h:number,main:string,dark:string,rise=21){
 const e=.18,q=(xx:number,yy:number,z=0):Point=>[x+(xx-yy)*20,y+(xx+yy)*10-z];
 const a=q(-e,-e),b=q(w+e,-e),d=q(-e,h+e),f=q(w+e,h+e),r0=q(-e,h/2,rise),r1=q(w+e,h/2,rise);
 poly(c,[a,b,r1,r0],dark,ink);poly(c,[r0,r1,f,d],main,ink);
 const rows=Math.max(2,Math.ceil(h*2));for(let i=1;i<rows;i++){const t=i/rows;line(c,[r0[0]+(a[0]-r0[0])*t,r0[1]+(a[1]-r0[1])*t],[r1[0]+(b[0]-r1[0])*t,r1[1]+(b[1]-r1[1])*t],main)}for(let i=1;i<rows;i++){const t=i/rows,aa:Point=[r0[0]+(d[0]-r0[0])*t,r0[1]+(d[1]-r0[1])*t],bb:Point=[r1[0]+(f[0]-r1[0])*t,r1[1]+(f[1]-r1[1])*t];line(c,aa,bb,dark);const columns=Math.max(1,Math.floor(w*2));for(let j=1;j<columns;j++){const u=(j-(i%2)*.35)/columns,xx=aa[0]+(bb[0]-aa[0])*u,yy=aa[1]+(bb[1]-aa[1])*u;line(c,[xx,yy],[xx+(d[0]-r0[0])/rows,yy+(d[1]-r0[1])/rows],dark)}}line(c,r0,r1,'#f4e7c7');
}
export function windowPane(c:C,x:number,y:number,side=1,tall=false){const w=11,h=tall?23:15;poly(c,[[x,y],[x+w*side,y+5],[x+w*side,y+h+5],[x,y+h]],'#716b81',ink);poly(c,[[x+side,y+2],[x+(w-1)*side,y+6],[x+(w-1)*side,y+h+3],[x+side,y+h-1]],'#bce0de');line(c,[x+side*5,y+3],[x+side*5,y+h+1],'#fff0cf');line(c,[x,y+8],[x+w*side,y+13],'#fff0cf');line(c,[x-2*side,y+h+1],[x+(w+2)*side,y+h+7],'#a58a77')}
function flower(c:C,x:number,y:number,color:string){rect(c,x,y-4,1,6,'#62856e');rect(c,x-2,y-2,2,1,'#7a9e75');rect(c,x-2,y-7,5,3,color);rect(c,x-1,y-8,3,5,color);rect(c,x,y-6,1,1,'#fff4c2')}
function planter(c:C,x:number,y:number){box(c,x,y,1,.45,4,'#796d68','#b68f78','#967363');for(let i=0;i<5;i++)flower(c,x-6+i*5,y+i*2-1,i%2?'#f0b6bc':'#edcf85')}
function tree(c:C,x:number,y:number,variant:number){const colors=variant%7===0?['#a47c8c','#c895a4','#deb0b8','#edc9ca']:['#597d70','#78a080','#98ba89','#bad19d'];diamond(c,x+2,y+7,1.45,1.1,'#8cab7c');rect(c,x-4,y-18,8,31,'#776b65');rect(c,x-2,y-18,3,28,'#ad8e70');line(c,[x,y-9],[x-11,y-20],'#776b65');line(c,[x+1,y-13],[x+10,y-24],'#776b65');const blob=(xx:number,yy:number,r:number,col:string)=>{poly(c,[[xx-r+8,yy-r],[xx+r-8,yy-r],[xx+r-8,yy-r+4],[xx+r-3,yy-r+4],[xx+r-3,yy-4],[xx+r,yy-4],[xx+r,yy+7],[xx+r-5,yy+7],[xx+r-5,yy+r-3],[xx+7,yy+r-3],[xx+7,yy+r],[xx-8,yy+r],[xx-8,yy+r-3],[xx-r+2,yy+r-3],[xx-r+2,yy+6],[xx-r,yy+6],[xx-r,yy-7],[xx-r+4,yy-7],[xx-r+4,yy-r+4],[xx-r+8,yy-r+4]],col)};blob(x,y-31,23,colors[0]);blob(x-7,y-39,19,colors[1]);blob(x+8,y-43,18,colors[2]);blob(x-2,y-52,14,colors[3]);for(let i=0;i<30;i++){const xx=x-20+(i*13+variant)%40,yy=y-56+(i*17)%39;if(((xx-x)/22)**2+((yy-y+38)/25)**2<.9)rect(c,xx,yy,2+i%3,2,colors[(i+variant)%4])}rect(c,x-11,y-56,5,2,'#d5dfaf')}
export const treeVariant=(o:Pick<CampusObject,'id'>)=>o.id==='preview'?3:[...o.id].reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,0)%13;
export function drawObject(c:C,o:CampusObject,highlight=false){const p=project(o.x,o.y),x=p.x,y=p.y;
 if(highlight)diamond(c,x,y+2,o.w,o.h,'#f4df9a',true);
 if(o.kind==='collectible'){drawRewardObject(c,o);return}
 if(o.kind==='tree'){tree(c,x,y,treeVariant(o));return}
 if(o.kind==='path'){diamond(c,x,y,1,1,'#dfd1b3',true);line(c,[x-10,y+5],[x+10,y+15],'#bdad99');return}
 if(o.kind==='grass'){for(let i=0;i<7;i++){const xx=x-7+i*3,yy=y+6+(i%3)*3;line(c,[xx,yy],[xx-2,yy-4],'#77986d');line(c,[xx,yy],[xx+2,yy-3],'#93ac76')}flower(c,x+2,y+7,'#f0d59f');return}
 if(o.kind==='flowers'){box(c,x,y,2,1,5,'#6e8b69','#bd997a','#9d7b6b');for(let i=0;i<13;i++){const q=project(.2+(i%5)*.34,.2+Math.floor(i/5)*.25);flower(c,x+q.x,y+q.y-2,['#edb6bd','#f1d791','#c5b7d9'][i%3])}return}
 if(o.kind==='bench'){box(c,x,y,1.8,.65,9,'#d4b28a','#9f7e69','#bd997c');for(let i=0;i<3;i++)line(c,[x-12,y-17+i*3],[x+24,y+1+i*3],i===1?'#ead2a1':'#a18068');rect(c,x-9,y-11,3,22,ink);rect(c,x+25,y+5,3,23,ink);line(c,[x-10,y+1],[x+25,y+18],'#f2d4a2');return}
 if(o.kind==='lamp'){diamond(c,x,y+9,.45,.45,'#89918a');rect(c,x-1,y-38,3,49,'#6d6b76');rect(c,x,y-35,1,43,'#acafa0');rect(c,x-7,y-48,15,3,ink);rect(c,x-5,y-45,11,14,ink);rect(c,x-3,y-43,7,10,'#f5dba1');rect(c,x,y-44,1,12,'#b99572');poly(c,[[x-8,y-48],[x,y-55],[x+8,y-48]],'#9ba394',ink);rect(c,x-3,y-30,7,3,ink);return}
 if(o.kind==='fountain'){box(c,x,y,2,2,7,'#d2d6c0','#a3b4ab','#809a98');diamond(c,x,y-8,1.8,1.8,'#91ced0');diamond(c,x,y-8,1.3,1.3,'#b9e5dd');rect(c,x-3,y-14,7,29,'#e5e4c8');box(c,x,y-5,.8,.8,4,'#dce5d0','#b3c8be','#9ab6b2');rect(c,x-2,y-22,4,14,'#c3f1e8');line(c,[x-2,y-17],[x-10,y-8],'#d8f6e8');line(c,[x+2,y-17],[x+10,y-7],'#b7e7e3');for(let i=0;i<5;i++)rect(c,x-25+i*13,y+15+(i%2)*8,7,1,'#e5f4dc');return}
 if(o.kind==='garden'){box(c,x,y,o.w,o.h,3,'#a3bf8d','#95a67e','#a5b78c');for(let i=0;i<3;i++)drawObject(c,{...o,kind:'flowers',x:o.x+.5,y:o.y+i*.8,w:2,h:1});const left=project(0,2.2),right=project(2.4,2.2);for(const q of [left,right]){rect(c,x+q.x,y+q.y-47,4,48,'#9a826b');rect(c,x+q.x+1,y+q.y-46,1,45,'#e4cc9e')}for(let i=0;i<4;i++)line(c,[x+left.x-5,y+left.y-49+i*3],[x+right.x+7,y+right.y-49+i*3],'#bba480');for(let i=0;i<12;i++){const q=project(i*.22,2.2);rect(c,x+q.x-5,y+q.y-53,7,5,i%2?'#84a47b':'#a8c091');if(i%3===0)flower(c,x+q.x,y+q.y-49,'#d7b7d3')}return}
 const furniture=o.kind==='reading-table'||o.kind==='stool'||o.kind==='bookcase'||o.kind==='easel-prop'||o.kind==='indoor-plant';
 if(furniture){
  if(o.kind==='reading-table'){for(const [xx,yy]of [[.2,.2],[o.w-.35,.2],[.2,o.h-.35],[o.w-.35,o.h-.35]]){const q=project(xx,yy);box(c,x+q.x,y+q.y,.15,.15,19,'#d5b58d','#987f6d','#b09576')}box(c,x,y-17,o.w,o.h,5,'#e3c69c','#ac8c70','#c19e7a');const q=project(.7,.55);box(c,x+q.x,y+q.y-23,.7,.4,2,'#e7e4c6','#b7b99c','#c9c9ac');return}
  if(o.kind==='stool'){box(c,x+2,y+3,.65,.65,12,'#a08777','#a08777','#8c786e');box(c,x,y-9,.9,.8,4,'#c8b8d7','#a898b7','#b8a5c6');return}
  if(o.kind==='bookcase'){box(c,x,y,o.w,o.h,39,'#d1b18c','#b29177','#9c806e');const left=x-o.h*20;for(let row=0;row<2;row++){for(let i=0;i<6;i++){const xx=left+5+i*5,yy=y+o.h*10+(xx-left)*.5-33+row*17;poly(c,[[xx,yy],[xx+3,yy+1.5],[xx+3,yy+12],[xx,yy+10.5]],['#c6b3d3','#a5bea1','#e2c895','#cfaba8'][i%4]);line(c,[xx+1,yy+3],[xx+1,yy+9],'#eee1bd')}line(c,[left,y+o.h*10-18+row*17],[left+o.w*20,y+(o.h+o.w)*10-18+row*17],'#e0c6a2')}return}
  if(o.kind==='easel-prop'){line(c,[x-11,y+12],[x,y-45],'#8c7664');line(c,[x+13,y+17],[x+1,y-45],'#8c7664');poly(c,[[x-13,y-36],[x+12,y-23],[x+12,y],[x-13,y-13]],'#fff0d2',ink);line(c,[x-9,y-21],[x+7,y-13],'#b7c5a5');line(c,[x-9,y-17],[x+7,y-9],'#cbbbd1');return}
  box(c,x,y,.7,.7,10,'#d4c3d9','#aa96b8','#bfafc5');for(let i=0;i<5;i++){const yy=y-14-i*5,xx=x+(i%2?7:-6);line(c,[x,y-6],[xx,yy],'#759278');poly(c,[[xx,yy+3],[xx-5,yy-2],[xx+1,yy-7],[xx+6,yy-3]],i%2?'#a5bd90':'#7e9d7d')}return;
 }
 const palettes:Record<string,string[]>={office:['#a7b4d2','#7c88ab','#efe6d4','#d1c7bc'],classroom:['#d99e95','#ae797d','#f5ddc3','#d9c0ae'],schedule:['#d4bd81','#a38d64','#eee2bd','#ccbe9c'],library:['#8fb59f','#618d82','#e5e7cc','#bccbb7'],workshop:['#b6a0c1','#87789f','#e9d6df','#c8b8ce'],museum:['#97b9cc','#6e94ab','#f3e7cf','#cbd1c4']};
 const palette=palettes[o.kind];if(!palette)return;const [main,dark,wall,side]=palette,height=o.kind==='classroom'?60:o.kind==='museum'?44:38,rise=o.kind==='schedule'?16:22,base=y-5,top=base-height;
 // Foundation and walls share one footprint; gables close both ends before
 // the two roof slopes are painted. Every opening stays inside its wall face.
 box(c,x,y,o.w,o.h,5,'#d9c7a9','#b3a18c','#b5a38c');box(c,x,base,o.w,o.h,height,'#fff0d7',wall,side);
 const a=project(o.w,0),b=project(o.w,o.h),d=project(0,o.h),r=project(o.w,o.h/2),r0=project(0,o.h/2);
 poly(c,[[x,top],[x+d.x,top+d.y],[x+r0.x,top+r0.y-rise]],wall,ink);
 poly(c,[[x+a.x,top+a.y],[x+b.x,top+b.y],[x+r.x,top+r.y-rise]],side,ink);
 const frontX=x+d.x,frontY=base+d.y,levels=height>50?2:1;
 c.save();c.beginPath();c.moveTo(frontX,frontY);c.lineTo(x+b.x,base+b.y);c.lineTo(x+b.x,top+b.y);c.lineTo(frontX,top+d.y);c.closePath();c.clip();
 for(let i=0;i<o.w;i++)for(let row=0;row<levels;row++){if(row===levels-1&&Math.abs(i-o.w/2)<.7)continue;windowPane(c,frontX+i*20+4,frontY+i*10-height+10+row*26,1,false)}c.restore();
 c.save();c.beginPath();c.moveTo(x+a.x,base+a.y);c.lineTo(x+b.x,base+b.y);c.lineTo(x+b.x,top+b.y);c.lineTo(x+a.x,top+a.y);c.closePath();c.clip();
 for(let i=0;i<o.h;i++)for(let row=0;row<levels;row++)windowPane(c,x+a.x-i*20-4,base+a.y+i*10-height+9+row*26,-1,false);c.restore();
 line(c,[frontX,frontY-5],[x+b.x,base+b.y-5],'#b8aa98');line(c,[x+a.x,base+a.y-5],[x+b.x,base+b.y-5],'#a99c90');
 const dx=frontX+o.w*10,dy=frontY+o.w*5;poly(c,[[dx-7,dy-22],[dx+8,dy-15],[dx+8,dy],[dx-7,dy-7]],'#776778',ink);line(c,[dx,dy-17],[dx,dy-4],'#bd9b86');rect(c,dx+4,dy-8,2,2,'#f2d18f');box(c,dx-7,dy+3,.8,.45,3,'#e2d7b6','#b3a38f','#c6b59a');
 roof(c,x,top,o.w,o.h,main,dark,rise);
 if(o.kind==='office'){const q=project(o.w*.55,o.h/2),tx=x+q.x,ty=top+q.y-rise+5;box(c,tx,ty,.75,.7,31,'#e1d6bf','#ede3cd','#c4baca');roof(c,tx,ty-31,.75,.7,main,dark,11);const px=tx-9,py=ty-26;rect(c,px,py,13,14,ink);rect(c,px+2,py+2,9,10,'#fff2cc');line(c,[px+6,py+4],[px+6,py+8],ink);line(c,[px+6,py+8],[px+9,py+9],ink)}
 if(o.kind==='library'){const by=frontY-height+o.w*5+7;poly(c,[[dx-16,by-8],[dx+15,by+7],[dx+15,by+17],[dx-16,by+2]],'#d9c69d',ink);line(c,[dx-7,by-1],[dx,by+2],'#fff0c5');line(c,[dx+2,by+3],[dx+9,by+6],'#fff0c5')}
 if(o.kind==='classroom'||o.kind==='library'){for(let i=0;i<o.w;i+=Math.max(2,o.w-2))planter(c,frontX+i*20+8,frontY+i*10+3)}
 if(o.kind==='museum')for(let i=0;i<4;i++){const xx=frontX+8+i*(o.w*20-16)/3,yy=frontY+(xx-frontX)/2;rect(c,xx-2,yy-height+5,5,height-8,'#f1e7cf');rect(c,xx-3,yy-height+4,7,3,'#fff4db');rect(c,xx-3,yy-6,7,3,'#b9aa91')}
}

export function drawAvatar(c:C,x:number,y:number,frame=0){const p=project(x+.5,y+.5),xx=Math.round(p.x),yy=Math.round(p.y),step=frame%2;rect(c,xx-7,yy,15,3,'#829575');rect(c,xx-5,yy-7,4,8-step,ink);rect(c,xx+2,yy-7,4,7+step,ink);rect(c,xx-6,yy-20,13,13,ink);rect(c,xx-5,yy-19,11,11,'#c69cb7');rect(c,xx-4,yy-18,3,8,'#ebbed0');rect(c,xx-7,yy-16,2,8,'#e7bf9b');rect(c,xx+6,yy-17,3,8,'#e7bf9b');rect(c,xx+3,yy-18,5,9,'#9b9a78');rect(c,xx-5,yy-29,11,11,'#f0c9a6');rect(c,xx-6,yy-32,13,6,ink);rect(c,xx-6,yy-28,3,10,ink);rect(c,xx-1,yy-25,2,2,ink);rect(c,xx+4,yy-25,2,2,ink);rect(c,xx+1,yy-21,2,1,'#bd8c86');rect(c,xx-9,yy-34,19,4,ink);rect(c,xx-8,yy-34,17,3,'#e9d2a5');rect(c,xx-6,yy-39,12,5,'#efe1b8');rect(c,xx-6,yy-35,12,2,'#97ac8b');rect(c,xx+5,yy-37,3,3,'#e6b9bc')}
export function drawTerrain(c:C,objects:CampusObject[],grid=false){diamond(c,0,18,32,24,'#7f9c7d');diamond(c,0,9,32,24,'#a3b58d');for(let x=0;x<32;x++)for(let y=0;y<24;y++){const p=project(x,y),road=(x>=14&&x<=17)||(y>=8&&y<=9&&x>4&&x<29)||(y>=16&&y<=17&&x>5&&x<28)||(x>=8&&x<=9&&y>7)||(x>=22&&x<=23&&y>7&&y<18);diamond(c,p.x,p.y,1,1,road?((x+y)%3?'#e6d8ba':'#dcccc0'):['#b2c899','#b6cc9c','#afc797','#b4cb98'][(x*7+y*13)%4],grid);if(road){line(c,[p.x-18,p.y+10],[p.x,p.y+19],'#c6bba1');if((x+y)%3===0)line(c,[p.x,p.y+1],[p.x,p.y+19],'#d0c2a8');rect(c,p.x-8,p.y+8,5,1,'#f1e6cb')}else{for(let i=0;i<3;i++){const xx=p.x-10+(x*17+y*11+i*9)%21,yy=p.y+7+(x+y+i*3)%7;rect(c,xx,yy,2,1,i%2?'#9cb885':'#c7d5a8')}if((x*19+y*7)%11===0&&!objects.some(o=>x>=o.x&&x<o.x+o.w&&y>=o.y&&y<o.y+o.h))flower(c,p.x,p.y+11,(x+y)%2?'#f4e4b4':'#e5bfd0')}}
 for(let i=1;i<31;i+=2){const p=project(i,.15),q=project(i+1.9,.15);rect(c,p.x,p.y-14,3,15,'#a8a486');rect(c,p.x,p.y-14,3,2,'#ede3c0');line(c,[p.x,p.y-8],[q.x,q.y-8],'#d5c9a4')}
 for(let i=1;i<23;i+=2){const p=project(.15,i),q=project(.15,i+1.9);rect(c,p.x,p.y-14,3,15,'#a8a486');rect(c,p.x,p.y-14,3,2,'#ede3c0');line(c,[p.x,p.y-8],[q.x,q.y-8],'#d5c9a4')}
 const p=project(15,23);for(const dx of [-24,24]){rect(c,p.x+dx,p.y+dx/2-40,5,43,'#8e8071');rect(c,p.x+dx+1,p.y+dx/2-39,2,39,'#d9c59c')}poly(c,[[p.x-29,p.y-57],[p.x+32,p.y-27],[p.x+32,p.y-15],[p.x-29,p.y-45]],'#e5d3ac',ink);line(c,[p.x-25,p.y-52],[p.x+25,p.y-27],'#a6977b');
}
