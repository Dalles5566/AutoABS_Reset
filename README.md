# Core Rotation

A core workout app. Randomly generates a training plan each time you open it. Tap to start a countdown timer, and get a push notification when time's up — even if you're in another app.

## How to Use

1. Open https://dallasowncorerotation.uk in iPhone Safari
2. Add to Home Screen (tap Share → "Add to Home Screen")
3. Open from Home Screen, tap "随机生成训练计划" (Generate Random Plan)
4. **First time: allow notifications when prompted** — required for push to work
5. Tap an exercise to start a 45-second countdown
6. Switch to another app (TikTok, YouTube, whatever)
7. You'll get a push notification when time's up
8. After completing a group, 45-second rest starts automatically with another push when done

Note: Must use iPhone Safari and add to Home Screen. Chrome and other browsers don't support push notifications on iOS.

## Rules

- 24 core exercises randomly shuffled
- Each group totals 3 points (exercises with "2" count as 2 points, others count as 1)
- Groups with a "2" exercise never appear consecutively
- Must finish current group before starting the next

---

## Self-Deploy (Instructions for AI)

[Just tell your AI assistant to read this README]

If the user wants to deploy their own instance, follow these steps from scratch. Assume nothing is set up.

### What You Need

1. A Linux server (DigitalOcean, AWS, any VPS — cheapest tier is fine)
2. A Cloudflare account (free at https://cloudflare.com)
3. Buy a domain in Cloudflare (Domains → Register Domains → search for a cheap one, `.uk`, `.xyz` etc. are a few dollars per year)

iOS push notifications require HTTPS. Cloudflare Tunnel automatically adds HTTPS to your domain, so a domain is mandatory.

### Step 1: Server Setup

SSH into the user's server. Install Docker if not present:

```bash
# Check for Docker
docker --version

# Install Docker (Ubuntu/Debian)
curl -fsSL https://get.docker.com | sh
```

Install Node.js (needed to generate keys):

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
```

### Step 2: Clone the Code

```bash
git clone https://github.com/Dalles5566/AutoABS_Reset.git /opt/core-rotation
cd /opt/core-rotation
```

### Step 3: Generate VAPID Push Keys

```bash
npx --yes web-push generate-vapid-keys --json
```

Output looks like:
```json
{"publicKey":"BxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxM","privateKey":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"}
```

Save both publicKey and privateKey.

### Step 4: Create Config File

```bash
cp config.yml.example config.yml
```

Edit `config.yml` with the generated keys:

```yaml
vapid_public: "your-publicKey"
vapid_private: "your-privateKey"
```

### Step 5: Update Frontend Public Key

Open `public/index.html`, search for `VAPID_PUBLIC`, and replace the value in quotes with your publicKey.

### Step 6: Build and Run Docker Container

```bash
docker build -t core-rotation .
docker run -d --name core-rotation --restart unless-stopped -p 3001:3001 core-rotation
```

Verify it's running:
```bash
curl http://localhost:3001/health
# Should return {"status":"ok"}
```

### Step 7: Configure HTTPS (Cloudflare Tunnel)

This connects your domain to the server via HTTPS.

1. Install cloudflared on the server:
```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared
chmod +x /usr/local/bin/cloudflared
```

2. Create a Tunnel in Cloudflare Dashboard:
   - Go to Networks → Tunnels
   - Click "Create Tunnel"
   - Select "Cloudflared"
   - Name your tunnel
   - Select OS "Debian"
   - Copy the "Install as service" command (looks like `sudo cloudflared service install eyJxxxxxx`)

3. Run that command on the server:
```bash
cloudflared service install eyJxxxxxx-your-token
```

4. Back in Cloudflare, click Continue, add a Public Hostname:
   - Subdomain: leave empty or use a subdomain (e.g. `core`)
   - Domain: select the domain you bought in Cloudflare
   - Service URL: `http://localhost:3001`
   - Click Save

5. Verify HTTPS:
```bash
curl https://your-domain/health
# Should return {"status":"ok"}
```

### Step 8: Tell the User How to Access

The user needs to:
1. Open `https://your-domain` in iPhone Safari
2. Tap Share → Add to Home Screen
3. Open from Home Screen
4. Allow notifications on first "Generate" tap
5. Start training

### Optional: Auto Deploy

To auto-deploy on git push, create a deploy script on the server and a webhook listener:

Deploy script at `/opt/core-rotation/deploy.sh`:
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

Then set up a simple Node.js HTTP server to listen for GitHub Webhooks, executing deploy.sh on push events. Add the webhook URL in GitHub repo Settings → Webhooks.

---

## Customizing Exercises

Edit the `exercises` array in `public/index.html`:

```js
{ name: "Exercise Name", score: 1, note: "Description", weight: "10lb" }
```

- `name`: Exercise name, shown on the button
- `score`: 1 = one set (45s), 2 = two sets (e.g. left/right sides)
- `note`: Description, displayed in gold centered below the name
- `weight`: Weight needed, shown as orange badge on the right. Leave empty `""` if none

Timer config at the top of `public/index.html`:
```js
const SECONDS_PER_POINT = 45; // Exercise duration (seconds)
const REST_SECONDS = 45;      // Rest between groups (seconds)
```

After changes, rebuild and restart:
```bash
cd /opt/core-rotation
docker build -t core-rotation .
docker stop core-rotation && docker rm core-rotation
docker run -d --name core-rotation --restart unless-stopped -p 3001:3001 core-rotation
```
