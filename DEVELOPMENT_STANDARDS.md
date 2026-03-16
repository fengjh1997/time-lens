# Time Lens (星辰透镜) - 开发标准与技术准则 (Development Standards)

本文档系统性记录了项目主理人（USER）对项目的技术要求与开发准则。**后续任何开发者（AI 或人类）在接手项目时，必须严格遵守本文档所列条款。**

## 1. 版本管理策略 (Versioning Strategy)

项目采用语义化版本管理模式 (Semantic Versioning)，格式为 `vX.Y.Y`：
- **X (Major)**：重大架构性变更或产品方向彻底重置（如从 V5 到 V6）。
- **Y (Minor)**：新增核心功能或显著的 UI 迭代（如 V6.1.0 引入 Supabase）。
- **Z (Patch)**：Bug 修复、微小的 UI 调整或文档更新（如 V6.1.1 修复按钮对比度）。

### 推送机制 (Git Workflow)
- **强制本地备份**：**[MANDATORY]** 每次完成一个 Minor (Y) 或 Patch (Z) 版本的迭代后，必须执行 `git commit` 进行本地备份，并在 Commit Message 中注明版本号。
- **云端推送准入**：**[CRITICAL]** 严禁擅自执行 `git push`。将代码推送到 GitHub 前，必须在对话中向用户询问并获得明确同意。
- **版本演进**：AI 助手根据任务规模自动判断版本号增长。

### 3. 文档规范与历史保留
- **文档维护**：`WALKTHROUGH.md` (交付回顾)、`PRODUCT_PRD.md` (产品文档)、`CHANGELOG.md` (开发日志) 必须在根目录维护。
- **历史记录**：**严禁删除旧版本内容**。所有文档应按照版本号由新到旧（最新版本在最上方）进行增量更新。
- **交付回顾**：每次重大更新后，需将 `WALKTHROUGH.md` 置于根目录，并包含该版本的视觉效果（录屏/截图）及关键逻辑说明。

## 2. 部署与同步机制 (Deployment)

- **CI/CD**：项目通过 GitHub 仓库与 Vercel 自动集成。
- **发布流程**：`git push` 到 GitHub 后，Vercel 会自动触发生产环境构建。
- **公网地址**：[time-lens-one.vercel.app](https://time-lens-one.vercel.app)

## 3. 设计语言与系统 (Design System)

- **核心风格**：Super Round (极美圆角)。核心圆角参数通常为 `32px` 或以上。
- **动态主题色**：通过 CSS 全局变量 `--primary-color` 驱动。必须支持 琥珀 (Amber)、翡翠 (Emerald)、紫罗兰 (Violet)、蔚蓝 (Blue) 四种主题。
- **暗色模式控制**：必须由根元素的 `.dark` 类名控制，严禁依赖系统自动切换（除非用户明确开启）。对比度必须符合“高级感”审美，避免纯黑 (#000)，推荐深灰/深蓝调。
- **睡眠时段策略**：默认折叠 23:00-09:00。该时段在展开时应具有独特的视觉背景（如 `#sleep-hour-bg`）。

## 4. 后端与数据标准 (Backend & Data)

- **架构演进**：已确立从 `localStorage` 转向 **Supabase** 为核心后端，实现云端同步与用户注册。
- **隐私标准**：在云端化的同时，应保留导出 JSON 的本地备份能力。

## 5. 文档维护要求 (Documentation)

每一阶段开发完成后，必须同步更新以下文档：
1. **[PRODUCT_PRD.md](file:///g:/vibe-coding/time-lens/PRODUCT_PRD.md)**：更新产品功能定义与方向。
2. **[CHANGELOG.md](file:///g:/vibe-coding/time-lens/CHANGELOG.md)**：详细记录新增需求、迭代点与修复项。
3. **[DEVELOPMENT_STANDARDS.md](file:///g:/vibe-coding/time-lens/DEVELOPMENT_STANDARDS.md)**：本准则文档。

---
*版本更新日期：2026-03-14*
