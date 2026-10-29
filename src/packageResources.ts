import type {Resource} from './model';
const external=(id:string,title:string,url:string,source:string,scope:string,portal=false):Resource=>({id:`pack-${id}`,title,url,source,scope,type:portal?'课程入口':'官方教材',tags:'V0.3,课程资源',courseId:'',unitId:'',status:'待阅读',language:portal?'韩语 / 多语言导航':'英语',difficulty:portal?'入门':'见课时说明',account:portal?'需要':'不需要',free:'免费',verification:portal?'仅入口已核实':'具体资源已核实',verifiedAt:'2026-10-24'});
const guide=(id:string,title:string,body:string):Resource=>({id:`pack-${id}`,title,url:'',source:'自由大学 · 原创学习指南',scope:'在课时中查看指定段落',type:'内置指南',tags:'V0.3,原创',courseId:'',unitId:'',status:'待阅读',language:'中文（含练习语言）',difficulty:'见课时说明',account:'不需要',free:'免费',verification:'内置指南',guide:body});
export const packageResources:Resource[]=[
 external('eco-cost','CORE Econ · Unit 3 Scarcity, work, and choice','https://books.core-econ.org/the-economy-v1/book/text/03.html','CORE Econ','3.3 Opportunity costs；本章生产函数与时间选择示意图'),
 external('eco-market','CORE Econ · Unit 8 Supply and demand','https://books.core-econ.org/the-economy-v1/book/text/08.html','CORE Econ','8.1 Demand and supply；8.2 Equilibrium price'),
 external('eng-detox','A digital detox podcast · B2','https://learnenglish.britishcouncil.org/free-resources/listening/b2/digital-detox-podcast','British Council LearnEnglish','Preparation、音频、Task 1/2、Transcript；公开学习内容免费，评论需登录'),
 external('eng-design','A design presentation · B2','https://learnenglish.britishcouncil.org/free-resources/listening/b2/design-presentation','British Council LearnEnglish','Preparation、音频、Task 1/2、Transcript'),
 external('eng-group','Creating a study group · B2','https://learnenglish.britishcouncil.org/free-resources/listening/b2/creating-study-group','British Council LearnEnglish','音频、理解练习与 Transcript'),
 external('kor-portal','Online King Sejong Institute · 课程入口','https://www.iksi.or.kr/lms/main/main.do','世宗学堂','仅确认平台及入门课程目录；登录后的具体课时和音频未核实。内置文字指南可独立学习。',true),
 external('qgis-interface','QGIS 3.44 · An Overview of the Interface','https://docs.qgis.org/3.44/en/docs/training_manual/basic_map/overview.html','QGIS 官方文档','2.1 Layers、Browser、Map Canvas'),
 external('qgis-layer','QGIS 3.44 · Importing a delimited text file','https://docs.qgis.org/3.44/en/docs/user_manual/managing_data_source/opening_data.html','QGIS 官方用户手册','页面内 Importing a delimited text file；字段分隔、XY Geometry、CRS'),
 external('qgis-classification','QGIS 3.44 · Classification','https://docs.qgis.org/3.44/en/docs/training_manual/vector_classification/classification.html','QGIS 官方训练手册','3.3.1 Classifying Nominal Data；把示例 landuse 换为本课点图 type 字段'),
 external('qgis-layout','QGIS 3.44 · Using Print Layout','https://docs.qgis.org/3.44/en/docs/training_manual/map_composer/map_composer.html','QGIS 官方训练手册','4.1 Layout Manager、Map Composition、标题、图例与导出'),
 external('aud-record','Audacity · Recording your voice with a microphone','https://support.audacityteam.org/basics/recording-your-voice-and-microphone','Audacity 官方支持','输入设备、测试录音、录音电平；用自己的环境声替代语音'),
 external('aud-edit','Audacity · Basic Recording, Editing and Exporting','https://manual.audacityteam.org/man/basic_recording_editing_and_exporting.html','Audacity 官方手册','Step 3 Trimming、Step 4 Fading、Step 5 Exporting；版本不同菜单位置可能变化'),
 guide('jpn-guide','日语表达实验册 · 原创情境 A/B/C',`A｜约见与请求
明天的小组讨论需要一份资料。对朋友可以说「明日、資料送ってもらえる？」；对同事可尝试「明日の打ち合わせに使いたいので、資料を送っていただけますか。」这些是本系统原创例句，不是唯一正确表达。
比较三个版本：①明日、資料送って。②明日、資料を送ってもらえますか。③お忙しいところすみません。明日の打ち合わせ用に、資料を送っていただけますか。難しければ、いつごろになりそうか教えてください。
注意关系、期限和对方可拒绝的空间。过长的敬语未必适合亲密朋友。

B｜不同意见
原创讨论观点：「大学の授業は全部録画したほうがいい。欠席しても後から見られるから。」先复述：欠席した人も学べることが大切なんですね。再提出保留：たしかに便利ですね。ただ、話し合い中心の授業では、録画されると話しにくい人もいるかもしれません。
把上例换成自己的理由；不要只替换几个词。可用结构：相手の主張 → 同意できる点 → 留保 → 具体例 → 条件付きの提案。

C｜延期请求
情境：周五截止，下周一可交；原因由你如实填写。检查：件名清楚吗？已说明课程和姓名吗？日期明确吗？是否提出如果不能延期的替代方案？
短语素材：「提出期限についてご相談があります」「月曜日まで延ばしていただくことは可能でしょうか」「難しい場合は、現時点で完成している部分を金曜日に提出いたします」。避免不真实的借口与过度道歉。`),
 guide('eco-table','边际比较 · 原创假设数据',`学习小时：0｜1｜2｜3｜4
假设练习得分：0｜30｜50｜62｜68
边际变化等于相邻总量相减；自己计算后核对：30、20、12、6。
这只是展示增量变化的虚构模型，不是学习时长或成绩承诺。不同人的已有知识、睡眠、动机都可能改变结果。每多学一小时也意味着少一小时用于其他事情；非货币价值不必强行换算成钱。`),
 guide('kor-guide','韩文字形与第一张介绍卡 · 原创文字指南',`A｜音节方块
韩文音节由字母组合。ㅏ、ㅓ、ㅣ 是竖向结构，通常放在开头辅音右侧；ㅗ、ㅜ 是横向结构，通常放在下方。例：ㄴ+ㅏ=나，ㅁ+ㅗ=모，ㄴ+ㅜ=누。
练习组：나 너 노 누 니 / 마 머 모 무 미。ㅇ 在音节开头可作无声占位，如 아；它在收音位置的作用不同。本文不给中文谐音，文字辨认不等于掌握发音。

B｜收音位置
가=ㄱ+ㅏ；각=ㄱ+ㅏ+ㄱ，最后一个 ㄱ 放在底部，称为收音。
拆分核对：한=ㅎ+ㅏ+ㄴ；글=ㄱ+ㅡ+ㄹ；문=ㅁ+ㅜ+ㄴ；산=ㅅ+ㅏ+ㄴ。ㅡ 是横向元音。识别字形后，仍需听标准音练习实际发音、连音与收音变化。

C｜介绍卡
안녕하세요.（你好。）저는 학생이에요.（我是学生。）저는 민수예요.（我是民洙。）这些是原创练习例句。
名词末尾有收音时使用 이에요，无收音时使用 예요。학생 的 생 有收音 ㅇ；민수 的 수 没有收音。名字可以暂用熟悉的韩文名练习；真实姓名的音译应另行核对。
世宗入口需要登录；本包未声称提供已核实的具体发音课。`),
 guide('dat-guide','虚构校园 CSV 与地图检查表',`A｜可复制的练习 CSV（原创虚构点，非实测）
name,lon,lat,type
reading,121.5000,25.0300,quiet
square,121.5010,25.0300,social
garden,121.5000,25.0310,green
bench,121.5010,25.0310,quiet

保存为 UTF-8 文本 campus.csv，分隔符为逗号。经度 lon 对应 X，纬度 lat 对应 Y，坐标系 WGS 84 / EPSG:4326。QGIS 项目文件引用源文件：请把 CSV 与项目一起保存，不要随意移动源文件。

B｜符号检查
quiet/social/green 是无序类别。用不同色相或形状，不用由小到大的符号暗示数量。图例应写可理解的类别名；查看是否有空值类别。

C｜交付检查
图名、图例、来源、日期、坐标系或范围说明是否齐全？导出的 PNG 是否裁掉标签？必须标注“虚构练习数据”，不能拿这四个点推断真实校园活动或噪声。`),
 guide('soc-guide','田野观察工具册 · 原创表格',`A｜五行观察表
时间｜可见行为｜环境条件｜我的推测｜仍不知道什么
每三分钟记一条，共五条。只记录匿名可见行为，不采集私人对话。例：“两人把包放在台阶上，坐了约两分钟”是描述；“他们不喜欢长椅”是待核查推测。

B｜扩写模板
场景：时间窗口、位置、天气、空间草图。
过程：按时间排序的可见事件。
反思：我注意到什么，为什么？我的位置挡住了哪些信息？
未知：未看见、未听清、不能确定的内容。
虚构速记供练习：16:00，长椅在阳光中，无人；台阶阴影中两人坐下。16:03，一人经过长椅，在台阶边停留；16:06，三人一起离开。没有记录到交谈内容。

C｜多重解释表
现象｜解释 A/B｜如果成立应看到什么｜可能反例｜怎样再观察
练习情境：“同一时段，长椅空着而台阶有人坐。”可能涉及阴影、座位位置、同伴交流，也可能只是偶然。不能凭一次观察确定因果。换时段观察可以补充证据，仍无法直接得知个人动机。`),
 guide('snd-guide','声景手册 · 原创聆听与制作表',`A｜聆听记录
时间｜可能声源｜近/中/远｜持续/间歇｜音色与节奏｜个人感受
将听到的特征和自己的感受分开。例：远处低频持续声 / 声源未知 / 让我觉得空间很空。无法确认来源也可以记录。

B｜录音记录
文件名｜日期时段｜设备｜与声源距离｜环境｜增益调整｜是否含私人谈话
先做短测试，回听失真、风噪与意外触碰声。避免可识别私人对话；可录自己的翻书、脚步或房间环境。保存原始工程，剪辑时另存副本。

C｜剪辑说明
保留时间段｜删除时间段｜淡入/淡出长度｜选择理由｜导出格式｜复听结果
工程用于继续编辑，导出音频用于播放。保留一份原始录音。记录作品文件位置或自己的分享链接，本系统只保存文字和链接，不上传音频。`)
];
