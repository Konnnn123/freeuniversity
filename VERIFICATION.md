# 全书总览的长请求与错误响应 · 2026-10-30.51

- 用户截图的目录已为 5 项、文字已提取 89 页，报错发生在「生成全书总览」。查明客户端把响应解析失败统称为「服务未返回有效内容」，无法区分网页、空响应、网关失败；HTTP 200 非接口内容还可能落入后续步骤。此缺陷已修复。当前 Worker 日志未含用户对应 API 调用，尚不能证明此次上游失败的具体 HTTP 状态或原因。
- 仅为新版全书总览正文 / 路线请求协商 NDJSON 进度响应：连接立即建立，每 8 秒提供连接状态，最终事件携带真实业务状态和完整结果。旧 JSON 客户端及其他 AI 任务保持原协议。连接状态不冒充内容进度，不自动重发已提交的付费生成。
- 客户端对 HTML、空响应、非对象、提前关闭和无结果字段作显式失败处理；保存 HTTP 状态、内容类型、请求编号和当前动作，不保存错误网页正文或请求密钥。有效 AI 错误继续保留原业务代码和诊断。
- 暂停 / 取消进度流会中止上游请求，清理心跳；本地开发网关转发流而非缓存整个响应。原有总览正文 / 大纲分阶段保存和继续逻辑不变，目录、课程、PDF 与标注均未迁移或清理。
- 新增连接先建立、心跳、中文跨字节、最终结果、上游错误透传、HTML 的 200/403/502/504、提前断流、取消和旧协议兼容测试。完整测试与生产构建见发布结果；浏览器点击及用户真实密钥的生成结果未验证。

# 无电子书签 PDF 的目录恢复与备课 · 2026-10-30.50

- 无书签 PDF 自动检查前 5 页可读文字与书内目录候选；不再仅提供失效的生成按钮。新增本地全书目录 / 正文标题识别，以及可编辑的确认预览。
- 保留 PDF 文本坐标，按版面顺序读取目录列；将书内页码与正文标题、结束页页码交叉核对。无法核对的范围明确标为待核对，不能在缺失或重叠页码下采用。
- 找不到目录时，可按实际 PDF 页码创建 8 页学习分段，明确不是原书章节；也可直接提取 1–40 页到文字备课室。空白 / 扫描范围仍提示 OCR，不编造可读原文。
- 采用后复用现有全书大纲与课时引擎。相同范围沿用原 ID，重叠结构拒绝覆盖，原书、旧分析、已备课时与阅读标注不删除。待确认目录随原书索引保存及验证；对照原文时保留未采用的修改。
- 对用户提供的 89 页导则作本地实际 PDF.js 提取与识别验证：识别目录第 5 页，核对五个章节的 PDF 范围为 6–12、13–26、27–52、53–77、78–87。原 PDF 与提取文字未纳入源码或上传。检测到一页乱码；图表、尺寸和版面仍需对照原 PDF，未宣称 AI 识图。
- 365 项检查、50 个测试文件通过，包括列顺序、页码偏移、无证据拒绝、范围重叠、保留 ID、索引恢复和全书备课引擎接入。TypeScript / Vite / Worker 构建通过。浏览器工具不可用，未完成真实浏览器点击和视觉验证；未使用用户密钥调用 AI。

# 删除课程后空白页修复 · 2026-10-29.49

- 根因：外部存档状态先移除课程，确认框选中的 removeId 在保存完成前仍存在；组件再次调用严格 deletionPlan，抛出「课程不存在」导致根视图中断。
- UI 预览改用 currentDeletionPlan，仅在目标仍存在时生成删除信息；删除引擎仍保留不存在课程的严格校验。已删除课程详情使用 replace 返回课程列表。
- 删除流程成功更新内存后立即关闭确认框并返回列表，存盘和可选 PDF 清理在其后继续。存盘失败不清理 PDF，PDF 清理失败显示仍保留原书的提示；异常均有可见反馈。
- 新增七项回归：过渡状态预览、延迟保存、延迟 PDF 清理、保存失败、PDF 清理失败、无效删除 / 拒绝保存、IndexedDB 重载与保留记录。没有对用户真实课程执行删除操作。
- 浏览器实机点击尚未验证；使用领域流程、存档订阅与 fake IndexedDB 验证删除过渡。

# 按课程与章节排课 · 2026-10-29.48

- 移除「+日语探索」「+英语探索」「显示语言系统路线」等语言专用课表入口；所有语言和其他课程使用同一课时列表。已排的旧语言探索继续显示、移动和打开。
- 全部课程默认只显示折叠摘要；筛选课程自动展开课程和首个可学章节，一次展开一章，默认最多三节待学课时；其余课时主动展开。复习、待备课和原有自由任务分别折叠。
- 左侧限定内部滚动，课程筛选不再隐藏语言课；不使用扁平的全部课时卡片堆叠。日期栏显示课程名、章节名和具体课时。
- 新增按课程 / 章节的自动排课：使用可学的未完成课堂，不生成语言素材任务；按课程顺序安排，计算原有任务数与时长，避免本周重复安排同一课时，包括同课其他活动ID。
- 保留点击 / 拖动排课、跨周移动、自由日期选择、退回任务池；同一天重复安排给予明确提示。未修改存档结构或现有计划、进度。
- 新增百课时收拢渲染、三课预览、语言课程可见、历史任务、章节范围、顺序、现有负载、同课去重等检查；TypeScript / Vite / Worker 构建验证。浏览器实际操作和手机视觉尚未实测。

