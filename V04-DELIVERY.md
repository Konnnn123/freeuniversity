# 自由大学 V0.4 · 多媒体语言探索工作室

本次沿用原项目、IndexedDB 名称及校园素材；旧的 7 门课程 / 21 节课时没有删除或重置。

## 已实现

- 日语、英语共用 Explore / Collection / Notebook / Paths / History，独立语言偏好与档案。
- 15 份初始素材：12 个外部来源元数据 + 2 篇原创微小说 + 1 张原创海报。外部原文、音视频、歌词不抓取或复制。
- 媒介、主题、难度、创作者文字与兴趣筛选；URL、TXT、粘贴文本、PNG/JPEG/WebP/GIF 图片导入；多课程关联、收藏、收起/恢复。
- 文本按段阅读、手动书签、选文高亮与注释、表达及上下文收藏；用户自写译文对照；图像点位注释。
- 音乐/音频/视频原站入口，手动时间点、时间点表达与笔记；无自动进度同步。
- 可折叠左右栏与纯阅读模式；手机工具抽屉；自动保存笔记与工具草稿。
- 自选复习、文化知识卡、多媒体主题收藏夹、可编辑带依据的知识关系（列表视图，可跨语言）。
- 探索可中断与继续；保存足迹是可选操作，无强制练习。保存后出现在成果馆，同一会话再次保存更新同一记录，不会自动掌握知识点。
- 课表关联具体素材/文化主题、自由探索或个人项目；自动排课可选已收藏或待继续素材；旧语言课时需主动勾选进入任务池，旧安排继续有效。
- 图书馆与素材双向入口；原有语言路线与课时编辑仍保留，其他五门课程继续使用结构化课时。

## 数据变化

新增 LanguageProfile、MediaResource、MediaCollection、ExplorationSession、TextAnnotation、SavedExpression、CulturalTopic、KnowledgeConnection；ScheduleEntry 增加可选 exploration / visited，StudyLog 增加可选 explorationSessionId。使用一份 IndexedDB 快照原子保存，未更换数据库。

首次升级先保留 backup-before-v04；迁移幂等，旧课程、大纲、活动、课时、笔记、资源、排课和建筑均保留。收起素材不删除任何笔记或关联。原数据库不是联网数据库，发布更新本身不会读写用户浏览器存档；打开新版时才进行本地迁移。

## 来源核实（2026-10-24）

|来源|类别|链接|
|---|---|---|
|青空文库《やまなし》|具体作品|https://www.aozora.gr.jp/cards/000081/files/472_42317.html|
|青空文库《注文の多い料理店》|具体作品|https://www.aozora.gr.jp/cards/000081/files/43754_17659.html|
|ヨルシカ官方|栏目入口|https://www.universal-music.co.jp/yorushika/|
|エリン第17課応用スキット|具体视频|https://www.erin.jpf.go.jp/jp/lesson/17/advanced/|
|いろどり初中級第1課|具体音轨集|https://www.irodori.jpf.go.jp/pre-intermediate/audio/lesson01.html|
|マンガで覚えるオノマトペ|栏目入口|https://www.erin.jpf.go.jp/jp/section/onomatopoeia/|
|Susan Cain / TED|具体视频|https://www.ted.com/talks/susan_cain_the_power_of_introverts|
|Alice / Project Gutenberg|具体作品|https://www.gutenberg.org/cache/epub/11/pg11-images.html|
|99% Invisible #685|具体播客|https://99percentinvisible.org/episode/685-tootle-of-a-devilish-song/|
|Design Museum / Penguin Books|具体文章|https://designmuseum.org/penguin-books|
|Coldplay Yellow 官方 MV|具体音乐视频|https://www.youtube.com/watch?v=yKNxeF4KMsY|
|Coldplay Music|栏目入口|https://www.coldplay.com/music/|

共 9 个具体作品、3 个栏目入口。核实的是网页内容身份与地址，未测试地区限制、登录要求变化或实际媒体播放；不保证未来持续可用。所有用户导入 URL 默认待核实。青空文库与 Gutenberg 的原站版权提示仍适用，应用不把外链等同于全球可复制许可。

## 验证与边界

已运行 TypeScript、Vite 生产构建及 Vitest（详见 VERIFICATION.md）。测试覆盖数据迁移、旧课时路线、各新页面服务端渲染、书签与表达往返、探索记录入成果馆、时间点与跨素材联系、周三排课/移动与刷新、自动排课、JSON 校验及真实 IndexedDB API 模拟存取。

浏览器自动化此前访问本地预览被安全策略阻止；不以其他自动化方式绕过。未将服务端渲染测试当作实际鼠标/触屏验收，真实选文、响应式布局与外部播放器需继续人工检查。

未实现：AI 解释/翻译/推荐、自动字幕与口语分析、自动联网抓取、播放器自动同步、复杂图谱画布、跨设备同步、间隔复习算法。知识联系采用可编辑列表，复习是主动翻卡。外部文学保留原站入口；内置阅读器可直接体验原创短篇或导入有权保存的文本。
