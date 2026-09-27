# SimpleZH

简繁中文转换工作台 MVP。当前版本支持纯文本输入、简体/繁体/台湾正体/香港繁体转换、基础格式保护、自定义词汇表、复制和 TXT 下载。

## 本地开发

环境要求：Node.js 20+、pnpm 9+

```bash
pnpm install
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## 常用命令

```bash
pnpm lint
pnpm build
pnpm start
```

## 当前实现

- `opencc-js` 在浏览器端执行确定性简繁转换。
- 支持简体、台湾正体、香港繁体之间的主要转换路径。
- 转换前保护 Markdown 代码块、行内代码、HTML 标签和 URL。
- 支持工作区词汇表，词条会覆盖默认转换结果。
- 支持 `Ctrl/Cmd + Enter` 开始转换。
- 转换结果支持复制和 TXT 下载。

当前词汇表和编辑内容只保存在页面内存中，登录、历史记录、额度和数据库属于后续 SaaS 阶段。

## 文档

- [MVP 产品规格](docs/mvp-prd.md)