# 地图底部操作栏 · 2026-10-29.47

- 将缩放按钮和悬停 / 放置提示移到地图画布外的固定底栏，不再在场景中央显示独立提示框。
- 底栏跟随地图容器排列，不参与地图绘制、缩放或拖动；canvas 的 ResizeObserver 按剩余高度重新计算。
- 提示文字使用无边框样式；窄屏最多显示两行，不挤出地图横向滚动。
- 浏览模式鼠标离开地图后清除建筑悬停提示，返回通用说明；建造中的放置反馈继续保留。
- 未修改建筑名、跳转或任何用户数据。构建验证；浏览器实机视觉未验证。

# 建筑原有名牌 · 2026-10-29.46

- 地图恢复使用建筑存档中的名称（教学楼、排课中心、图书馆、成果展览馆等），不以功能页面名称覆盖建筑名称。
- 名牌绘制和点击范围均按原建筑名测量；悬停提示同时说明原名与对应功能去向。
- 保留上一版统一的页面跳转、四个功能入口及其他建筑布景。没有修改用户建筑对象或任何学习记录。
- TypeScript / Vite / Worker 构建与现有检查验证；未完成浏览器实机视觉验收。

# 四个核心功能入口 · 2026-10-29.45

- 地图只对课表、课程、图书馆、成果馆四处显示功能标签并接受跳转，标签与点击共用统一导航定义。教务处、工坊和花园建筑保留为布景，移除地图下方重复按钮。
- 删除独立探索花园页面及「今天的灵感」入口；移除旧课堂二次选课目录、全站备课课程包选择页。旧 /garden、/classroom 和 /prep 链接通过 replace 转入对应核心区域。
- 课程 / 任务 / 课时：课程始终先显示统一大纲，不再把语言课程自动替换为工作室；工作室作为课程内显式工具，并有返回课程入口。
- 课时编辑移到 /courses/:courseId/edit-lessons；自由任务记录移到 /courses/:courseId/tasks/:activityId，保留原活动与笔记 ID；自由记录从课程「学习任务」进入。课表、资料页不再产生旧导航链接。
- 课程、课时、工作室、开课页均高亮底部课程；PDF、文字备课均高亮图书馆。课程进入课堂直接选择学习中的课时，PDF 待备课大纲留在课程内。
- 未删除用户课程、资料、任务、学习记录、语言收藏或建筑布置；未改存档结构。
- 47 个文件、336 项检查通过；新增导航归属、旧书签、错误课程关联、课表直达、地图布景无功能标签、无数据写入及统一语言课程页面检查。浏览器实际点击 / 手机视觉尚未实测。

# 左侧场景卡片 · 2026-10-29.44

- 移除校园 / 建造顶部的场景下拉框，地图左侧展示五个可点击的像素场景卡片。
- 每个场景使用独立的代码绘制小插图，显示室内 / 户外分类，当前场景绿色高亮及 aria-pressed 状态。
- 继续使用原有 URL 场景切换与独立存档机制；不改变布局、收藏、镜头或学习数据结构。
- 窄屏五个卡片并排在地图上方；矮屏缩小插图和留白。物品箱保持在地图下方，地图由 ResizeObserver 按剩余空间重算。
- 更新站内小手册的切换场景说明。46 个文件、331 项检查通过；TypeScript / Vite / Worker 构建通过。
- 当前浏览器工具找不到用户提供的站点标签页，未完成真实浏览器点击和手机视觉验收。

# 站内像素使用手册 · 2026-10-29.43

- 顶部全站「使用手册」打开像素书本弹窗，保留当前学习页面；支持目录、上下页、左右键、Esc 关闭和焦点回到入口。
- 11 个简短主题覆盖开课、PDF、阅读标注、续学、资料、课表、收藏、五个场景、AI 等待和三份备份；不调用 AI、不修改学习存档。
- 按当前路径打开相关主题。独立链接 /#/handbook 支持 ?chapter=pdf 等章节定位；正文快捷入口关闭手册后进入对应功能。
- 固定书本高度，正文与目录内部滚动；窄屏改为横向目录和单页阅读，当前目录项自动滚入可见位置。手册遮罩层高于后台备课浮层。
- 现有 46 个文件、331 项检查通过；TypeScript / Vite / Worker 构建通过。检查全站入口和页面内容均包含在生产资产中。
- 本地预览已启动；内置浏览器访问本机地址超时，Windows 浏览器自动化因不能确认当前 URL 被工具停止。未完成浏览器翻页、手机显示和键盘操作实测，不以编译或现有测试替代实机验收。

# V0.5 试用版验证 · 2026-10-25

