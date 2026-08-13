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

## 自己部署

### 前提条件

- 一台服务器（Linux）
- Docker
- 一个域名 + HTTPS（iOS PWA 推送必须 HTTPS）

### 步骤

1. 克隆代码

```bash
git clone https://github.com/Dalles5566/AutoABS_Reset.git
cd AutoABS_Reset
```

2. 生成你自己的 VAPID 推送密钥

```bash
npx web-push generate-vapid-keys
```

会输出 publicKey 和 privateKey。

3. 修改密钥

打开 `server.js`，把 `VAPID_PUBLIC` 和 `VAPID_PRIVATE` 替换成你刚生成的。

打开 `public/index.html`，搜索 `VAPID_PUBLIC`，也替换成你的 publicKey。

4. 构建 Docker 镜像并运行

```bash
docker build -t core-rotation .
docker run -d --name core-rotation --restart unless-stopped -p 3001:3001 core-rotation
```

5. 配置 HTTPS

用 Nginx + Let's Encrypt，或者 Cloudflare Tunnel，把 HTTPS 流量转发到 localhost:3001。

Cloudflare Tunnel 方式（免费，不需要开放端口）：
```bash
# 安装 cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared
chmod +x /usr/local/bin/cloudflared

# 用你的 Cloudflare 账号创建 tunnel，绑定域名，指向 http://localhost:3001
# 具体看 Cloudflare Tunnel 文档
```

6. 访问你的域名，Safari 添加到主屏幕，开始用

### 自定义动作

编辑 `public/index.html` 里的 `exercises` 数组：

```js
{ name: "动作名称", score: 1, note: "备注", weight: "10lb" }
```

- `score`: 1 = 做一组，2 = 做两组（左右各一次之类的）
- `note`: 动作说明，显示在按钮上
- `weight`: 需要的器材/重量，显示在右边
