 # 工作养生 App - iOS 离线版构建指南
 
 ## 项目简介
 
 工作养生 App 是一款帮助上班族保持健康的应用，提供定时活动提醒和饮水提醒功能。
 此版本为 **iOS 离线版**，所有资源打包在 IPA 内部，完全离线运行。
 
 ## 环境要求
 
 | 环境 | 版本 | 说明 |
 |------|------|------|
 | macOS | 13+ (Ventura) | 仅 macOS 可构建 iOS 应用 |
 | Xcode | 15+ | 从 Mac App Store 安装 |
 | iOS SDK | 16.0+ | 随 Xcode 自带 |
 | XcodeGen | 2.x | 安装: `brew install xcodegen` |
 
 ## 快速开始
 
 ### 1️⃣ 生成 Xcode 项目
 
 在你的 Mac 上操作：
 
 ```bash
 # 安装 XcodeGen（如果尚未安装）
 brew install xcodegen
 
 # 进入 iOS 项目目录
 cd 工作养生app/ios/
 
 # 生成 .xcodeproj
 xcodegen
 ```
 
 ### 2️⃣ 生成应用图标
 
 ```bash
 cd WorkWellness/www/icons
 python3 generate_icons.py --ios
 ```
 
 或在浏览器中打开 `generate-icons.html` 截图裁剪。
 
 ### 3️⃣ 在 Xcode 中打开
 
 ```bash
 open WorkWellness.xcodeproj
 ```
 
 ### 4️⃣ 配置签名
 
 1. 在 Xcode 中打开项目
 2. 选择 `WorkWellness` Target
 3. **Signing & Capabilities** 选项卡
 4. 选择你的 Apple Developer Team
 5. Xcode 会自动生成 Provisioning Profile
 
 ### 5️⃣ 运行到真机
 
 - 连接 iPhone 到 Mac（或使用无线调试）
 - 选择你的 iPhone 作为目标设备
 - 按 **Cmd+R** 运行
 
 首次运行时会请求通知权限，请允许。
 
 ## 项目结构
 
 ```
 ios/
 ├── project.yml                          # XcodeGen 配置（项目生成入口）
 ├── WorkWellness/
 │   ├── AppDelegate.swift                # 应用代理（通知注册）
 │   ├── SceneDelegate.swift              # 场景代理
 │   ├── ViewController.swift             # WKWebView + 原生桥接
 │   ├── Info.plist                        # 应用配置
 │   ├── WorkWellness.entitlements         # 推送通知授权
 │   ├── Assets.xcassets/                 # 应用图标 + 颜色
 │   └── www/                             # Web 应用资源
 │       ├── index.html
 │       ├── css/style.css
 │       ├── js/
 │       │   ├── app.js                   # 核心逻辑
 │       │   ├── particles.js             # 粒子引擎
 │       │   ├── ios-bridge.js            # iOS 原生桥接层
 │       │   └── icons/                   # 应用图标 PNG
 └── BUILD.md                             # 本文件
 ```
 
 ## iOS 原生桥接说明
 
 iOS 版通过 `WKScriptMessageHandler` 实现 JS ↔ Swift 双向通信：
 
 1. **通知桥接** (`notifyBridge`)：
    - JS 调用 `window.sendNativeNotification(title, body)`
    - Swift 端通过 `UNUserNotificationCenter` 发送本地通知
    - 无需请求权限，应用启动时自动注册
 
 2. **振动桥接** (`vibrateBridge`)：
    - JS 调用 `window.sendNativeVibration()`
    - Swift 端通过 `UIImpactFeedbackGenerator` 触发 Taptic Engine
 
 3. **自动降级**：
    - 如果在非 WKWebView 环境运行，自动回退到 Web Notification API
 
 ## 离线工作原理
 
 1. **Bundle 本地加载**：所有 HTML/CSS/JS 资源打包在 `.app` Bundle 内
 2. **WKWebView 离线渲染**：`loadFileURL` 从 Bundle 加载，无需网络
 3. **localStorage 持久化**：用户数据存储在 App Sandbox
 4. **UNUserNotificationCenter**：iOS 原生本地通知
 5. **无需网络**：无远程 API 依赖
 
 ## 常见问题
 
 **Q: 构建时提示 "Failed to register bundle identifier"**
 
 需要在 Xcode Signing & Capabilities 中修改 Bundle Identifier 为唯一值，
 或连接 Apple Developer 帐号。
 
 **Q: 应用通知不工作？**
 
 首次使用时系统会弹出通知权限请求，请选择"允许"。
 如误选"不允许"，前往 **设置 → 工作养生 → 通知** 手动开启。
 
 **Q: 图标在 Xcode 中显示为占位符？**
 
 请先运行图标生成脚本：
 ```bash
 cd WorkWellness/www/icons
 python3 generate_icons.py --ios
 ```
 
 然后在 Xcode 中右键 Assets.xcassets → AppIcon → 重新导入。
 
 **Q: 如何发布到 App Store？**
 
 1. 在 Xcode 中配置签名 Team
 2. Product → Archive
 3. 在 Organizer 中 Distribute App → App Store Connect
 
 ## 版本历史
 
 - v1.0.0 (2024) - iOS 初始版
   - 活动提醒（可自定义间隔）
   - 饮水提醒（可自定义间隔）
   - 工作计时 + 每日统计
   - 紫色粒子背景
   - iOS 原生通知（Taptic Engine 振动）
   - 完全离线运行
 
 ## 许可
 
 MIT License