- Vitest：12 个文件、78 项测试通过（含此前63项）。
- TypeScript / Vite / Worker ESM 构建成功。
- 直接调用构建后的 Worker：主页200，JS资产200且MIME正确，缺密钥API401。
- 本地预览服务成功启动于 http://127.0.0.1:4185/；沙箱套接字拒绝 HTTP 检查，额外只读检查未及时返回，未以此声称浏览器验收。
- 新测试：三节短课生成与幂等接受、现有课程与校园保留、课程可排课、调序不改变内容归属、无回答也可主动完成、掌握状态单独设置、选择反馈记录入成果馆、JSON 与 IndexedDB 重载、错误引用/虚构原句/截断拒绝、固定上游请求、跨源与缺密钥拒绝、概览和课堂服务端渲染。

AI网关测试模拟上游，没有实际使用用户 Key 发起付费调用。未将SSR或领域测试当作浏览器点击、手机视觉或线上模型质量验收。外部维基百科可用性仍依赖网络。

生产主JS约635kB，构建有非阻断的大包提示，后续适合按路由拆包。

## PDF 导入补充

84项测试全部通过（13个文件），TypeScript与生产构建成功。新增测试使用PDF.js实际解析自建的两页PDF，确认文本、物理页标记、空白页提示；另覆盖页码边界、40页限制、英文与CJK文字拼接、假PDF拒绝、来源页码与JSON持久化。采用pdfjs-dist 6.2.108（安装检查0漏洞），修正6.x销毁接口适配。Worker支持.mjs模块正确MIME，PDF解析器与worker仅导入时按需加载。未完成真实浏览器文件选择和手机视觉验收，沿用此前浏览器连接受限的说明。

## V0.6

93项测试（15文件）、类型检查与生产构建通过。包括模拟700页文本的分批覆盖与恢复、原PDF Blob保存、索引备份校验、源段落合并和新接口模拟测试。未实测用户的700页文件、真实付费AI搜索与报告质量、真实浏览器canvas阅读，不能将模拟测试表述为完成这些验收。详见V06-DELIVERY.md。

## V0.7

102项测试、17个文件通过，TypeScript与Worker生产构建成功。新增真实12页PDF书签/命名跳转/页面标签测试；按章恢复、ID错误诊断、总览依据及目录UI输出测试。用户700页文件、真实AI和浏览器点击尚未实测，详见V07-DELIVERY.md。

## API Key 保存修正

新增测试覆盖模块重载后读取、模型与搜索两条请求使用保存值、同源其他标签页清除后不继续使用旧值、持久清除、存储失败不显示成功。不读取用户真实密钥。

## 请求头字符异常修复

109项测试通过（18文件），TypeScript与生产构建成功。新增：非ASCII/全角/零宽字符/换行拦截、无效已存Key在fetch前阻止、旧Key外层引号兼容、非法新输入不覆盖已有配置、生成标准Headers验证。错误提示不含密钥原文；不读取用户真实Key。

## AI JSON 解析修复

120项自动化测试（19文件）通过，包含真实Headers检查与新增JSON回复集成测试：Markdown包裹、带引号/花括号的文字、结构化文本分部、一次格式修复、拒绝改写内容、截断外层不能误取内部对象、空内容/非JSON/数组分类、修复失败不循环。TypeScript和生产构建成功。测试模拟上游响应，未读取真实密钥或实测用户这次原始回复。
## 2026-10-25：书籍分析分阶段保存

- 全书总览与章节分析拆为连贯正文、小型结构大纲两个阶段，正文成功后立即保存到原书的 IndexedDB 记录。大纲失败可以直接阅读正文，并只重试未完成阶段。
- 截断正文标记为未完成，不作为完整学习结论。旧的已完成分部、校园、课程和 PDF 文件保持兼容，不重置数据库。
- 最近一次失败诊断包含模型原始回复、格式修复回复、结束原因与解析错误，保存在当前浏览器，可手动导出。诊断可能含教材摘录，不自动发送给开发者，不写入服务器日志；返回诊断时移除本次 API 密钥。
- 正常每个处理单元使用两次内容请求；小型 JSON 格式修复最多另加一次。已完成阶段缓存，避免继续时重复生成正文。
- 过去未保存的失败回复无法追溯；新一次分析失败后才会有完整诊断。
- 验证：127 项自动测试通过，含正文检查点、失败继续、截断、暂停、旧结果兼容、诊断密钥移除。构建通过。AI 返回使用模拟数据验证；未使用用户真实密钥或700页PDF进行付费实测，浏览器预览受环境限制未完成。

## 2026-10-26：阅读层次与概念探索
- 范围：书籍章节、书籍总览与保存的分析正文。旧正文无须重新分析即可分段阅读；章节已有概念词原位高亮，不改写原有结论。新生成正文要求问题标题与少量加粗。
- 本章概念支点、阅读宽度、大字与行距、概念高亮开关。设置在浏览器保存。
- 概念展开后按需调用 AI，生成解释、假设情境、不同角度的例子、误解、边界及选择题逐项反馈；不会自动标记掌握。无强制答题。
- 新闻、政策、案例使用原有搜索与关联接口，单独点击才请求，有来源、日期、摘要和核实边界；不把模型生成的例子作为真实事件。
- 缓存位于原书 ChapterJob.explorations，可随书籍索引备份导出恢复。原 IndexedDB 表不变。事务写入避免两张卡同时完成时相互覆盖。
- 134项自动测试通过，构建通过；含安全渲染、文字保留、题目完整性、真实IndexedDB缓存、备份兼容和并发保存。未调用用户付费 API，未用用户 PDF 完成端到端浏览器测试；环境的浏览器预览此前不可用，本轮未声称通过视觉实测。

