# 自由大学 V0.3 · 课程内容引擎

日期：2026-10-24。基于原项目增量开发；未重绘校园、未删除数据库、未更换数据库名称。

## 内容与使用

教务处 → 课程 → 章节中的课时卡，可直接开始。顶部「课程备课室」可查看课程包、修改内容与教材、调整顺序、创建新课或休学。

| 课程 | 数量 | 三节课时 |
| --- | ---: | --- |
| JPN 201 高级日语表达 | 3 | 语气与人际距离；不同意见；延期请求邮件 |
| ENG 201 英语能力提升 | 3 | Digital detox；Design presentation；Creating a study group |
| ECO 101 经济学入门 | 3 | 机会成本；边际比较；供需与曲线移动 |
| KOR 101 韩语入门 | 3 | 音节方块；收音位置；自我介绍卡 |
| DAT 101 数据可视化 | 3 | QGIS CSV 点图；分类符号；地图布局导出 |
| SOC 201 社会观察与田野创作 | 3 | 十五分钟观察；田野笔记；多重解释 |
| SND 101 声音与声景创作 | 3 | 聆听草图；录音测试；剪辑与导出 |

共 **21 节**，每节有目标、具体范围、4 个操作步骤、练习与自查提示、完成条件、知识节点、预计时长与难度。所有内容在 `coursePackages.ts` 中结构化保存；内置指南在 `packageResources.ts`。

经济学、韩语、数据技能采用循序路线；其余采用主题探索。循序推荐不锁课，用户仍能自由打开任意课时。数据技能本批聚焦 QGIS，不代表已完成全部 Excel/统计课程；韩语本批是文字入门，不宣称已经训练标准发音。

## 模型与兼容

- 新增 `Lesson`：所属课程/章节、标题简介、目标、时间、难度、类型/模式、顺序、前置建议、下一节、步骤、练习、完成条件、多知识节点、多活动、多资源引用，以及步骤/回答/笔记/课时状态。
- `Course` 增加可选 `learningRoute` 与 `packageId`；原字段不删除。
- `Resource` 增加来源、语言、难度、费用/账号要求、验证层级/日期、默认范围与内置指南。
- 多对多关系只在 `Lesson.resourceLinks` 保存：`resourceId`、课时专属 `scope`、是否可选。图书馆关联课程/课时动态计算，不维护易失同步的双份 ID 列表。
- `LearningActivity.lessonId` 将课时映射到原课表结构；原有 ScheduleEntry 不需要重写。旧任务继续可安排与学习。
- `StudyLog.lessonId` 指向课时，日志保存当时笔记与练习快照。多次练习增加日志，不复制知识节点；知识晶体按节点去重。
- `version:2` / `contentVersion:3`；Dexie 数据库仍为 `free-university-v1`，表版本仍为 1。迁移是存档内容升级，不是清库建表。
- 首次迁移只扩展尚存的原始七门课程，保留其用户编辑。删除过的课程不自动重建；同代码的用户自建课不被覆盖。可主动一键选课创建新实例。
- 在同一 IndexedDB 事务内保留升级前 `backup-before-v03` 并写入新 `main`。再次打开不重复安装。异常存档阻止写入，允许导出原始数据。旧版 JSON 可验证后迁移导入；导入仍需确认替换。

## 资源核实清单

本次新增 **18 个资源实体：11 个已核实具体网页、1 个仅核实入口、6 个原创内置指南**。原有个人收藏和四个旧入口保持原状，不以本次核实结果覆盖用户资料。

核实方式：2026-10-24 打开官方页面，检查标题与可见内容范围。并未逐一播放全部音频、登录平台或安装 QGIS/Audacity 执行教材。这是链接与内容入口核实，不保证以后网站不会改版。应用只保存元数据与链接，不存储外部教材全文/音视频。

