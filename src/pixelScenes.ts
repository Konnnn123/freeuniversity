type C=CanvasRenderingContext2D;
const ink='#655a73',paper='#fff1d2',light='#fff9e8',wood='#ad8b74';
export function drawCourseScene(c:C,theme:string){
 const r=(x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(x,y,w,h)};
 const outline=(x:number,y:number,w:number,h:number,color:string)=>{r(x-1,y-1,w+2,h+2,ink);r(x,y,w,h,color)};
 const book=(x:number,y:number,color:string,w=30)=>{outline(x,y,w,7,color);r(x+3,y+2,w-6,3,paper);r(x+3,y+4,w-6,1,'#d5c3a8');r(x,y,w,2,color);r(x+3,y+1,2,5,ink)};
 const plant=(x:number,y:number,pink=false)=>{r(x-2,y-21,3,19,'#71836b');r(x-10,y-17,8,4,pink?'#d5a1b1':'#90b189');r(x-13,y-20,7,4,pink?'#e6bdc4':'#b5cd9c');r(x+1,y-25,8,5,pink?'#dfb0bd':'#a2c393');r(x+6,y-28,6,5,pink?'#eed0d0':'#c1d4a6');outline(x-8,y-1,16,4,'#b58c79');outline(x-6,y+4,12,11,'#d0a386');r(x-4,y+5,3,7,'#e8be9a')};
 const note=(x:number,y:number,w=24,h=29)=>{outline(x,y,w,h,paper);r(x+3,y+4,w-6,2,'#c3ad9e');for(let i=10;i<h-3;i+=5)r(x+4,y+i,w-9,1,'#d1c0a9');r(x+3,y+2,2,h-4,'#e1b4b0')};
 const sparkle=(x:number,y:number)=>{r(x,y-3,1,7,'#fff8dc');r(x-3,y,7,1,'#fff8dc')};
 c.clearRect(0,0,160,96);
 r(20,76,120,7,'#655a7320');r(28,83,105,3,'#655a7312');
 if(theme==='CRYSTAL'){
  r(51,77,58,4,'#9d8ba9');r(57,72,46,5,'#cbb7d3');r(62,46,36,24,ink);r(68,32,24,16,ink);r(74,21,12,12,ink);r(76,25,8,12,'#f5e6ff');r(70,35,13,29,'#d7bce7');r(83,35,7,29,'#aa8fc5');r(64,48,6,17,'#e9d2f0');r(90,48,6,17,'#927cad');r(70,64,20,6,'#bea4d6');sparkle(48,35);sparkle(105,47);return;
 }
 outline(26,69,110,6,'#c5a385');r(28,75,3,5,wood);r(130,75,3,5,wood);r(28,70,106,1,'#e6cba5');
 if(theme==='JPN'){
  plant(125,50,true);book(43,60,'#ac91b9',40);book(47,52,'#d3a4ad',37);note(52,24,30,27);r(56,28,21,2,ink);r(60,34,12,2,'#af8ba4');r(66,31,2,14,'#af8ba4');r(59,42,15,2,'#af8ba4');outline(91,53,14,11,'#b6c5a3');r(94,51,8,3,'#e4e7cf');r(104,55,5,6,ink);r(105,56,3,4,'#d6d5b9');r(96,40,1,7,'#f6e9cc');r(99,37,1,5,'#f6e9cc');
 }else if(theme==='ENG'){
  book(34,60,'#8baeb5',42);outline(40,27,37,28,paper);r(44,31,29,2,'#b7c7b8');r(47,36,24,1,'#c5bca9');r(47,42,19,1,'#c5bca9');r(44,46,4,4,'#c3a2b4');r(57,52,5,8,'#c5a388');outline(100,29,20,19,'#8dbdc4');r(98,34,24,10,'#8dbdc4');r(103,30,8,5,'#bbd29f');r(111,38,7,6,'#a7c59e');r(103,48,2,12,ink);r(98,60,15,3,wood);r(123,48,2,18,'#8c849c');r(123,47,2,3,'#edcca0');
 }else if(theme==='ECO'){
  outline(42,24,60,8,'#d4ac87');for(let i=0;i<6;i++)r(43+i*10,25,5,11,i%2?'#c5ad77':'#f0dfac');r(43,36,3,27,wood);r(97,36,3,27,wood);outline(39,60,67,8,'#c4ab87');r(42,62,60,2,'#ead3a7');for(let i=0;i<5;i++){r(51+i*9,49,7,9,['#b7c58d','#dda3a0','#c9add4'][i%3]);r(53+i*9,47,3,2,'#7b946c')}note(112,43,18,23);r(115,58,3,4,'#b59b7e');r(120,53,3,9,'#9eaf88');
 }else if(theme==='KOR'){
  book(35,60,'#c198b6',40);for(let i=0;i<3;i++){outline(42+i*25,36-(i%2)*10,20,22,['#e1b2b8','#bdcda9','#c3c1dc'][i]);r(48+i*25,41-(i%2)*10,7,2,ink);r(48+i*25,41-(i%2)*10,2,8,ink);r(48+i*25,48-(i%2)*10,7,2,ink);r(56+i*25,40-(i%2)*10,2,12,ink)}plant(127,51);
 }else if(theme==='DAT'){
  outline(47,22,53,35,'#a2b4a4');outline(51,26,45,26,'#e8e8cb');r(57,42,6,7,'#9ab88e');r(67,35,6,14,'#bea1bd');r(77,31,6,18,'#88b4bd');r(56,49,33,1,ink);r(69,58,9,7,'#8b9d90');r(60,65,28,3,'#b3c3a8');outline(103,49,24,18,paper);r(107,52,2,11,'#a5b992');r(107,56,16,2,'#a5b992');r(116,51,2,13,'#b4ced0');book(31,61,'#c4a3b4',20);
 }else if(theme==='SND'){
  outline(46,41,62,25,'#aabec0');r(50,46,11,14,ink);r(52,48,7,10,'#e4d7b6');outline(66,46,33,14,'#d5c4ab');r(71,50,6,6,ink);r(87,50,6,6,ink);r(73,52,2,2,paper);r(89,52,2,2,paper);r(77,52,10,2,wood);r(56,28,3,13,ink);r(97,28,3,13,ink);r(59,23,38,4,ink);r(59,27,3,4,'#b8a0bc');r(94,27,3,4,'#b8a0bc');r(116,34,2,20,ink);r(116,34,11,3,ink);r(125,35,2,15,ink);r(112,53,6,3,ink);r(121,49,6,3,ink);
 }else{
  plant(124,50);note(47,29,29,36);book(43,64,'#b6957d',37);outline(85,43,27,19,'#a398ad');r(90,39,10,4,ink);r(92,47,12,12,ink);r(94,49,8,8,'#bcd9d6');r(96,50,3,3,light);r(87,46,3,3,'#ead5ad');r(80,35,2,30,'#9e7c7d');r(80,33,2,3,'#edc99e');
 }
 sparkle(31,28);sparkle(138,39);
}