## 2026-10-26：一次准备整章学习包
- 正文分析完成后自动依次准备全部概念卡和本章共享的新闻、政策、案例，再整理统一联系解释。点击一次即可继续所有阶段；失败保留检查点，下次只处理未完成阶段。旧章节通过「继续备齐本章学习内容」补齐，不重新分析正文。
- 新增可选 ChapterJob.resources：每类搜索的查询与结果、共享关联解释及阶段错误；沿用 explorations 保存概念卡。IndexedDB 表结构不变，旧数据兼容，索引备份包含学习包。
- 阅读展开概念不发请求。额外「换一组例子与练习」「查找更多」放入折叠探索区，才产生新调用。
- 修复 checkExploration 对整份外部资料计入9000字符上限导致的误报。外部来源独立校验；先保存搜索结果，即使关联解释失败仍展示来源，继续时不重复搜索。限定官方来源没有结果时，最多扩大一次搜索范围；失败不冒充空结果。
- 数字与单位连同所在短句标记，定义、条件/例外区分样式，不对高亮内容作现行法律正确性的背书。原分析 paragraph 引用缩为〔源〕，点击查看原标注；未核实编号不冒充准确原书段落或页码，可回本章核对。
- 144项自动测试通过；测试涵盖自动整章准备、缓存零重复调用、部分失败继续、暂停、外部资料长度回归、检索回退、引用渲染及真实 IndexedDB 存取/备份校验。构建通过。AI/检索使用模拟回复验证，未使用用户真实密钥、PDF做付费端到端实测；未完成浏览器视觉实测。
- 搜索请求与响应字段核对官方文档：https://api-docs.deepseek.com/api/search/ 。检索摘要不等于核实全文，不保证每个主题都有匹配的新闻或案例。

## 2026-10-26：PDF 加入课程
- 原书详情新增「把这本资料加入课程」。按已确认的PDF大章建立课程章节及课时，关联原书和书签ID，不复制PDF文件、不再次调用AI。
- 新增可选 Course.bookId、Lesson.bookId/bookNodeId、Resource.bookId/bookNodeId；旧数据兼容。书籍索引仍在独立书籍数据库，课程归主存档。课程JSON备份不包含原PDF与书籍分析，跨设备须同时恢复书籍索引与原文件。
- 课时工作台直接读取书架已保存的本章内容、概念练习和现实资料，笔记、步骤、课时完成及Done List复用原课程体系。原书或章节缺失时显示恢复/准备入口，不伪造教材。
- 已备正文课时可进任务池；未备章节保留在课程大纲中，需先备课。后续已关联原书备课完成会同步；也可手动同步补充目录。重复同步不重置已有课时标题、笔记、完成状态、学习记录。
- 148项自动测试通过，构建通过；包括课程创建、真实教材关联、任务池/排课、幂等同步、学习进度保留和JSON验证。未操作用户浏览器里的真实PDF，未完成视觉浏览器实测。

## 2026-10-26：统一图书馆入口
- 底部「图书馆」默认展示「我的 PDF」，直接嵌入原书列表，不要求用户知道 /books 地址。旁边「收藏资源」保留网页/教材/指南，文字材料备课室有明确入口。
- PDF卡片直接打开原书/备课，或执行加入课程；已关联时打开课程。原书返回图书馆，阅读PDF/文字材料时底部图书馆保持高亮。旧 /books 链接继续可用。
- /library?resource=... 深链接仍自动打开收藏资源，清除单资源筛选保留资源分类。
- 仅整合导航与显示，使用原数据库，不移动或清空文件。149项测试及构建通过；未完成浏览器视觉实测。

## 2026-10-26：课程系统第一轮
- 新增 /course-planner：对话梳理需求、可编辑需求摘要、教材搜索、三节入门课预览、确认开课与可选本周排课。草案聊天、搜索及分析结果保存在主存档的可选 planning 字段；暂停/失败可继续，确认重复点击不重复创建。
- 资料层级明确为检索摘要，未核实全文和具体学习范围，不冒充完整教材。实际链接作为可选补充来源，待用户核对。当前是三节入门课程，不是自动生成整学期课程；已有资料可从图书馆继续开课。
- 新增 Course.subject，学科分类与原有 kind 学习形式分离。旧课程按代码与形式显示默认分类，不重写数据库；可编辑自定义分类。
- 课程列表和详情页均可删除，显示影响数量；默认保留学习记录与成果，可选删除课程独有资料、备课内容及未被其他课程/材料引用的原PDF和索引。共享来源及语言工作室引用继续保留。主存档写入失败时停止清理PDF。
- StudyLog.courseName/unitName 保存删除前的课程/章节名称，保留记录解除已删除对象引用。Artifact.chapterUnitId 记录章节纪念唯一键；全部课时完成时收藏一枚章节纪念，并写入当次学习足迹，不自动标记知识掌握。重复复习可继续记录，不重复纪念物。
- 保持校园美术和建造素材不变，本轮不创建可放置奖励或场馆内装。
- 157项自动测试与构建通过，包含旧数据分类、草案确认与排课幂等、删除保留/清除记录、共享资料保护、章节纪念去重、AI对话接口及草案导入校验。AI/搜索采用模拟响应，未使用用户真实密钥付费测试，未完成浏览器视觉端到端检查。