| 资源 | 层级 | 学习范围 |
| --- | --- | --- |
| [CORE Unit 3](https://books.core-econ.org/the-economy-v1/book/text/03.html) | 具体资源已核实 | 3.3 Opportunity costs；生产函数与时间选择 |
| [CORE Unit 8](https://books.core-econ.org/the-economy-v1/book/text/08.html) | 具体资源已核实 | 8.1 供需；8.2 均衡 |
| [British Council Digital detox](https://learnenglish.britishcouncil.org/free-resources/listening/b2/digital-detox-podcast) | 具体资源已核实 | B2 音频、预习、Task 1/2、文字稿 |
| [British Council Design presentation](https://learnenglish.britishcouncil.org/free-resources/listening/b2/design-presentation) | 具体资源已核实 | B2 展示听力与理解题 |
| [British Council Study group](https://learnenglish.britishcouncil.org/free-resources/listening/b2/creating-study-group) | 具体资源已核实 | B2 协商听力与练习 |
| [QGIS 3.44 Interface](https://docs.qgis.org/3.44/en/docs/training_manual/basic_map/overview.html) | 具体资源已核实 | 图层面板、浏览器、画布 |
| [QGIS Opening Data](https://docs.qgis.org/3.44/en/docs/user_manual/managing_data_source/opening_data.html) | 具体资源已核实 | Importing a delimited text file |
| [QGIS Classification](https://docs.qgis.org/3.44/en/docs/training_manual/vector_classification/classification.html) | 具体资源已核实 | 3.3.1 分类渲染 |
| [QGIS Print Layout](https://docs.qgis.org/3.44/en/docs/training_manual/map_composer/map_composer.html) | 具体资源已核实 | 布局、图例与导出 |
| [Audacity Recording](https://support.audacityteam.org/basics/recording-your-voice-and-microphone) | 具体资源已核实 | 输入设备、测试录音与电平 |
| [Audacity Editing / Exporting](https://manual.audacityteam.org/man/basic_recording_editing_and_exporting.html) | 具体资源已核实 | 裁剪、淡入淡出、导出；菜单可能随版本不同 |
| [Online King Sejong Institute](https://www.iksi.or.kr/lms/main/main.do) | 仅入口已核实 | 官方课程目录；具体登录后课时尚未核实 |

11 个具体网页均为公开免费内容，无需账号阅读；British Council 评论需要登录。世宗课程平台免费但学习流程需要账号，本项目不替用户注册。

6 个原创内置资源：日语情境实验册、边际比较假设表、韩文文字指南、虚构校园 CSV/地图检查表、田野工具册、声景记录手册。内置资源直接在课时与图书馆展开，不依赖外站。

**尚待核实/补充**：世宗登录后的具体发音与课程媒体；日语真人听力配套素材；用户已有或后来新增网址除非自行确认，否则显示待核实。更换网址会清除旧验证状态和日期。未准备好必需资源的课时不进入默认推荐；世宗入口作为可选补充，韩语文字课依靠内置指南独立可学。

## 交互与进度

- 勾选步骤与跳过分别保存，未完成可继续；练习与笔记每次输入写入本地存档。
- “保存学习记录”可只记录部分进展；标记课时完成需自查完成条件。完成课时不自动宣称知识掌握。
- 可单独选择多个已掌握节点。作品只保存用户提供的链接，不上传文件。
- 自动排课只选资源就绪且课程正在学习的 Lesson。循序课程每轮只推荐最早可学一节，避免替用户假设前置已经学会；主题探索可推荐多节。保留已有安排、任务数/时长上限、类型平衡与休息日。
- 备课室改标题、时间或教材会同步任务卡；资源替换后双方视图实时从同一引用读取。删资源会解除引用，但不删课时与日志。
- 课时支持上下排序；改变循序/探索模式会更新前置建议与下一节。
- 弹窗限制宽度、长文本换行；正文保留底部导航安全空间；移除课堂与任务池的多层竖向滚动。校园绘图文件未修改。

## 验证与边界

46 项 Vitest 测试通过，包含模型行为、fake IndexedDB 迁移/事务备份/重载、旧功能回归，以及 React SSR 页面结构。全部 21 节课页面均被渲染验证。

| 验收项 | 本轮证据 |
| --- | --- |
| 经济学首单元进入真实教材 | 官方页面读取核实；课时 SSR 检查真实 href 与具体范围 |
| 步骤、笔记与部分/完整学习 | 模型行为及 IndexedDB 重载测试 |
| Done List 中出现记录 | 学习存档快照测试及成果馆 SSR 内容测试 |
| 自动排课使用 Lesson | 只选就绪课时、课程暂停、顺序、去重与容量测试 |
| 图书馆/课时双向查看 | 共享资源查询及资源深链接 SSR 测试 |
| 修改教材关联更新 | 引用替换后双向查询与推荐就绪状态测试 |
| 刷新保留新旧数据 | fake IndexedDB 重载后完整数据一致性测试 |
| 旧课程、资源、校园不丢失 | 逐项旧实体相等、迁移幂等、删除课程不复活、原始备份测试 |

浏览器工具拒绝访问本地预览地址，未绕过策略；因此 **没有声称通过浏览器逐点击 E2E、真实 IndexedDB 浏览器重启或手机截图验收**。Vite 能启动，但当前工具环境的本地 HTTP 探测未成功。静态布局修正已实现，仍需要真实浏览器视觉复核。

下一阶段建议：首先完成浏览器桌面/手机交互验收、补充有授权且可核实的韩语发音资源与日语听力，再扩展完整课程单元、草稿历史和回收站。AI 仅预留 `CourseContentProvider` 接口，本轮不调用 AI 服务。
