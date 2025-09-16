# 部署指南（Cloudflare Workers）

本项目已精简为“单 Worker 应用”。不再使用 Cloudflare Pages 或 Pages Functions，所有功能都在 `worker.js` 中：

- `GET /` 返回完整页面（内嵌 HTML/CSS/JS）
- `POST /api/tts` 代理腾讯云 TTS 并返回 MP3

下面提供两种部署方式：Web 控制台和命令行。

## 🌟 使用 Cloudflare 网页控制台

### 步骤 1：注册 Cloudflare 账号
1. 访问 [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
2. 注册一个免费账号并验证邮箱

### 步骤 2：获取腾讯云 TTS 凭证
1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 开通**语音合成（TTS）**服务
3. 在 [访问管理 - API密钥管理](https://console.cloud.tencent.com/cam/capi) 中获取：
   - `SecretId`（类似：AKIDxxxxx）
   - `SecretKey`（类似：xxxxx）

### 步骤 3：创建 Worker（网页操作）

#### 3.1 进入 Workers 控制台
1. 登录 Cloudflare 后，点击左侧的 **"Workers & Pages"**
2. 点击 **"Create application"**
3. 选择 **"Create Worker"**（非 Pages）
4. 给 Worker 起个名字，比如 `pte-trainer`
5. 点击 **"Deploy"**

#### 3.2 上传代码
1. 部署后会进入代码编辑界面
2. **删除**默认的所有代码
3. 打开项目中的 `worker.js` 文件
4. **复制全部内容**粘贴到编辑器中
5. 点击右上角 **"Save and deploy"**

### 步骤 4：设置环境变量（Secrets）
1. 在 Worker 页面，点击 **"Settings"** 标签
2. 找到 **"Environment Variables"** 部分
3. 点击 **"Add variable"** 添加以下变量：

**添加第一个变量：**
- Variable name: `TENCENT_SECRET_ID`
- Value: `你的腾讯云 SecretId`
- Type: **选择 "Secret"**（重要！）
- 点击 **"Save"**

**添加第二个变量：**
- Variable name: `TENCENT_SECRET_KEY`  
- Value: `你的腾讯云 SecretKey`
- Type: **选择 "Secret"**（重要！）
- 点击 **"Save"**

可选：
- Variable name: `TENCENT_REGION`
- Value: `ap-guangzhou`
- Type: 选择 "Text"
- 点击 **"Save"**

### 步骤 5：测试访问
1. 回到 Worker 的 **"Deployments"** 页面
2. 找到你的 Worker URL（类似：`https://pte-trainer.你的用户名.workers.dev`）
3. 点击链接访问你的应用！

---

## 🛠️ 命令行部署（wrangler）

如果你熟悉命令行，也可以使用 wrangler 工具：

### 安装 wrangler
需要先安装 Node.js，然后：
```bash
npm install -g wrangler
```

### 登录和部署
```bash
# 登录（会打开浏览器验证）
wrangler login

# 进入项目目录并设置密钥（本地/远端）
cd pte-di-number-year-trainer
wrangler secret put TENCENT_SECRET_ID
wrangler secret put TENCENT_SECRET_KEY

# 部署
wrangler deploy
```

---

## 📝 部署后的 URL
部署成功后，你会得到一个网址，格式类似：
```
https://pte-trainer.你的用户名.workers.dev
```

## ✅ 功能检查清单
访问你的网站后，检查以下功能：
- [ ] 页面正常显示
- [ ] 可以生成数字/年份
- [ ] 显示/隐藏读法功能正常
- [ ] 键盘快捷键工作正常
- [ ] **播放发音**按钮有声音（这个需要腾讯云配置正确）

## 🔧 常见问题

### Q: 播放发音没有声音？
A: 检查以下几点：
1. 腾讯云 TTS 服务是否已开通
2. SecretId 和 SecretKey 是否正确
3. 环境变量类型是否设置为 "Secret"

### Q: 网站打不开？
A: 
1. 确认 Worker 已成功部署
2. 检查 worker.js 代码是否完整复制
3. 查看 Cloudflare 控制台是否有错误信息

### Q: 如何更新代码？
A: 
1. 修改 GitHub 上的 worker.js
2. 复制新代码到 Cloudflare Workers 编辑器
3. 点击 "Save and deploy"

### Q: 想要自定义域名？
A: 
1. 在 Worker 页面点击 "Triggers" 标签
2. 点击 "Add Custom Domain"  
3. 输入你的域名（需要先在 Cloudflare 托管该域名）

## 💰 费用说明
- Cloudflare Workers 免费套餐：每天 100,000 次请求
- 腾讯云 TTS：前 10,000 字符免费，之后按量计费
- 个人学习使用完全免费！

## 🎯 推荐的部署方式
对于大多数用户，**建议使用网页控制台部署**，简单直观，无需安装额外软件。