## 2026-10-26：全站AI入口与课程交互收拢
- 已实现AI调用原本共用 labClient、同一本地Key及本站网关，本轮将配置提升为顶部全站AI设置入口。各功能保留缺少配置时的快捷入口，但统一弹窗名称与作用范围；Key变更事件不携带密钥，更新全站配置状态。状态标为已配置，不冒称已验证联网。
- 移除课程页「从已有资料开课」按钮。图书馆原有PDF加入课程不受影响。
- 分类编辑改为真实下拉选择，支持当前分类、预设及单独自定义输入；筛选独立下拉框，支持分类与搜索共同作用、显示计数和空结果提示，旧课程按推断分类兼容显示。
- 卡片下方常驻编辑/删除按钮移入右键菜单；⋯按钮供触屏和普通点击使用，支持ContextMenu/Shift+F10、上下键、Escape、外部点击关闭及视口边界定位。课程详情保留删除入口与原确认流程。
- 161项自动测试通过，构建通过。AI配置与分类使用回归测试、菜单初始状态使用服务端渲染验证；未完成真实浏览器右键/触屏交互实测，未调用用户密钥验证联网。

## 2026-10-26：课程卡片布局回归修复
- 原因：菜单外层容器的flex填充和卡片100%高度组合，使按钮内部内容受到浏览器垂直布局规则影响，产生不一致空白。
- 改为外层网格拉伸、卡片显式纵向flex从顶部排列、封面不拉伸、内容区填充、页脚靠底；移除100%高度与flex:1冲突。手机横向卡片沿用原640px断点。
- 右键菜单使用Portal放到body，避开卡片层叠/裁切影响，按实际底部导航上沿限制菜单位置。
- 163项测试及构建通过，新增菜单导航避让与窄屏定位回归；尚未完成真实浏览器截图对照，修复依据用户截图、样式规则与定位测试。

## 2026-10-26：录屏中的课程菜单未显示
- 已抽帧查看用户2.5秒录屏，菜单按钮被点击/悬停但菜单未在画面出现。
- 发现 lab.css 先于 styles.css 导入；通用 .pixel-panel 的 position:relative 覆盖同优先级菜单position:fixed，Portal菜单跑到可视区域外。新增双类选择器，并在菜单内联明确fixed定位和层级。
- 菜单首项focus使用preventScroll，防止聚焦导致页面滚动关闭菜单；外部点击关闭逻辑排除自身触发按钮，保证再次点击⋯可正常收起。
- 163项既有测试与构建通过。浏览器工具绑定当前站点标签时30秒超时，本轮未用其他自动化绕过；没有声称完成真实浏览器点击复测。临时视频解码文件均在忽略的work目录，不进入源码或部署包。

## 2026-10-26：课程菜单轻量外观
- 按用户截图移除菜单的pixel-panel类、外边框、阶梯角和厚像素阴影，保留奶油底色、柔和轻阴影及鼠标/键盘高亮。
- 两项操作菜单不使用内嵌滚动区域，移除多余高度限制与滚动条，仍保留明确的内联fixed定位。
- 构建通过，数据与菜单操作行为不变。未完成浏览器视觉实测。

## 2026-10-26：开课流程收敛与教学生成分离
- 对话有明确收敛条件：主题与目标足够或两轮交流后，不再主动追加细节问题，显示生成大纲入口；识别「按这个安排写」「开始生成」「你替我选」等意图直接进入大纲生成，否定语句不触发。
- 阶段分为确定方向、预览三节大纲、准备单元、开始学习。新PlanningDraft可选ready/outline/lessonDrafts/teachingVersion，旧草案兼容；每节完成即保存，继续只补剩余课时。
- 独立course-outline和course-lesson模型任务，不复用资料摘要分析提示词。授课时经DeepSeek Fetch读取最多3个具体网页片段，正文只在服务端短暂处理，不在本地保存完整网页/教材；无可读内容或模型判断只有入口简介时不标记准备完成。可补充具体教材URL重试。
- 课程简介独立为短介绍，单元名改为「第一单元 · 从这里开始」；新生成课堂使用自然讲解，参考来源集中链接展示，不把输入片段编号冒充原文引用。旧课程不自动改写，提供按新版方式另备一版。
- 主按钮与说明独立分行，全宽排列；费用说明不再挤进按钮一行。课程仍有来源和适用条件提示，不以“人味”为由删除必要限制。
- 174项测试及构建通过：收敛条件、生成/否定意图、三课大纲、分课检查点、旧课程保留、简介与单元名、网页读取失败不授课和原文不回传。AI与网页读取使用模拟响应，未用用户密钥完成付费端到端实测；浏览器检查仍受此前超时限制。
- Fetch接口字段参考：https://api-docs.deepseek.com/api/fetch/ 。

