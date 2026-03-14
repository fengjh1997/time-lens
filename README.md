This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Git 版本管理指南 (新手友好版)

虽然这个应用目前是离线本地运行，但使用 Git 可以帮你记录每一次大的改动，防止代码写乱。

### 1. 如何查看历史版本？
如果你想回到之前的版本，或者查看改了什么：
- **查看日志**：`git log --oneline` (这将显示所有提交的版本号和简介)
- **跳转到旧版本**：`git checkout [版本号]` (注意：这会把代码回退到那个时刻)
- **回到最新版**：`git checkout master`

### 2. 核心操作流程
每次你让 AI 完成一个大功能后，建议执行一次备份：
- `git add .` (把改动放入“暂存区”)
- `git commit -m "描述你改了什么"` (正式保存一个版本)

---

## 项目文档
- [产品需求文档 (PRD)](PRODUCT_PRD.md)
- [产品开发日志 (Changelog)](CHANGELOG.md)

## 部署与分享
本项目已针对 Vercel 进行优化。运行 `npx vercel` 即可一键部署到公网。
