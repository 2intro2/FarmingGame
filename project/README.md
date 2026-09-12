# FarmingGame · 开发说明

[返回项目首页](../README.md)

这里是微信小游戏的实际工程目录。项目定位、美术素材与功能进度见首页；本文介绍导入方式、代码组织和继续开发时需要了解的实现边界。

## 环境与导入

| 项目 | 当前配置 |
| --- | --- |
| 开发工具 | 微信开发者工具 |
| 项目类型 | 小游戏，`compileType: game` |
| 屏幕方向 | 横屏，`deviceOrientation: landscape` |
| 配置中的基础库版本 | 3.9.0，以 `project.config.json` 为准 |
| 渲染与语言 | Canvas 2D、JavaScript ES6+ |
| 页面与状态 | 自定义 PageManager、DataBus、TinyEmitter |

1. 导入本目录 `project/`，而非仓库根目录。
2. 在开发者工具中配置有权限使用的小游戏 AppID，并核对基础库设置。
3. 默认启动页为登录页；登录成功后的代码路径进入首页，再进入农具导航。
4. 登录行为受平台能力和授权结果影响。当前 `callBackendAPI` 使用模拟数据，不会完成真实后端会话校验。

仓库没有 `package.json`，无须照搬 Web 工程的 `npm install` / `npm start` 流程。已有 `.eslintrc.js` 是规则配置，不代表已安装检查工具或检查已经通过。

## 页面与源码入口

| 页面键 | 文件 | 职责 |
| --- | --- | --- |
| `login` | [LoginPage.js](js/pages/LoginPage.js) | 登录入口、用户信息存储、登录后跳转 |
| `home` | [HomePage.js](js/pages/HomePage.js) | 农具入口、音乐开关、退出登录等交互 |
| `toolAssemblyNav` | [ToolAssemblyNavPage.js](js/pages/ToolAssemblyNavPage.js) | 卡片滑动、锁定状态与农具选择 |
| `toolAssembly` | [ToolAssemblyPage.js](js/pages/ToolAssemblyPage.js) | 农具展示与相关页面逻辑 |
| `threeDAssembly` | [ThreeDAssemblyPage.js](js/pages/ThreeDAssemblyPage.js) | 部件拖拽、目标区匹配、拼装提交与重置 |

页面在 [PageManager.js](js/pages/PageManager.js) 中统一实例化。当前曲辕犁卡片的 `handleCardClick` 尚未接入拼装页跳转，不能按“点击卡片即可开始拼装”描述现有流程。

## 数据与交互

```mermaid
flowchart LR
    A[WechatAPI 接收触摸] --> B[PageManager 转发]
    B --> C[当前页面处理交互]
    C --> D[更新页面状态 / DataBus]
    D --> E[Main 下一帧绘制]
```

- [main.js](js/main.js)：创建全局实例，组织 `requestAnimationFrame` 游戏循环。每次启动默认进入登录页，即使已有登录缓存。
- [databus.js](js/databus.js)：管理用户、模块、任务计数、通知和背景音乐；部分计数为初始示例值。
- [wechat.js](js/utils/wechat.js)：封装触摸、登录、用户资料、本地存储、音频等平台调用；`callBackendAPI` 为模拟实现。
- [ThreeDAssemblyPage.js](js/pages/ThreeDAssemblyPage.js)：维护部件、拖拽位置、目标多边形与完成集合；提交时检查全部部件是否完成。
- [constants.js](config/constants.js)：集中定义部分游戏、页面、存储和事件常量；页面内也有独立参数，不能把该文件当成所有布局的唯一配置入口。

## 目录导航

```text
project/
├── game.js                   # 实例化 Main
├── game.json                 # 小游戏运行配置
├── project.config.json       # 开发者工具项目配置
├── config/                   # 常量定义
├── images/                   # UI 与农具素材
├── audio/                    # 音频素材
└── js/
    ├── base/                 # 精灵、对象池与动画基础类
    ├── components/           # 通用组件
    ├── data/                 # 农具数据
    ├── game/                 # 场景、实体与系统相关代码
    ├── libs/                 # TinyEmitter
    ├── pages/                # 页面与页面管理器
    ├── utils/                # 平台封装与工具
    ├── databus.js            # 数据总线
    ├── main.js               # 主循环
    └── render.js             # Canvas 与屏幕参数
```

## 当前边界

- 拼装页的“立体”效果来自二维美术素材，并非 Three.js 或其他 3D 引擎。
- 真实登录后端、进度服务和完整任务结算尚未接入；本地状态和模拟接口不能视为云端存档。
- 农具卡片跳转、锁定模块、奖杯和用户信息入口仍有待完成部分，具体状态见[项目首页](../README.md#当前进度)。
- 本文仅依据源码和配置整理，没有执行构建、小游戏编译或真机验证。

## 许可证

本项目采用MIT许可证。

以上为原 README 的许可声明，本次保留原文；仓库当前未附独立 LICENSE 文件。图片等资源的使用范围请向项目维护者确认。
