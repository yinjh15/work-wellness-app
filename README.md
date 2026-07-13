# 工作养生 App (网页版)

一款帮助上班族保持健康的工作养生应用，提供定时活动提醒和饮水提醒功能。

## 功能特性

- **总开关控制**：一键开启/关闭所有提醒
- **活动提醒**：每 40 分钟通知提醒起身活动
- **饮水提醒**：每 60 分钟通知提醒补充水分
- **工作计时**：显示今日工作时长
- **每日统计**：记录今日活动次数和饮水次数
- **紫色粒子特效**：动态粒子背景，工作时加速流动
- **自定义间隔**：可自由调整提醒频率
- **远程配置**：支持从 URL 加载主题和设置

## 如何使用

直接双击 `index.html` 文件在浏览器中打开即可使用。

**提示**：为了实现浏览器通知功能，建议通过本地服务器打开：

```bash
# 方法1：使用 Python
python -m http.server 8080
# 浏览器打开 http://localhost:8080

# 方法2：使用 Node.js (需安装 http-server)
npx http-server . -p 8080
```

## 部署上线

你可以将整个文件夹部署到任何静态托管服务上：

1. GitHub Pages
2. Vercel / Netlify
3. 阿里云 OSS + CDN
4. 任何 Web 服务器

## 远程配置格式

将以下 JSON 部署到服务器，在设置页填入 URL 即可同步：

```json
{
  "primary_color": "#7B2FBE",
  "particle_color": "#9B59D6",
  "activity_interval": 40,
  "water_interval": 60,
  "activity_message": "该起身活动了！站起来走一走吧！",
  "water_message": "喝杯纯净水吧！"
}
```

## 技术栈

- 原生 HTML5 + CSS3 + JavaScript
- Canvas 粒子动画系统
- Web Notification API (浏览器通知)
- localStorage (本地持久化存储)
- 响应式设计 (手机/平板/电脑)
- PWA 就绪 (可添加到主屏幕)

## 项目结构

```
工作养生app/
├── index.html          # 主页面
├── css/
│   └── style.css       # 紫色主题样式
├── js/
│   ├── particles.js    # 粒子特效引擎
│   └── app.js          # 核心应用逻辑
├── assets/             # 资源文件夹
├── .gitignore
└── README.md
```

## 隐私说明

- 所有数据仅存储在本地浏览器
- 不上传任何个人信息
