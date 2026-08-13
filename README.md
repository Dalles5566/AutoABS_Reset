# Core Rotation

一个核心训练 App。每次打开随机生成一份训练计划，按一下就开始倒计时，时间到了手机推送提醒你。

## 怎么用

1. 手机 Safari 打开 https://dallasowncorerotation.uk
2. 添加到主屏幕
3. 从主屏幕打开，点"随机生成训练计划"
4. **第一次会弹出通知权限请求，一定要点"允许"**，否则收不到推送
5. 点一个动作开始 45 秒倒计时
6. 去刷抖音，时间到了会推送通知叫你回来
7. 一组做完自动休息 45 秒，休息结束也会推送

注意：必须用 Safari 添加到主屏幕（PWA 模式），其他浏览器不支持推送。

## 规则

- 24 个核心动作随机打乱
- 每组凑满 3 分（带"2"的动作算 2 分，其他算 1 分）
- 带 2 的组不会连续出现
- 同一组内必须做完才能开始下一组

## 自己部署（AI 执行指令）

如果你有一台 Linux 服务器和一个域名，让你的 AI 助手读这段，它就能帮你自动部署。

### 前提

- 一台 Linux 服务器，已安装 Docker
- 一个域名（已指向服务器 IP，或者用 Cloudflare Tunnel）
- 服务器需要 HTTPS（iOS PWA 推送必须 HTTPS）

### 部署步骤（AI 请按顺序执行）

1. SSH 到用户的服务器

2. 克隆代码到服务器：
```bash
git clone https://github.com/Dalles5566/AutoABS_Reset.git /opt/core-rotation
cd /opt/core-rotation
```

3. 生成 VAPID 推送密钥（在服务器上或本地都行）：
```bash
npx --yes web-push generate-vapid-keys --json
```
记下输出的 publicKey 和 privateKey。

4. 替换密钥：
- 打开 `server.js`，把 `VAPID_PUBLIC` 的值替换为新的 publicKey
- 打开 `server.js`，把 `VAPID_PRIVATE` 的值替换为新的 privateKey
- 打开 `public/index.html`，搜索 `VAPID_PUBLIC`，替换为新的 publicKey

5. 构建 Docker 镜像：
```bash
docker build -t core-rotation .
```

6. 启动容器：
```bash
docker run -d --name core-rotation --restart unless-stopped -p 3001:3001 core-rotation
```

7. 配置 HTTPS，把流量转发到 localhost:3001。推荐用 Cloudflare Tunnel：
- 在 Cloudflare 控制台创建一个 Tunnel
- 在服务器上安装 cloudflared 并用 token 注册
- 添加 Public Hostname 路由，指向 http://localhost:3001
- 这样域名自动有 HTTPS

8. 验证：访问 https://你的域名/health 应该返回 `{"status":"ok"}`

9. 告诉用户：用 iPhone Safari 打开 https://你的域名，添加到主屏幕，第一次打开时允许通知。

### 自定义动作

编辑 `public/index.html` 里的 `exercises` 数组：

```js
{ name: "动作名称", score: 1, note: "备注说明", weight: "10lb" }
```

- `score`: 1 = 做一组（45秒），2 = 做两组（左右各一次之类的）
- `note`: 动作说明，显示在按钮上（金黄色居中）
- `weight`: 需要的重量，显示在按钮右边（橙色方块）

改完后重新 build 并重启容器：
```bash
cd /opt/core-rotation
docker build -t core-rotation .
docker stop core-rotation && docker rm core-rotation
docker run -d --name core-rotation --restart unless-stopped -p 3001:3001 core-rotation
```
