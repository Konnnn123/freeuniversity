export const rewardGroups=['学习家具','植物','校园设施','兴趣创作','知识收藏','生活装饰'] as const;
export interface RewardItem {id:string;name:string;group:typeof rewardGroups[number];description:string;w:number;h:number;size:number}
const groups: [typeof rewardGroups[number],Array<[string,string,string,number?,number?,number?]>][]=[
 ['学习家具',[
  ['study-desk','小书桌','给下一次好奇，留一张安静的桌子。',2,1,90],['wooden-chair','木椅','坐下来，慢慢想清楚。'],['bookshelf','书架','让学过的故事有个住处。',2,1,88],['blackboard','小黑板','还没想明白的问题，也值得写下来。',2,1,90],['desk-lamp','台灯','为一小段阅读亮起灯。'],['globe','地球仪','从这里，望向更大的世界。']]],
 ['植物',[
  ['potted-plant','小盆栽','和你的好奇心一起，慢慢长大。'],['cactus','仙人掌','按自己的节奏生长。'],['sunflower','向日葵','给校园添一点暖黄色。'],['cherry-tree','樱花树','把一个学完的章节，留成一树花。',2,2,112],['pine-tree','松树','四季都在这里等你。',2,2,110],['flower-bed','花坛','把小小发现种在一起。',2,1,88]]],
 ['校园设施',[
  ['garden-bench','长椅','学了一会儿，也可以歇一会儿。',2,1,86],['street-lamp','路灯','为晚归的好奇心照亮一小段路。',1,1,88],['signpost','路牌','下一步，走向让你好奇的地方。'],['mailbox','信箱','留一封信，写给未来的自己。',1,1,82],['drinking-fountain','饮水台','喝口水，再慢慢探索。'],['fountain','小喷泉','让校园多一点轻轻的水声。',2,2,104]]],
 ['兴趣创作',[
  ['easel','画架','把新的理解，画成自己的样子。',1,1,86],['paint-palette','调色盘','为今天的发现挑一种颜色。'],['camera','相机','收藏一个值得留意的瞬间。'],['guitar','吉他','让学习之外，也有一点旋律。',1,1,90],['record-player','唱片机','为自己的校园放一张喜欢的唱片。'],['telescope','望远镜','远一点的问题，也可以慢慢靠近。',1,1,90]]],
 ['知识收藏',[
  ['balance-scale','小天平','多看一面，再作判断。'],['abacus','算盘','让抽象的数量，有一点触手可及的样子。'],['scroll','卷轴','把这段探索轻轻卷起，好好收藏。'],['hourglass','沙漏','花在理解上的时间，自有它的意义。'],['microscope','显微镜','靠近一点，看看细节里的世界。'],['fossil','化石','很久以前的故事，也能带来新问题。']]],
 ['生活装饰',[
  ['rug','小地毯','给校园添一块柔软的角落。',2,1,84],['wall-clock','挂钟','今天按自己的时间走。'],['teacup','茶杯','一杯茶，一小段自己的时间。'],['curtains','窗帘','把光线留得柔和一点。',2,1,90],['cat-figurine','猫咪摆件','一位安静陪你读书的小伙伴。'],['pennant','小旗帜','给走过的一小段路，插一面旗。',1,1,86]]]
];
export const rewardCatalog:RewardItem[]=groups.flatMap(([group,items])=>items.map(([id,name,description,w=1,h=1,size=72])=>({id,name,description,group,w,h,size})));
export const rewardById=(id:string)=>rewardCatalog.find(r=>r.id===id);
export const rewardImage=(id:string)=>'/rewards/'+id+'.png';