## 2026-10-26：重新生成与备课版本
- 开课页顶部常驻「重新生成」，有两种模式：重做大纲，或保留大纲重新准备三节课。可以填写本次调整要求，可选择沿用来源或重新搜索。
- 生成前将当前PlanningDraft快照写入主存档可选planningHistory。新草案解除旧courseId/materialId关联，不修改旧课程、学习记录和笔记；确认新内容才另行创建课程。
- 「备课版本」列表可切换旧草案，不调用AI，切换前也保存当前工作。开始新想法前同样备份。旧版另备入口统一走新功能。
- 本次调整要求会进入大纲和教学请求；API请求失败保留版本和新课时检查点。删除课程并选择清理独有材料时，同步清理其关联备课快照；仅删除课程时保留快照并解除旧课程指向。
- 180项测试通过、构建通过：快照与原课程保护、保留大纲、JSON往返与版本恢复、无大纲时拒绝重备。未用真实密钥进行付费生成测试，未完成浏览器视觉检查。

## 2026-10-26：基础需求确认与顶部新草案入口
- 将「开启新的对话草案」移到页面顶部，与重新生成、我的课程并列；开始前自动保存当前草案版本。
- 修复把AI补全goal或轮数当成确认的错误。新增可选requirementsConfirmed：主题、具体目标、基础、讲解偏好和时长齐全，并由用户点击确认，才允许生成新大纲；修改基础字段会清除确认状态。
- 基础“不确定”不擅自推定零基础，提供用户主动选择「按零基础开始」。不固定一轮或两轮强制结束；对话通常2至3轮，只问缺少的基础项，不追问无关案例细节。
- 不再用固定结束话术覆盖AI回复，保留正常澄清与回答选项。生成口令在基础未确认时引导确认，不直接跳过。已有大纲/已开课内容继续保留。
- 181项测试及构建通过，新增基础字段确认检查并更新过早收敛回归。未进行真实AI及浏览器实测。发布时源码同步遇到DNS问题，最终发布状态以工具结果为准。

## 2026-10-26：固定对话区域与多组课程资料检索
- 桌面对话面板根据右侧需求面板的实际高度对齐，消息区内部滚动，输入区留在面板底部；阅读旧消息时不强制跳到最新。手机端固定有界高度，改为单列，不随消息数增长。
- 原流程用一个「主题+全部课时标题+免费教材教程」长查询、只取前5条且不控制语言。新course-search-plan提示词先生成2至4组短检索词，覆盖中文关键词、英文准确术语、大学公开课/开放教材/研究机构/具体讲解，不强制免费或单一网站。
- 新课程检索路由仍使用DeepSeek Search，全网多查询合并、去重、参考检索相关度与机构来源排序，最多保留8条；默认优先中文并补充英文，过滤未主动选择的日语/韩语结果，可切换不限语言。不是接入多个搜索引擎，也不是保证所有结果已核实。
- 旧课程搜索缓存会重新查找；支持「扩大范围重新查找」换同义关键词并避开前次查询，保留已备课时。搜索方案、每组返回数量与错误、来源语言及逐个网页读取状态可查看并本机保存。
- 网页读取尝试前6个来源，记录HTTP错误、过短正文、读取失败等原因；PDF无法读取时提示导入图书馆。放宽最短可读片段阈值，不等同授课就绪，仍由内容充分性检查决定是否生成。不会将搜索成功当作正文读取成功。
- 最近诊断日志：2026-10-26 21:37:05（Asia/Taipei），POST /api/material-ai，502，13.279秒，Worker outcome=ok，requestId=2a379e89d11f22628cc0d70d2e9e3e6f。该日志不含模型正文，无法仅凭状态码确认是否与截图同一请求。
- 187项测试及构建通过，覆盖多查询、语言过滤、部分失败、全失败区分、来源读取诊断、缓存清理等。未调用用户付费密钥验证真实检索质量，未完成浏览器视觉检查。
- 官方搜索参数参考：https://api-docs.deepseek.com/api/search/ 。


2026-10-26 网页正文恢复：同URL搜索content备用读取（不接受summary/snippet或其他URL），401/402/403不重试，失败来源显示具体原因。192项自动检查；真实用户API与现场页面未实测。


2026-10-26 模型错误诊断：将模型生成的非成功HTTP响应保留为脱敏错误详情；运行日志仅记录固定错误分类、参数名称、状态及阶段。临时429/5xx最多自动重试一次，较长Retry-After不立即重试。196项检查通过，构建通过。原线上错误细节已被旧版本丢弃，尚不能确认现场故障根因；不把模拟测试当成用户API实测。


2026-10-26 JSON提示词契约修复：用户提供真实HTTP400，提示Prompt must contain the word json。统一在所有json_object请求的system与末尾user消息添加独立小写json指令，涵盖16种结构化动作和格式修复；3种文字输出保持text模式。新增严格前置条件模拟检查修正前17项失败、修正后通过。216项测试和构建通过。未使用用户密钥重放真实生成。


2026-10-27 公开资料优先与非阻塞备课：模拟不可读图书、仅目录/付费入口、公开替代正文、搜索无结果、账户错误、依据标注、课程创建与存档恢复；不以摘要冒充教材正文。219项测试与构建通过。未使用真实用户API密钥；本轮环境无浏览器控制工具，未实测界面与真实搜索质量。


