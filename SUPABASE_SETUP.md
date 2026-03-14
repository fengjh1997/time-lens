# Time Lens (星辰透镜) - Supabase 接入指南 (Supabase Setup Guide)

为了实现多端数据同步，我们需要使用 [Supabase](https://supabase.com/) 作为后端。请按照以下步骤操作，并将生成的密钥告诉我。

## 第一步：注册并创建项目
1. 访问 [supabase.com](https://supabase.com/) 并使用 GitHub 账号登录。
2. 点击 **"New Project"**。
3. 输入项目名称（如 `time-lens-db`），设置一个强密码。
4. 选择离你最近的服务器地区（如 `Southeast Asia (Singapore)` 或 `East Asia (Tokyo)`）。
5. 点击 **"Create new project"**，等待项目初始化完成（约 1-2 分钟）。

## 第二步：获取 API 密钥
1. 在左侧菜单栏点击 **"Project Settings"** (齿轮图标)。
2. 点击 **"API"**。
3. 在页面中找到以下两个值：
   - **Project URL** (例如 `https://xyz.supabase.co`)
   - **Anon Key** (例如 `eyJhbGciOiJIUzI1...`)
4. **复制并将这两个值发送给我。**

## 第三步：初始化数据库 (由我操作)
当你把 URL 和 Key 发送给我后，我将：
1. 配置本地环境变量。
2. 创建必要的数据表（`profiles`, `blocks`, `settings`）。
3. 编写同步逻辑。

---
*注：Supabase 的免费层级（Free Tier）对于个人使用完全足够，您无需担心费用问题。*

记住：
Project name：time-lens-db
Database password：mrAc1kZEYKSWhPgs

Project URL：https://lqhducctmzsfwkmmyugq.supabase.co
Anon Key（我不知道复制对没有）：
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxaGR1Y2N0bXpzZndrbW15dWdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0ODA2MDYsImV4cCI6MjA4OTA1NjYwNn0.2O24XCHLEez39CXXEeNfJwHp4iaDjixYnyCA2jIbqdM