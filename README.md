# World Clock Desk

World Clock Desk 是一个面向跨国沟通与会议安排的 Windows/macOS 桌面世界时钟。

## 功能

- 同时显示本地时间和 5 个主要城市时间
- 支持全球主要城市搜索、替换和排序
- 自动处理夏令时与跨日期换算
- 选择未来日期和会议时间，查看各城市工作时间重合情况
- 紧凑/展开卡片模式、窗口置顶和系统托盘
- 可选开机启动，默认关闭

## 本地运行

需要 Node.js 20 或更高版本。

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
npm run pack:win
```

生成的 Windows 安装包位于 `packages/`，安装包请通过 GitHub Releases 发布，不要直接提交到源码仓库。

## 验证

```bash
npm run test:timezone
```

当前稳定版本：`1.1.0`。

## 技术栈

React、Vite、Electron。

## 说明

当前仓库目录是稳定 Electron 产品线。早期 Lite/Tauri 实验文件未包含在这份 GitHub 上传包中，避免与稳定版混淆。
