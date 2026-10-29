import type {Language,Medium,MediaResource} from './studioTypes';
const source=(id:string,language:Language,medium:Medium,title:string,creator:string,source:string,url:string,description:string,tags:string[],origin:MediaResource['origin']='具体作品',difficulty='自由探索'):MediaResource=>({id:`studio-${id}`,language,medium,title,creator,source,url,description,tags,origin,difficulty,format:medium,minutes:0,verifiedAt:'2026-10-24',favorite:false,state:'想看看',text:'',image:'',translation:'',courseIds:[],archived:false,createdAt:'2026-10-24'});
export const studioSources:MediaResource[]=[
source('yamanashi','ja','文学','やまなし','宮沢賢治','青空文庫','https://www.aozora.gr.jp/cards/000081/files/472_42317.html','水中的光、声音和两只小蟹。文学可以从一个意象开始，也可以只是静静读完。',['小说','自然','声音'],'具体作品','中高级'),
source('restaurant','ja','文学','注文の多い料理店','宮沢賢治','青空文庫','https://www.aozora.gr.jp/cards/000081/files/43754_17659.html','一道道门改变了故事的方向。合法公开的日语文学作品，在青空文库原站阅读。',['小说','幻想','文化'],'具体作品','中高级'),
source('yorushika','ja','音乐','ヨルシカ · 音乐与影像','ヨルシカ','Universal Music Japan','https://www.universal-music.co.jp/yorushika/','官方艺人页中的音乐与 MOVIE 区。这是浏览入口，不是某一首预选歌曲。',['音乐','文学','影像'],'栏目入口'),
source('erin','ja','视频','第17課 · 応用スキット','国際交流基金','エリンが挑戦！','https://www.erin.jpf.go.jp/jp/lesson/17/advanced/','美术课堂中的交流片段。可观察说话方式，也可沿着绘画、学校生活与文化继续探索。',['生活','艺术','交流']),
source('irodori','ja','音频','いろどり · 初中級 第1課 音轨集','国際交流基金','いろどり','https://www.irodori.jpf.go.jp/pre-intermediate/audio/lesson01.html','具体第1课的多个音轨，不是播客单集。原素材为初中级，可自由用作语境和表达观察。',['交流','日常'],'具体作品','A2/B1 素材'),
source('onomatopoeia','ja','文化','マンガで覚えるオノマトペ','国際交流基金','エリンが挑戦！','https://www.erin.jpf.go.jp/jp/section/onomatopoeia/','拟声拟态词漫画栏目入口。声音如何变成字形、节奏或画面，可以按好奇心挑选。',['漫画','声音','网络文化'],'栏目入口'),
source('introverts','en','视频','The power of introverts','Susan Cain','TED2012','https://www.ted.com/talks/susan_cain_the_power_of_introverts','关于性格、空间与倾听的官方演讲。字幕与文字稿在原站，不要求做理解题。',['社会','空间','交流'],'具体作品','B2+'),
source('alice','en','文学','Alice’s Adventures in Wonderland','Lewis Carroll','Project Gutenberg','https://www.gutenberg.org/cache/epub/11/pg11-images.html','公开文学原站全文。美国公有领域作品；本应用只保存链接，不复制全文。',['小说','幻想'],'具体作品','B2+'),
source('99pi','en','音频','Tootle of a Devilish Song','99% Invisible','99% Invisible','https://99percentinvisible.org/episode/685-tootle-of-a-devilish-song/','一集关于声音的节目；播放与文字稿位于官方页面。时间点、联想或疑问都可以自己决定是否留下。',['声音','设计','文化'],'具体作品','B2+'),
source('penguin','en','文章','Penguin Books','Design Museum','Design Museum','https://designmuseum.org/penguin-books','平装书和书籍设计的故事。文字与视觉细节都可以成为探索的起点。',['设计','建筑','出版'],'具体作品','B1/B2'),
source('yellow','en','音乐','Yellow · Official Video','Coldplay','Coldplay 官方艺人频道','https://www.youtube.com/watch?v=yKNxeF4KMsY','官方音乐录像。可以关注音乐、色彩、画面或个人感受；不提供歌词全文。',['音乐','电影','影像']),
source('coldplay','en','音乐','Coldplay · Music','Coldplay','Coldplay 官方网站','https://www.coldplay.com/music/','专辑、单曲与歌曲目录入口，适合自己挑选想听的作品。',['音乐','流行文化'],'栏目入口')
];
