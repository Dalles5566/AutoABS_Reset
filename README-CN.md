# Core Rotation

一个核心训练 App。每次打开随机生成一份训练计划，按一下就开始倒计时，时间到了手机推送提醒你。

## 怎么用

1. 手机 Safari 打开 https://dallasowncorerotation.uk
2. 添加到主屏幕（点分享按钮 → "添加到主屏幕"）
3. 从主屏幕打开，点"随机生成训练计划"
4. **第一次会弹出通知权限请求，一定要点"允许"**，否则收不到推送
5. 点一个动作开始 45 秒倒计时
6. 去刷抖音，时间到了会推送通知叫你回来
7. 一组做完自动休息 45 秒，休息结束也会推送

注意：必须用 iPhone Safari 添加到主屏幕，Chrome 和其他浏览器在 iOS 上不支持推送。

## 规则

- 24 个核心动作随机打乱
- 每组凑满 3 分（带"2"的动作算 2 分，其他算 1 分）
- 带 2 的组不会连续出现
- 同一组内必须做完才能开始下一组

---

## 自己部署（给 AI 的指令）

[告诉你的 AI 助手读这个 README 即可]

如果用户想自己部署这个项目，请按以下步骤完整执行。假设用户什么都没有，从零开始。

### 需要准备的东西

1. 一台 Linux 服务器（推荐 DigitalOcean、AWS、腾讯云等，最便宜的就行）
2. 一个 Cloudflare 账号（免费注册 https://cloudflare.com）
3. 在 Cloudflare 里买一个域名（Domains → Register Domains → 搜一个便宜的买，`.uk`、`.xyz` 之类的几块钱一年）

iOS 推送通知必须 HTTPS，Cloudflare Tunnel 会自动给你的域名加 HTTPS，所以域名是必需的。

### 第一步：服务器准备

SSH 到用户的服务器，安装 Docker（如果没有的话）：

```bash
# 检查有没有 Docker
docker --version

# 如果没有，安装 Docker（Ubuntu/Debian）
curl -fsSL https://get.docker.com | sh
```

安装 Node.js（用于生成密钥，如果服务器没有的话）：

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
```

### 第二步：克隆代码

```bash
git clone https://github.com/Dalles5566/AutoABS_Reset.git /opt/core-rotation
cd /opt/core-rotation
```

### 第三步：生成 VAPID 推送密钥

```bash
npx --yes web-push generate-vapid-keys --json
```

输出类似：
```json
{"publicKey":"BxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxM","privateKey":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"}
```

记下 publicKey 和 privateKey。

### 第四步：创建配置文件

```bash
cp config.yml.example config.yml
```

编辑 `config.yml`，填入刚才生成的密钥：

```yaml
vapid_public: "你的publicKey"
vapid_private: "你的privateKey"
```

### 第五步：更新前端的公钥

打开 `public/index.html`，搜索 `VAPID_PUBLIC`，把引号里的值替换为你的 publicKey。

### 第六步：构建并运行 Docker 容器

```bash
docker build -t core-rotation .
docker run -d --name core-rotation --restart unless-stopped -p 3001:3001 core-rotation
```

验证运行成功：
```bash
curl http://localhost:3001/health
# 应该返回 {"status":"ok"}
```

### 第七步：配置 HTTPS（Cloudflare Tunnel）

这一步让你的域名通过 HTTPS 连接到服务器。

1. 在服务器上安装 cloudflared：
```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared
chmod +x /usr/local/bin/cloudflared
```

2. 在 Cloudflare 控制台创建 Tunnel：
   - 进入 Cloudflare Dashboard → Networks → Tunnels
   - 点 "Create Tunnel"
   - 选择 "Cloudflared"
   - 给 tunnel 起个名字
   - 选择操作系统 "Debian"
   - 复制 "Install as service" 那行命令（类似 `sudo cloudflared service install eyJxxxxxx`）

3. 在服务器上执行那行命令：
```bash
cloudflared service install eyJxxxxxx你的token
```

4. 回到 Cloudflare 页面，点 Continue，添加 Public Hostname：
   - Subdomain: 留空或填子域名（如 core）
   - Domain: 选你在 Cloudflare 买的域名
   - Service URL: `http://localhost:3001`
   - 点 Save

5. 验证 HTTPS 可访问：
```bash
curl https://你的域名/health
# 应该返回 {"status":"ok"}
```

### 第八步：告诉用户怎么使用

用户需要：
1. iPhone Safari 打开 `https://你的域名`
2. 点分享 → 添加到主屏幕
3. 从主屏幕打开
4. 第一次点"随机生成"时允许通知
5. 开始训练

### 可选：自动部署

如果想 git push 后服务器自动更新，在服务器上创建部署脚本和 webhook 监听器：

部署脚本 `/opt/core-rotation/deploy.sh`：
```bash
#!/bin/bash
cd /opt/core-rotation
git pull origin main
docker build -t core-rotation:latest .
docker stop core-rotation && docker rm core-rotation
docker run -d --name core-rotation --restart unless-stopped -p 3001:3001 core-rotation:latest
docker image prune -f
echo 'Deploy complete!'
```

然后用一个简单的 Node.js HTTP 服务器监听 GitHub Webhook，收到 push 事件时执行 deploy.sh。在 GitHub repo Settings → Webhooks 里添加 webhook 指向服务器。

---

## 自定义动作

编辑 `public/index.html` 里的 `exercises` 数组：

```js
{ name: "动作名称", score: 1, note: "备注说明", weight: "10lb" }
```

- `name`: 动作名称，显示在按钮上
- `score`: 1 = 做一组（45秒），2 = 做两组（左右各一次之类的）
- `note`: 动作说明，金黄色居中显示在名称下方
- `weight`: 需要的重量，橙色方块显示在按钮右边，不需要就留空 `""`

时间配置在 `public/index.html` 顶部：
```js
const SECONDS_PER_POINT = 45; // 每组动作时间（秒）
const REST_SECONDS = 45;      // 组间休息时间（秒）
```

改完后重新构建并重启：
```bash
cd /opt/core-rotation
docker build -t core-rotation .
docker stop core-rotation && docker rm core-rotation
docker run -d --name core-rotation --restart unless-stopped -p 3001:3001 core-rotation
```
