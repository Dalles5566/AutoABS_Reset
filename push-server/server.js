const express = require('express');
const webpush = require('web-push');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// VAPID keys
const VAPID_PUBLIC = process.env.VAPID_PUBLIC || 'BBZDLq8voeq639kFuM-27OLy2vQzItdD2j_AkKB8PoaRqUFWwKDUH_k_AyzN0hS6JdyvjcE-n2aGl_I-om8AbPM';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE || 'WXUIBp-vCe5ZXCob8f3719CP-qrl1iH1ar5l7LA9Wwk';

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
  console.log('Push subscription registered');
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
      .then(() => console.log('Push sent'))
      .catch(err => console.error('Push failed:', err));
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
