# Core Rotation Workout App

核心训练随机生成器 + 计时器 + 推送通知

## 功能

- 24个核心训练动作随机打乱，每组凑满3分
- 带"2"的动作算2分（做两边），其他算1分
- 带2的组不连续出现
- 每个动作是一个按钮，点击开始45秒倒计时
- 倒计时结束后服务器发送 Web Push 通知（后台也能收到）
- 整组完成后自动进入45秒休息
- 点击动作后自动跳转抖音，时间到了推送提醒回来
- PWA 支持：添加到主屏幕像原生 App 一样使用

## 技术栈

- **前端**: 纯 HTML/CSS/JS, PWA (Service Worker + Web Push)
- **后端**: Node.js + Express + web-push
- **部署**: Docker + Cloudflare Tunnel (HTTPS)
- **自动部署**: GitHub Webhook → 服务器自动 pull + build + restart

## 项目结构

```
├── public/
│   ├── index.html      # 前端页面
│   ├── manifest.json   # PWA 配置
│   └── sw.js           # Service Worker (缓存 + Push 事件处理)
├── server.js           # 后端 API (推送订阅 + 定时推送)
├── package.json
├── Dockerfile
└── README.md
```

## 配置

`public/index.html` 顶部：
```js
const SECONDS_PER_POINT = 45; // 每组动作时间
const REST_SECONDS = 45;      // 组间休息时间
```

动作列表在 `exercises` 数组中，每个动作有：
- `name`: 动作名称
- `score`: 1 或 2（决定分数和组数）
- `note`: 备注说明
- `weight`: 重量标注

## 部署

代码 push 到 GitHub 后自动部署到服务器。

手动部署：
```bash
docker build -t core-rotation .
docker stop core-rotation && docker rm core-rotation
docker run -d --name core-rotation --restart unless-stopped -p 3001:3001 core-rotation:latest
```

## 访问

https://dallasowncorerotation.uk
