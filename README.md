# Time Lens

Time Lens 是一个以日视图、周视图为核心的时间与能量记录 PWA。
它不把你当作任务清单执行器，而是帮助你记录每个时间块的专注质量、节奏状态和感悟沉淀。

当前版本：`v6.8.0`

## 产品定位

Time Lens 的主操作面已经收敛为两个核心画布：

- `日视图`：面向单日复盘、补录、充能和编辑
- `周视图`：面向一周编排、节奏观察和横向比较

月度与年度仍然保留，但不再充当独立“中枢系统”，而是作为全景信息嵌入到周/日视图中，为决策服务。

## 当前设计原则

- 周视图和日视图是第一入口
- 全景信息要尽量嵌入操作页，而不是把用户赶去额外页面
- 本地即时可用优先于云端同步
- 云同步的目标是减少覆盖冲突，而不是制造冲突
- 移动端交互质量是核心要求，不是附属优化

## 主要功能

- 日时间轴记录：支持标签、感悟、评分、Bonus 时段
- 周网格规划：支持跨天扫描、快速补录和块级移动
- 长按充能：快速完成能量评分
- 拖拽手柄：移动时间块时不再与长按冲突
- 单击详情编辑：标签和感悟改成按需填写，不再强制弹出
- 主题颜色系统：支持主题色切换并同步到云端
- 离线优先存储：本地持久化，按需连接 Supabase 同步

## v6.8.0 重点变化

- 去掉“必须有侧边栏”的旧结构，改为顶部导航 + 主画布
- 把月度、年度摘要整合进周/日页面
- 明确区分 `单击 / 长按 / 拖拽` 三种手势
- 长按充能改为图标反馈，不再显示丑的汉字提示
- 不再默认填充感悟文案
- 日视图里感悟文本层级压低，不再高于标签信息
- 标签颜色和设置同步改为统一通道，并加入时间戳合并策略

## 技术栈

- `Next.js 16`
- `React 19`
- `TypeScript`
- `Zustand`
- `Framer Motion`
- `Supabase`
- `next-pwa`

## 本地开发

1. 安装依赖：`npm install`
2. 启动开发环境：`npm run dev`
3. 运行 Lint：`npm run lint`
4. 类型检查：`npx tsc --noEmit`

## 云同步说明

Time Lens 采用离线优先模型。
本地状态负责即时交互，云端同步作为增强层存在。

如果你希望完整同步以下内容：

- 标签颜色
- 周视图细节显示设置
- 日/周能量目标

请升级 Supabase `settings` 表字段，新增：

- `show_details_in_week_view`
- `daily_energy_goal`
- `weekly_energy_goal`
- `tags_json`

基础结构见 [supabase_schema.sql](/G:/vibe-coding/time-lens/supabase_schema.sql)。
可直接执行的增量迁移见 [supabase_migrations/v6_8_0_settings_sync.sql](/G:/vibe-coding/time-lens/supabase_migrations/v6_8_0_settings_sync.sql)。

## 发布记录

详细版本历史见 [CHANGELOG.md](/G:/vibe-coding/time-lens/CHANGELOG.md)。