2026-10-27 阅读课堂/续学验收：安全Markdown渲染、长段落拆分不丢字、跨段与加粗文字的持久标注、评论与划线渲染、改写重定位/保留孤立标注、三个环节断点恢复、全环节自动且仅一次完成记录、主动跳过、知识掌握独立、下一单元追加与幂等、旧笔记保留、资源卡折叠及语言入口移除。230项自动检查和构建；本轮无可用浏览器控制工具，未实测鼠标/触屏选字、实际布局或真实AI续学质量。


2026-10-27 标注删除与教案口吻：选区匹配、按ID删除、其他字段/评论保留、JSON刷新保留删除结果、撤销原顺序/ID且不覆盖新评论/标注、侧栏删除入口、未来生成提示约束与旧内容不变。234项测试和构建通过；未实测浏览器选字或真实AI生成口吻。


2026-10-27 PDF批量重做与进度：整本章节任务、相同课程同步、旧学习记录保留、暂停/JSON恢复断点、失败章保留旧版且其他章继续、单章不改变他章、章节历史恢复、附加资料失败仍发布有效正文、只重试缺失内容、账户错误暂停、未确认页码单独标识；全站并发请求状态清理、失败清理、数值耗时采样且不保存内容/密钥、可读时间范围。245项测试及构建通过；未使用真实用户PDF和付费密钥跑全书，未完成浏览器交互实测。
## PDF 章节新版小课试读

- 新增 11 项检查：原文分片、可变课数、无效来源/漏片拒绝、正文段落依据与题目反馈、存档后续备、暂停、同课程独立单元、重复确认幂等、旧记录保留、统一阅读课堂标注与三环节完成、两类课时共用教学提示、PDF 请求无在线正文门槛。
- 全部 256 项检查（37 个文件）通过。TypeScript/Vite/Worker 构建通过；Worker 内联共用提示词，部署包不依赖未打包的服务器模块。
- 验证使用测试原文与模拟模型响应。未操作用户本地 PDF、未使用用户 API 密钥进行付费生成；未进行真实浏览器交互验证。

## PDF 完整课程与资料层级、统一标注

- 264 项检查（38 个文件）通过。新增覆盖整本大纲、沿用单章、待备课课时ID保持、断点恢复、长章分部大纲且不漏片段、局部新版归档且其他章节不变、原书分析退出课堂推荐、跨入口标注与JSON导出、删除撤销保留评论、课堂和资源讲解共享标注、折叠路线。
- 旧章节分析、原笔记、课堂记录与历史标注保留。原书分析不进入新课程推荐；旧排课和已存档的足迹保留。
- TypeScript/Vite/Worker 构建与发布包模拟请求通过。无可用浏览器控制环境，未实测鼠标/触屏选字与真实布局；未使用用户的PDF和密钥进行整本付费生成。
## 片段关联与站内后台任务修正

- 276项检查（40个文件）通过；新增覆盖错误/遗漏来源组定点修复、JSON恢复仅补缺组、16章中14章完全沿用、畸形教学内容仍拒绝、页面订阅取消不终止任务、重复启动幂等、显式暂停/失败状态、真实本机存档检查点模拟、保留最新阅读位置和其他分析、运行时删除保护、跨标签页锁拒绝重复、原课程删除不重建。
- TypeScript/Vite/Worker构建及部署包模拟AI路由检查通过。验证使用模拟模型和测试原文，没有使用用户PDF或付费密钥；未实测浏览器标签页切换、Web Locks或选字交互。
- 后台范围为站内页面切换及标签页切换，网站继续打开。未提供关闭网站后的云端任务。

## PDF课时校验冲突与保留式补修

- 286项检查（41个文件）通过；新增测试覆盖较长PDF正文、二选项题、程序绑定输入范围、普通材料仍严格校验、失败字段补修、保留响应并在重载后仅补修、拒绝补修改写有效正文、无效答案和存档引用仍拒绝、字段级JSON修复接口、空响应诊断、70/93只请求剩余23课、按章节返回具体失败字段。
- TypeScript/Vite/Worker构建及发布包模拟路由检查通过。未使用用户的PDF/API实跑，无法从截图确定其每一课的具体失败字段；新版将保存字段诊断。没有可用浏览器交互工具，未实测浮层实际排版与选字。
# PDF continuation diagnostics · 2026-10-27.38

- Reported production failures are not yet reproduced against the user's local PDF/API key. HTTP 200 gateway logs alone do not establish client acceptance. No claim is made that every failing chapter is repaired.
- Shared browser/gateway contract rejects obsolete PDF clients before a provider call. A free uncached release endpoint and visible preparation release distinguish loaded builds. Do not reload active tasks automatically.
- New runs persist release, timestamp, phase, exact lesson and failed field paths. Course attachment errors are distinct from generation; completed lessons remain cached. Untagged old errors remain available as historical records.
- All analysis validators now report the actual failed field rather than one generic message. Original-text bounds and exact quotation checks are unchanged.
- Same-origin diagnostic logs contain only run ID, release, phase, code, lesson number and whitelisted field paths. They exclude response bodies, PDF text, titles and keys. Diagnostic failure cannot replace the original failure.
- 292 tests in 42 files pass; TypeScript, Vite and Worker build pass. Packaged Worker static page, current PDF contract and release endpoint pass using simulated provider output. Browser interaction and real provider/PDF acceptance remain unverified.

