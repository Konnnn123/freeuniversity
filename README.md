# 自由大学 · Free University

一个按自己的节奏学习的像素校园。把好奇的问题或整本 PDF 整理成课程，在阅读中划线和评论，完成章节后领取收藏，布置自己的学习空间。

[访问 Netlify 网站](https://free-university.netlify.app/) · [原 Sites 地址](https://free-university-cozy-campus.z16357959.chatgpt.site/)

本次源码对应网站版本 **2026-11-25.69**，网站访问权限沿用现有设置。

本版按材料类型、学习目标和阅读深度设计适量课程：论文标准阅读最多5课，不按读取分片扩张课时。先预览大纲，再准备讲解、对应原文与中文译文，最后采用；课堂可按教学小节显示真实原文及已保存译文，阅读时不重复调用翻译。旧课程可重新设计精简版，采用后旧笔记、答案和学习记录保留。

本次修复多来源课时因候选原文过长而循环重写大纲的问题：保留已确定课题，备课时分批选择对应的真实原文段，再准备讲解与双语内容。每批选择保存，续备复用已完成部分；原文编号、课时总量与实际输入长度分别核对。

此前已修复互动练习反复补修失败：区分新课与字段补修格式，兼容明确的返回形式差异，保存具体缺失字段与原始练习详情；已备讲解和课时继续沿用。

现有功能：

- 图书馆可删除原文件或整份资料，已有课堂、笔记与学习记录保留。
- 课程的「原书与参考资料」可关联/批量导入多份 PDF、Markdown、TXT；各自分析，再按主题组织新单元。先预览主题大纲，再准备课时，失败可继续。
- 课堂支持排序、分类、配对、原文依据选择与开放回答；旧课可追加练习，原有题目和回答保留。
- 讲解环节可查看、放大真实 PDF 图页，框选图表留在课堂；可选图像解读需单独配置 OpenAI 连接并点击发送，密钥仅在网页内存。


## 主要功能

- **课表**：按课程与章节折叠找内容，每章默认预览 3 节课时；可拖放排课，按课程 / 章节顺序生成建议，并保留已有安排。
- **课程**：与 AI 讨论目标并生成单元；整本 PDF 按真实章节生成完整大纲和课时，支持继续备课、局部调整与后续单元。
- **图书馆**：导入 PDF、识别并确认书内目录和实际页码、阅读原书、查看章节分析，收藏网页与教材。没有电子书签时，可创建学习分段或按页码范围备课。
- **阅读**：问题、讲解、情境练习三个环节；支持高亮、划线、评论、删除与撤销，完成课时与掌握知识分别记录。
- **成果馆**：学习足迹、像素成果展览和 36 件固定收藏图鉴。
- **校园与建造**：校园全景、图书馆阅读室、创作工作室、林间花园、湖畔庭院。独立保存布置，共享收藏数量，支持拖放、缩放、撤销与重做。
- **像素小手册**：顶部「使用手册」随时查阅，也可打开 `/#/handbook`。

地图保留建筑原有名称，功能入口通往课表、课程、图书馆和成果馆。备课、课时编辑和语言探索归入课程，旧链接保留兼容跳转。

## 本地运行

推荐 Node.js 24 和 npm。

```sh
git clone https://github.com/Konnnn123/freeuniversity.git
cd freeuniversity
npm ci
npm run dev
```

打开终端输出的本地地址。开发与预览服务包含同源 `/api/` 网关。

```sh
npm test          # 自动检查
npm run build    # TypeScript、Vite 与 Worker 构建
npm run preview  # 预览构建产物
```

AI 功能在页面顶部「AI 设置」配置自己的 DeepSeek API Key。阅读已有内容、标注、排课与布置不需要重新调用 AI；聊天、生成和检索可能产生 API 费用。

## 保存与备份

数据保存在当前浏览器，没有自动跨设备同步。

| 内容 | 备份方式 |
| --- | --- |
| 课程、标注、学习记录、收藏、场景布局 | 设置 → 导出 JSON 存档 |
| 每本书的目录、分析、备课进度 | 原书页 → 导出目录与分析进度 |
| 原 PDF 文件 | 原书页 → 下载原始 PDF，或保留自己的原文件 |

API Key 单独保存在当前浏览器，不包含在学习存档中。PDF 在本地解析；发起 AI 请求时，备课所需的文字片段会发送给 AI 服务。

整本 PDF 完整课程备课可在网站仍开着时切换站内页面或标签页继续。关闭、刷新或设备休眠可能中断，回来后从已保存进度继续。

## 项目结构

```text
src/
  App.tsx                 应用框架与路由
  siteNavigation.ts       核心导航与旧链接归属
  Courses.tsx             课程与大纲
  CoursePlanner.tsx       对话开课与续学
  ReadingClassroom.tsx    阅读、标注与课时进度
  Books.tsx               PDF 书架与原书阅读
  BookCoursePanel.tsx     整本课程大纲与备课
  Library.tsx             资料管理
  Timetable.tsx           课表
  Museum.tsx              学习足迹与成果
  RewardCollection.tsx    收藏图鉴
  CampusScene.tsx         地图与建造
  ScenePicker.tsx         场景卡片
  Handbook.tsx            使用手册
server/                   AI、检索与本地网关
public/rewards/           36 件固定像素收藏图片
scripts/build-worker.mjs  生产 Worker 打包
tests/                    自动检查
```

界面使用 React、TypeScript、Vite；学习存档使用 Zustand 与 IndexedDB / Dexie；校园使用 Canvas 绘制。

## 部署

`npm run build` 生成页面、资源，以及包含同源 API 网关的 `dist/server/index.js` Worker 入口。

Netlify：连接本仓库后，由 netlify.toml 指定 npm run build:netlify，发布 dist，并部署 netlify/functions/learning.mjs。该函数把 /api/app-info、/api/material-ai、/api/material-search 和 /api/learning-diagnostic 交给共享后端。只拖入 dist 不会部署这些接口。无需把个人 API Key 写入环境变量，继续使用站内全站 AI 设置。

部署后检查 https://free-university.netlify.app/api/app-info 应为当前版本 JSON；不带密钥请求生成接口应返回 401 JSON，不应是网页 404。Functions 单次执行受平台上限约束，网关在 52 秒内主动结束超时请求，已保存步骤可继续；不会通过心跳绕过执行上限。参考 [Netlify 官方配置说明](https://docs.netlify.com/build/functions/configuration/)。

Sites / Worker：保留 npm run build 与 dist/server/index.js。仅部署静态文件到 GitHub Pages 不会自动获得 AI API 网关。不同域名的本机学习存档不会自动互通，请继续使用已有资料所在的网址。

## 更新与验证

- [验证记录](VERIFICATION.md)
- [历史说明](README-HISTORY.md)

历史文档包含旧功能与旧限制，当前入口和行为以本说明及站内手册为准。
