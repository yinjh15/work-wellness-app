 # 工作养生 App - Android 离线版构建指南
 
 ## 项目简介
 
 工作养生 App 是一款帮助上班族保持健康的应用，提供定时活动提醒和饮水提醒功能。
 此版本为 **Android 离线版**，所有资源打包在 APK 内部，完全离线运行。
 
 ## 环境要求
 
 | 环境 | 版本 | 说明 |
 |------|------|------|
 | Java | 17+ | JDK (下载: https://adoptium.net/) |
 | Android Studio | 最新版 | 包含 Android SDK (下载: https://developer.android.com/studio) |
 | Android SDK | API 34+ | 通过 SDK Manager 安装 |
 | Gradle | 8.5+ (自动下载) | 构建工具 |
 | Git | 可选 | 版本管理 |
 
 ## 快速开始
 
 ### 1️⃣ 环境准备
 
 **安装 Java 17+：**
 ```bash
 # 确认 Java 已安装
 java -version
 # 输出示例: openjdk version "17.0.9" 2023-10-17
 ```
 
 **安装 Android Studio：**
 1. 下载并安装 [Android Studio](https://developer.android.com/studio)
 2. 启动 Android Studio
 3. 打开 SDK Manager → 安装 Android 14.0 (API 34)
 
 **设置环境变量：**
 ```cmd
 :: 方法1: 命令行设置（临时）
 set ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
 set JAVA_HOME=C:\Program Files\Java\jdk-17
 
 :: 方法2: 系统环境变量（永久）
 setx ANDROID_HOME "C:\Users\%USERNAME%\AppData\Local\Android\Sdk"
 setx JAVA_HOME "C:\Program Files\Java\jdk-17"
 ```
 
 ### 2️⃣ 生成应用图标（可选）
 
 生成 WebView 使用的图标文件：
 1. 在浏览器中打开 `generate-icons.html`
 2. 截图 Canvas 中的图标
 3. 裁剪为以下尺寸并保存到 `www/icons/` 目录：
    - `icon.png` (48×48)
    - `icon-hdpi.png` (72×72)
    - `icon-xhdpi.png` (96×96)
    - `icon-xxhdpi.png` (144×144)
    - `icon-xxxhdpi.png` (192×192)
    - `splash.png` (480×800)
 
 > 也可使用在线工具 (如 https://romannurik.github.io/AndroidAssetStudio/ ) 生成全部尺寸。
 
 ### 3️⃣ 构建 APK
 
 **方法一：使用构建脚本 (推荐)**
 ```cmd
 cd android
 build.bat
 # 选择 1 = Debug 构建
 # 选择 2 = Release 构建
 ```
 
 **方法二：使用 Gradle 命令行**
 ```cmd
 cd android
 
 :: Debug 构建
 gradlew assembleDebug
 
 :: Release 构建
 gradlew assembleRelease
 ```
 
 **方法三：使用 Android Studio**
 1. 打开 Android Studio → File → Open
 2. 选择 `android` 目录
 3. 等待 Gradle 同步完成
 4. Build → Build Bundle(s) / APK(s) → Build APK(s)
 
 ### 4️⃣ APK 输出路径
 
 ```
 platforms/android/app/build/outputs/apk/debug/app-debug.apk   (Debug)
 platforms/android/app/build/outputs/apk/release/app-release.apk (Release)
 ```
 
 ### 5️⃣ 安装到设备
 
 ```cmd
 :: 确保设备已连接并开启 USB 调试
 adb install -r platforms/android/app/build/outputs/apk/debug/app-debug.apk
 
 :: 或使用 build.bat 选 3 自动安装
 build.bat
 ```
 
 ## 项目结构
 
 ```
 android/
 ├── build.bat                    # Windows 构建脚本
 ├── build.gradle                 # 顶层 Gradle 配置
 ├── config.xml                   # Cordova 配置 (备用构建方式)
 ├── settings.gradle              # Gradle 配置
 ├── gradle.properties            # Gradle 属性
 ├── gradlew.bat                  # Gradle Wrapper 启动脚本
 ├── gradle/
 │   └── wrapper/
 │       ├── gradle-wrapper.jar   # Gradle Wrapper JAR
 │       └── gradle-wrapper.properties
 ├── res/                         # Android 资源
 │   ├── drawable/                # 矢量图标、启动屏
 │   ├── values/                  # 字符串、颜色、主题
 │   ├── xml/                     # 网络安全配置
 │   └── mipmap-anydpi-v26/       # 自适应图标
 ├── platforms/
 │   └── android/
 │       └── app/
 │           ├── build.gradle      # 应用级构建配置
 │           ├── proguard-rules.pro
 │           └── src/main/
 │               ├── AndroidManifest.xml
 │               ├── java/com/workwellness/app/
 │               │   └── MainActivity.java
 │               └── res/layout/
 │                   └── activity_main.xml
 ├── www/                         # Web 应用资源 (打包入 APK)
 │   ├── index.html
 │   ├── service-worker.js
 │   ├── css/style.css
 │   ├── js/
 │   │   ├── app.js
 │   │   ├── particles.js
 │   │   └── service-worker-register.js
 │   └── icons/
 │       ├── icon.svg
 │       └── *.png (手动添加)
 ├── package.json                 # Cordova 配置 (备用)
 └── generate-icons.html          # 图标生成工具
 ```
 
 ## 离线工作原理
 
 此应用通过以下机制实现完全离线运行：
 
 1. **WebView 本地加载**：所有 HTML/CSS/JS 资源打包在 APK 的 `assets/www/` 目录中
 2. **Service Worker 缓存**：首次运行时缓存所有资源 (后备方案)
 3. **localStorage 持久化**：所有用户数据存储在本地
 4. **Android 通知**：通过 Android Notification API 发送本地提醒
 5. **无需网络**：无远程依赖，无 API 调用
 
 ## 常见问题
 
 **Q: 构建时提示 "Could not find com.android.tools.build:gradle"**
 
 确保网络连接正常，Gradle 需要下载依赖。如果网络受限，可手动下载 Gradle 到本地。
 
 **Q: 提示 "ANDROID_HOME is not set"**
 
 设置环境变量指向 Android SDK 安装位置：
 ```cmd
 setx ANDROID_HOME "C:\Users\%USERNAME%\AppData\Local\Android\Sdk"
 ```
 
 **Q: 如何创建签名 APK 发布？**
 
 1. 生成密钥库：
    ```cmd
    keytool -genkey -v -keystore release.keystore -alias workwellness -keyalg RSA -keysize 2048 -validity 10000
    ```
 2. 在 `app/build.gradle` 配置签名：
    ```gradle
    signingConfigs {
        release {
            storeFile file('release.keystore')
            storePassword '****'
            keyAlias 'workwellness'
            keyPassword '****'
        }
    }
    ```
 
 **Q: 应用通知不工作？**
 
 首次使用时会请求通知权限，请允许。如需重新授权，进入 系统设置 → 应用 → 工作养生 → 通知 → 开启通知。
 
 ## 版本历史
 
 - v1.0.0 (2024) - 初始 Android 离线版
   - 活动提醒 (可自定义间隔)
   - 饮水提醒 (可自定义间隔)
   - 工作计时
   - 每日统计
   - 紫色粒子背景特效
   - 完全离线运行
 
 ## 许可
 
 MIT License - 自由使用和修改
