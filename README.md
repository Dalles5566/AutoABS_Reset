# Core Rotation

一个核心训练 App。每次打开随机生成一份训练计划，按一下就开始倒计时，时间到了手机推送提醒你。

## 怎么用

1. 手机 Safari 打开 https://dallasowncorerotation.uk
2. 添加到主屏幕
3. 打开，点"随机生成训练计划"
4. 点一个动作开始 45 秒倒计时
5. 去刷抖音，时间到了会推送通知叫你回来
6. 一组做完自动休息 45 秒，休息结束也会推送

## 规则

- 24 个核心动作随机打乱
- 每组凑满 3 分（带"2"的动作算 2 分，其他算 1 分）
- 带 2 的组不会连续出现
- 同一组内必须做完才能开始下一组

## 自己部署

需要：Docker + 一个 HTTPS 域名

```bash
# 生成推送密钥
npx web-push generate-vapid-keys

# 把密钥填到 server.js 里，然后
docker build -t core-rotation .
docker run -d --name core-rotation -p 3001:3001 core-rotation
```

然后用 Nginx/Cloudflare Tunnel 之类的给 3001 端口加 HTTPS 就行。