# PDF source alignment · 2026-10-27.39

- The reported 91/93 checkpoint now identifies a genuine source refusal: the planned forced-internship lesson was assigned pages about graduate agreements and part-time work. This release addresses the outline/source mismatch rather than bypassing the refusal.
- New outlines read each full source group, checkpointed separately, instead of only its first 500 characters plus a generated chapter summary. The full previous lesson specification is passed without the former 400-character truncation.
- A cached `usable:false` response triggers one bounded, source-scoped lesson realignment before a new lesson request. The new plan must include verbatim evidence found in the same input. Source IDs, completed lessons, chapter/course IDs and learning records are retained. Prior and revised plans remain inspectable in the chapter list. Unreadable/insufficient source still fails honestly.
- Regression tests cover the complete 16-chapter, 91-of-93 saved task: one realignment and two lesson requests finish a simulated checkpoint while preserving existing IDs, notes and the complete saved lesson prefix. Additional checks cover quote fabrication, paused realignment, bounded repeated refusal, full text beyond position 500 and JSON escape size limits.
- 301 tests in 44 files, TypeScript/Vite/Worker build and packaged Worker route checks pass. The user's actual PDF/provider outcome remains to be confirmed after refresh and continuation.

# Quiz feedback and chapter folding · 2026-10-27.40

- Selected incorrect choices and their feedback use muted red; selected correct choices and feedback use green. Unselected options remain neutral. The saved answer and correctness rules are unchanged.
- Syllabus chapters default to collapsed lesson lists. Each header has an accessible expand/collapse control, lesson count and its existing editing actions. Bulk expand/collapse and a browser-local display preference retain the chosen expansion state. Course contents and learning progress are unchanged.
- Existing reading, course-management and course-organization checks pass (27 tests); TypeScript and production Worker build pass. No new tests were added for this reversible presentation change. Browser interaction and visual layout were not exercised in this environment.

# Fixed campus collection · 2026-10-27.41

- Generated all 36 separate pixel sprites using the built-in image_gen tool. Inspected every delivered image, confirmed genuine transparency, and saved both complete full-resolution originals in the workspace and 256 × 256 website PNGs. Exact prompts and the asset manifest are documented in `artwork/rewards/`.
- Added the collection tab in the museum, six category groups, collected/uncollected filters, explicit locked labels, chapter-choice redemption, source snapshots, and a collected-object shelf. No runtime image-generation API is used.
- Chapter completion and existing completed chapters earn one choice each. PDF chapter source IDs survive course regeneration. Repeat claims are rejected; additional copies become available after the complete collection is unlocked. Quiz correctness is independent of eligibility.
- Build mode supports actual earned sprites, owned versus placed quantities, move/return/undo behavior and a direct collection entry. Sprite-cache invalidation waits for image loading. Course deletion respects retained learning records and removes only rewards associated with explicitly discarded records.
- Full suite: 313 tests in 45 files passed. Targeted reward suite passes after final delivery-format changes. Production TypeScript/Vite/Worker build passes with 43 embedded assets, including all 36 sprites. The packaged Worker returns every sprite with the expected PNG content type and verifies release 2026-10-27.41.
- Browser tools were unavailable, so browser interaction and in-browser canvas appearance were not exercised. No user PDF, API key, original course content or reading marks were cleared.

# Campus building and additional spaces · 2026-10-27.42

- Rebuilt the building roof geometry with matching wall gables, a continuous foundation and clipped window openings. Removed the misaligned dormer treatment. Both roof slopes have consistent geometry and tile courses; individual building and full-campus previews were inspected.
- Hit testing follows visible sprite pixels, using cached alpha masks instead of oversized invisible rectangles. Sprite bounds include taller architecture. Object previews fit the visible object; tree appearance is stable across movement.
- Build mode now starts in selection mode, supports anchored object dragging, complete placement previews and explicit collision feedback, cursor-centred wheel/pinch zoom, keyboard adjustments, cancel, undo and redo. Paving/rugs can coexist with solid furniture. Base ground painting replaces prior base ground without deleting the furniture above it. Labels retain their navigation hit targets.
- Added independently saved library reading room, creative studio, woodland garden and lakeside courtyard. Existing campus objects remain in their original archive field and are not reset. New rooms use additive initial layouts; empty edited rooms remain empty. Pond and indoor-building restrictions are enforced.
- Collectible quantities include all spaces. Returning an item releases its copy for another scene. History restoration rejects ownership conflicts atomically, and deleting discarded course rewards also updates additional spaces.
- Final full suite: 331 checks in 46 files passed. TypeScript/Vite/Worker build passed. Native Canvas rendered all five scenes from the actual production drawing code and verified opaque-pixel hit targets. The packaged Worker served the campus, reward sprites and release 42 successfully.
- Browser tooling was unavailable. Native Canvas image inspection and logic tests do not substitute for a real mouse/touch browser session; that interaction remains unverified. Existing courses, PDF content, annotations, achievements and the original campus layout were preserved.
