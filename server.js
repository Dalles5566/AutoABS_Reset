const express = require('express');
const webpush = require('web-push');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');

const app = express();
app.use(cors());
app.use(express.json());

// 静态文件（前端页面）
app.use(express.static(path.join(__dirname, 'public')));

// 读取配置
let config = {};
try {
  config = yaml.load(fs.readFileSync(path.join(__dirname, 'config.yml'), 'utf8'));
} catch (e) {
  console.log('No config.yml found, using env vars');
}

const VAPID_PUBLIC = process.env.VAPID_PUBLIC || config.vapid_public || '';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE || config.vapid_private || '';

webpush.setVapidDetails(
  'mailto:core-workout@example.com',
  VAPID_PUBLIC,
  VAPID_PRIVATE
);

// 存储订阅信息（内存即可，只有你一个人用）
let subscription = null;

// 注册推送订阅
app.post('/subscribe', (req, res) => {
  subscription = req.body;
  console.log('Push subscription registered:', JSON.stringify(subscription).slice(0, 200));
  res.json({ success: true });
});

// 设置定时推送
app.post('/notify', (req, res) => {
  const { delay, title, body } = req.body;

  if (!subscription) {
    return res.status(400).json({ error: 'No subscription registered' });
  }

  const delayMs = (delay || 45) * 1000;

  setTimeout(() => {
    const payload = JSON.stringify({
      title: title || '🔥 时间到！',
      body: body || '继续下一个动作！'
    });

    webpush.sendNotification(subscription, payload)
      .then(() => console.log('Push sent successfully to:', subscription.endpoint))
      .catch(err => console.error('Push failed:', err.statusCode, err.body));
  }, delayMs);

  res.json({ success: true, willNotifyIn: delay });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Push server running on port ${PORT}`);
});
