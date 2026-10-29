export interface HandbookChapter {
 id:string;title:string;tab:string;icon:string;kicker:string;intro:string;
 steps:{title:string;text:string}[];note:{title:string;text:string};links:{to:string;label:string}[];
}

export const handbookChapters:HandbookChapter[]=[
 {id:'welcome',title:'先找到自己的起点',tab:'从这里开始',icon:'home',kicker:'WELCOME TO YOUR UNIVERSITY',
 intro:'带着一点好奇就可以入学。这里没有必修课，也不用一次安排好所有事情。',
 steps:[
  {title:'我已经有一本 PDF',text:'去图书馆导入原书，读出目录，再把整本书整理成课程。'},
  {title:'我只有一个想学的念头',text:'去课程里找备课伙伴，聊清方向、基础和喜欢的讲解方式，再准备第一个单元。'},
  {title:'日常只需要四个入口',text:'课表安排时间，课程负责上课，图书馆放原资料，成果馆收好学习记录。地图上的四处标注也通往这里。'}],
 note:{title:'三个地方，各有分工',text:'图书馆放资料，备课把资料整理成可学的内容，课程是日常上课和记录进度的地方。'},
 links:[{to:'/library',label:'带一本书来'},{to:'/course-planner',label:'和 AI 一起开课'}]},
 {id:'planning',title:'把好奇变成一门课',tab:'和 AI 开课',icon:'book',kicker:'A COURSE BEGINS WITH CURIOSITY',
 intro:'可以只说一个大概：“我想了解经济思想史，但还没有基础，希望多用生活里的例子。”',
 steps:[
  {title:'先聊清几个基础点',text:'确定学习主题、最关心的问题、已有基础、讲解偏好和每节时长。右侧学习需求也可以自己改。'},
  {title:'确认需求，再看大纲',text:'核对后点「确认以上需求，可以生成大纲」。先预览三节课的路线，合适了再准备这个单元。'},
  {title:'准备好后，正式开课',text:'预览讲解、情境和题目，选好分类，再点「确认并开始第一课」。草案确认后才加入课程。'}],
 note:{title:'不用没完没了地聊',text:'基础需求足够就可以生成。顶部「开启新的对话草案」开始新想法；「重新生成」可以重做大纲或课时，旧草案会留在备课版本里。'},
 links:[{to:'/course-planner',label:'打开备课伙伴'}]},
 {id:'pdf',title:'让整本书成为课程',tab:'PDF 变课程',icon:'book',kicker:'FROM YOUR BOOK TO YOUR CLASSROOM',
 intro:'图书馆里的原书和课程可以关联。上课时看简洁讲解，想深入时随时回到原书。',
 steps:[
  {title:'导入原书，确认目录',text:'图书馆 →「我的 PDF」→「+ 导入 PDF」。打开原书后读取目录；没有电子书签时，手动确认章名与 PDF 起止页。'},
  {title:'先整理整本的大纲',text:'展开「完整课程大纲与备课」，填写基础、时长和讲解偏好，点「生成完整课程大纲」。系统按真实章节逐批处理。'},
  {title:'采用大纲，准备课时',text:'大纲齐全后准备完整课程，使用「查看 / 采用课程大纲」进入课程。没备好的课时会标为待准备，完成后再进入课堂。'}],
 note:{title:'大纲和内容，是两个进度',text:'有了课时标题，不代表讲解已经全部备好。继续时点「继续准备未完成课时」，成功的课时会沿用。原书分析、概念卡仍在「原书与参考资料」。'},
 links:[{to:'/library?tab=pdf',label:'打开我的 PDF'},{to:'/courses',label:'去课程上课'}]},
 {id:'reading',title:'读一课，留住一点想法',tab:'阅读与标注',icon:'leaf',kicker:'READ AT YOUR OWN PACE',
 intro:'AI 课堂通常有三个环节：看一个问题、听懂解释、试一个情境。选中句子就能留下自己的思考。',
 steps:[
  {title:'读完一段，记录一个环节',text:'使用各环节底部的继续或完成按钮。只切换顶部页签不会算完成；允许跳过的环节可以主动跳过，状态会保留。'},
  {title:'划线、高亮，或者写一句评论',text:'选中正文，在浮动工具条选择黄色高亮、绿色高亮、划线或评论。右侧标注列表可以查看、编辑和删除，误删可撤销。'},
  {title:'三个环节都处理后，这课就完成了',text:'进度和学习足迹会保存。选错的答案显示红色，选对显示绿色，不要求满分；知识是否掌握，由你另外标记。'}],
 note:{title:'在 PDF 上做标注',text:'原书切换到「文字阅读与划线标注」后再选字。扫描页需要先识别出文字。已有笔记保留在历史折叠区。'},
 links:[{to:'/courses',label:'选一课开始读'}]},
 {id:'continue',title:'还想继续，下一步在哪',tab:'继续与调整',icon:'arrow',kicker:'THERE IS ALWAYS ANOTHER CHAPTER',
 intro:'想学更多时，可以接着走，也可以调整一小段。不需要把已经学过的内容全部重来。',
 steps:[
  {title:'对话开课：生成下一单元',text:'在课程大纲或最后一课的完成区找「生成下一单元」。预览并确认后，追加到同一门课程。'},
  {title:'PDF 课程：补齐，或只改这一章',text:'回原书的完整课程备课区，继续准备未完成课时。课题或拆课方式想调整时，用「调整这一章」填写要求。'},
  {title:'从课程卡片管理课程',text:'右键卡片或点击右上角「⋯」，编辑档案、分类或删除。大纲章节可以折叠，找课时更轻松。'}],
 note:{title:'改之前，分清改的是什么',text:'重做原书分析不会自动重做课堂。采用某章新大纲后，旧课堂和它的标注、记录留在参考区。删除课程前，可以选择是否保留学习记录与成果。'},
 links:[{to:'/courses',label:'查看我的课程'},{to:'/library?tab=pdf',label:'回到原书备课'}]},
 {id:'library',title:'给资料留一个位置',tab:'图书馆找路',icon:'search',kicker:'EVERY SOURCE HAS ITS PLACE',
 intro:'原书、网址和一篇短文章都能放进图书馆。想查资料时来这里，想按课学习时去课程。',
 steps:[
  {title:'我的 PDF · 原书与备课',text:'整本资料在这里。可以阅读原文、确认目录、准备课堂，也可以查看章节分析、概念卡和现实资料。'},
  {title:'收藏资源 · 网页与教材',text:'保存网址、教材信息与指南，添加标签和课程关联。卡片默认简短显示，完整说明与关联课时可以展开。'},
  {title:'文字材料与备课室',text:'适合粘贴一篇文章或导入文字材料，再整理成独立短课。语言探索从对应语言课程或工作室进入。'}],
 note:{title:'找到链接，不等于读到了正文',text:'登录、付费或不可读资料会作为延伸推荐，可自行购买、借阅或导入。课程优先使用公开正文；来源不足时的 AI 基础导学会注明依据。'},
 links:[{to:'/library',label:'打开图书馆'},{to:'/library?tab=resources',label:'看收藏资源'}]},
 {id:'timetable',title:'为好奇心留一点时间',tab:'安排一周',icon:'calendar',kicker:'AN INVITATION, NOT A DEADLINE',
 intro:'课表只是帮你记住想做的事。不排课也可以直接学习，没按计划走也可以随时改。',
 steps:[
  {title:'把一节课放到某一天',text:'从任务池找到已备好的课时，点「安排」选择日期，或拖到对应那一天。'},
  {title:'想换时间，就挪一下',text:'点「移动」或拖到另一天，也可以退回任务池。移除排课不会删除课程或已经留下的学习记录。'},
  {title:'也可以让系统给一份建议',text:'点击「帮我安排一周」，选择天数、数量、时长和优先课程。建议会追加到已有课表，仍可自行调整。'}],
 note:{title:'排课和完成分别记录',text:'任务放进课表不会自动完成。课表按实际日期保存，切换周次能看到不同周的安排。'},
 links:[{to:'/timetable',label:'看看这一周'}]},
 {id:'rewards',title:'把学过的一章收藏起来',tab:'成果与收藏',icon:'star',kicker:'SMALL REWARDS FOR REAL EXPLORATION',
 intro:'成果馆收着你的学习足迹，还有 36 件固定的像素收藏。每完成一章，就可以挑一件喜欢的。',
 steps:[
  {title:'先完成章节里的课堂',text:'章节或单元中的课时全部完成后，获得一次章节奖励。只是生成教案或阅读原书分析，还不算完成课堂。'},
  {title:'在收藏图鉴里挑一件',text:'进入成果馆 →「收藏图鉴」，点击喜欢的未解锁物品，选择一份待领取章节奖励，再确认领取。'},
  {title:'摆进自己的校园',text:'领取后去建造模式布置。学习足迹里回看记录，像素成果展览里看看成果与已领取收藏。'}],
 note:{title:'慢慢集齐就好',text:'每章领取一次，答题对错不影响领取。先选未解锁收藏，集齐 36 件后可增加已有物品的摆放数量。奖励可以留到以后再领。'},
 links:[{to:'/museum?tab=collection',label:'翻开收藏图鉴'},{to:'/museum',label:'回看学习足迹'}]},
 {id:'build',title:'给校园添一点自己的样子',tab:'布置小世界',icon:'hammer',kicker:'MAKE ROOM FOR YOUR DISCOVERIES',
 intro:'校园全景、图书馆阅读室、创作工作室、林间花园、湖畔庭院：五个场景，各自保存布置。',
 steps:[
  {title:'选场景，再选物品',text:'进入建造模式，点击左侧场景卡片切换；手机上卡片在地图上方。选择物品箱中的物品，再点地面放置；绿色预览可放，红色需换位置。'},
  {title:'拖动、收回，都可以',text:'选中已有物品直接拖动，或使用「移动」「收回」。被遮挡时，从「选择场景里的物品」列表找到它。'},
  {title:'镜头和布置分开操作',text:'拖动空白处平移，滚轮或缩放按钮调整视野。操作失误可撤销、重做，满意后点「完成布置」。'}],
 note:{title:'收藏在所有场景共用数量',text:'只有一件的收藏想换到别处，先从原场景收回。刷新后布局保留，本次撤销历史会清空。室内大型建筑、场景边界和池塘会限制摆放。'},
 links:[{to:'/build',label:'去布置一个角落'}]},
 {id:'generation',title:'备课时，可以先去逛逛吗',tab:'AI 与等待',icon:'clock',kicker:'WHILE YOUR NEXT LESSON IS PREPARING',
 intro:'顶部「AI 设置」是已接入 AI 功能的共用配置。保存一次，同一浏览器里的相关功能就能使用。',
 steps:[
  {title:'已有内容，打开就能读',text:'阅读已保存的课堂、分析和概念卡，以及划线、排课、领取收藏、布置场景，都不需要重新请求 AI。'},
  {title:'整本 PDF 备课可站内后台继续',text:'网站仍开着时，可以切换站内页面或标签页。进度浮层可查看阶段、返回或暂停；其他页面的 AI 任务建议等完成后再离开。'},
  {title:'中断后，先继续剩余内容',text:'刷新、关闭、休眠可能中断。回原书点「继续准备未完成课时」。有报错就展开原因，先核对来源、页码、密钥或账户状态。'}],
 note:{title:'等待时间只是估计',text:'单次 AI 请求显示已用时间和估计范围，不能准确报告模型百分比。整本章节与课时数量是真实进度。聊天、生成、检索和改换讲解可能产生 API 费用。'},
 links:[{to:'/library?tab=pdf',label:'查看 PDF 备课'}]},
 {id:'backup',title:'好好保管你的学习故事',tab:'保存与备份',icon:'save',kicker:'KEEP A COPY OF YOUR LITTLE WORLD',
 intro:'内容保存在当前浏览器。刷新后通常仍在，但不同设备、浏览器和网址不会自动同步。',
 steps:[
  {title:'校园和学习：导出一份 JSON',text:'设置 →「导出 JSON 存档」。保存课程、草案、学习记录、标注、成果、收藏和各场景布局。'},
  {title:'每本原书：再留一份索引和 PDF',text:'打开原书 →「原书、备份与旧版分段结果」→ 导出目录与分析进度，并下载原始 PDF。这两份不在校园 JSON 里。'},
  {title:'换设备时，分别恢复',text:'导入校园 JSON，再到图书馆恢复各书的目录与索引并补回原 PDF。AI Key 另外配置，不会放进存档。'}],
 note:{title:'自动保存不等于永久保存',text:'清理站点数据可能丢失本机内容。换设备、清理浏览器或完成大量备课前后，建议留一份备份。导入校园 JSON 会替换当前校园数据，先备份再确认。'},
 links:[{to:'/settings',label:'打开设置与备份'},{to:'/library?tab=pdf',label:'备份我的原书'}]},
];

export const handbookIndex=(id:string|null|undefined)=>Math.max(0,handbookChapters.findIndex(c=>c.id===id));
export const nextHandbookPage=(index:number,direction:number)=>Math.max(0,Math.min(handbookChapters.length-1,index+direction));
