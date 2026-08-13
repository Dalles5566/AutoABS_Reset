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

// 存储订阅信息（按 endpoint 区分不同用户）
const subscriptions = new Map();

// 注册推送订阅
app.post('/subscribe', (req, res) => {
  const sub = req.body;
  subscriptions.set(sub.endpoint, sub);
  console.log('Push subscription registered:', sub.endpoint.slice(0, 80));
  res.json({ success: true });
});

// 设置定时推送
app.post('/notify', (req, res) => {
  const { delay, title, body, endpoint } = req.body;

  const subscription = subscriptions.get(endpoint);
  if (!subscription) {
    return res.status(400).json({ error: 'No subscription found for this endpoint' });
  }

  const delayMs = (delay || 45) * 1000;

  setTimeout(() => {
    const payload = JSON.stringify({
      title: title || '🔥 时间到！',
      body: body || '继续下一个动作！'
    });

    webpush.sendNotification(subscription, payload)
      .then(() => console.log('Push sent to:', endpoint.slice(0, 80)))
      .catch(err => {
        console.error('Push failed:', err.statusCode, err.body);
        // 如果推送失败（过期了），移除该订阅
        if (err.statusCode === 404 || err.statusCode === 410) {
          subscriptions.delete(endpoint);
        }
      });
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
