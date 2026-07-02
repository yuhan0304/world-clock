<div align="center">
  <img src="build/icon.png" width="104" alt="World Clock Desk 图标" />
  <h1>World Clock Desk</h1>
  <p><strong>为跨国沟通而设计的桌面世界时钟与会议时间助手</strong></p>
  <p>Windows · macOS · React · Electron</p>

  ![Version](https://img.shields.io/badge/version-1.1.0-1473E6)
  ![Windows](https://img.shields.io/badge/Windows-validated-1473E6)
  ![macOS](https://img.shields.io/badge/macOS-build%20ready-7A869A)
</div>

## 为什么做这个项目

和海外客户沟通时，真正麻烦的往往不是查看某个城市现在几点，而是快速回答这些问题：

- 对方现在是否处于工作时间？
- 我选择的会议时间，在伦敦、纽约或悉尼分别是几点？
- 是否跨越了日期，甚至变成前一天或后一天？
- 哪个时间段能让最多参与者处于合理的工作时间？

World Clock Desk 把这些信息放进一张可自由拖动的桌面卡片里，不需要反复打开网页或手动计算时差。

<div align="center">
  <img src="docs/images/world-clock-desk.png" width="460" alt="World Clock Desk 主界面" />
</div>

## 核心功能

| 功能 | 说明 |
| --- | --- |
| 多城市时钟 | 同时显示本地时间和 5 个自选主要城市的日期与时间 |
| 全球主要城市 | 可搜索、替换和调整城市顺序，支持巴黎、慕尼黑等主要商务城市 |
| 准确时区换算 | 使用 IANA 时区规则，自动处理夏令时和跨日期变化 |
| 会议时间规划 | 选择未来日期和时间，同时查看每个城市对应的当地时间 |
| 工作时间重合 | 将各城市工作时间投射到 24 小时时间轴，突出适合会议的重合区间 |
| 一键复制 | 生成可直接发送给客户或同事的会议时间摘要 |
| 桌面卡片 | 支持紧凑/展开模式、自由拖动和窗口置顶 |
| 系统托盘 | 关闭窗口后停靠到托盘，可随时恢复或彻底退出 |
| 开机启动 | 用户可在安装版设置中主动开启，默认关闭 |

## 设计特点

- 商务极简风格，使用蓝白主色和清晰的信息层级。
- 核心城市时间始终保持可见，适合放在桌面一角长期使用。
- 会议规划和当前时间放在同一张卡片中，减少页面切换。
- 所有时间计算均在本地完成，不需要注册账号，也不依赖云端服务。

## 下载与安装

### Windows

1. 打开仓库的 [Releases](../../releases) 页面。
2. 下载 `World-Clock-Desk-Setup-1.1.0-x64.exe`。
3. 运行安装程序，可选择安装目录并创建桌面快捷方式。

当前经过验收的 Windows 安装包大小为 **101.57 MiB**。

### macOS

项目已经包含 DMG/ZIP 构建配置和 macOS 图标，但签名、公证以及 Intel/Apple Silicon 真机验收仍属于后续发布阶段。当前版本请优先在 Windows 上使用。

## 开发环境

建议使用：

- Node.js 20 或更高版本
- npm 10 或更高版本
- Windows 10/11，或用于 macOS 构建的 macOS 环境

安装依赖并启动开发预览：

```bash
npm install
npm run dev
```

构建网页资源并启动桌面预览：

```bash
npm run desktop:preview
```

## 构建安装包

Windows x64：

```bash
npm run pack:win
```

macOS DMG 和 ZIP：

```bash
npm run pack:mac
```

生成的文件位于 `packages/`。安装包应作为 GitHub Release 附件发布，不应直接提交到源码仓库。

## 测试

运行时区换算测试：

```bash
npm run test:timezone
```

1.1.0 稳定版已经完成：

- 12/12 组跨时区换算测试
- 20/20 次 Windows 连续启动测试
- 最终安装包额外 5/5 次启动抽检
- 上海、伦敦、纽约、加尔各答和悉尼的夏令时与跨日期场景验证

详细结果见 [阶段 3 验收报告](docs/PHASE-3-ACCEPTANCE.md)。

## 项目结构

```text
world-clock/
├─ build/             应用图标资源
├─ docs/              路线图、验收记录和项目图片
├─ electron/          Electron 主进程与安全桥接
├─ scripts/           时区与启动稳定性测试
├─ src/               React 界面和业务逻辑
├─ index.html
├─ package.json
└─ vite.config.mjs
```

这份仓库上传包只包含稳定 Electron 产品线。早期 Lite/Tauri 实验线已被排除，避免与正式版本混淆。

## 路线图

- [x] 桌面世界时钟与主要城市选择
- [x] 紧凑/展开卡片模式与偏好保存
- [x] 未来会议时间、工作时间重合与摘要复制
- [x] Windows 托盘、开机启动和稳定安装包
- [ ] macOS Intel/Apple Silicon 真机验证
- [ ] Windows 代码签名
- [ ] Apple 签名与公证

完整规划见 [项目路线图](docs/PROJECT-ROADMAP.md)。

## 隐私

World Clock Desk 不需要账号，不上传城市选择、会议时间或使用数据。偏好和时间计算保存在本地设备中。

## 版本

当前稳定版本：**1.1.0**  
稳定标签：`electron-v1.1.0-stable`

---

如果这个工具让跨国会议少了一点“到底是哪一天”的混乱，欢迎在 Issues 中提交建议或问题。
