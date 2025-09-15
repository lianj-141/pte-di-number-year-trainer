# Cloudflare Workers 部署指南

## 项目概述
这个项目可以完全通过单个 Cloudflare Worker 部署，Worker 既提供静态文件服务，又提供 TTS API 代理。

## 部署步骤

### 1. 准备环境

#### 安装 Wrangler CLI
```bash
npm install -g wrangler
```

#### 登录 Cloudflare
```bash
wrangler login
```

### 2. 获取腾讯云 TTS 凭证

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 开通语音合成（TTS）服务
3. 在 [访问管理](https://console.cloud.tencent.com/cam/capi) 中获取：
   - `SecretId`
   - `SecretKey`

### 3. 配置环境变量

设置腾讯云凭证（这些会被安全地存储为 Workers Secrets）：
```bash
wrangler secret put TENCENT_SECRET_ID
# 输入你的 SecretId

wrangler secret put TENCENT_SECRET_KEY
# 输入你的 SecretKey
```

### 4. 部署到 Cloudflare Workers

#### 开发环境测试
```bash
wrangler dev
```
访问 `http://localhost:8787` 进行本地测试

#### 部署到生产环境
```bash
wrangler deploy
```

部署成功后，你会得到一个类似这样的 URL：
`https://pte-di-trainer.your-subdomain.workers.dev`

### 5. 自定义域名（可选）

如果你有自己的域名，可以在 Cloudflare Workers 控制台中配置自定义域名：

1. 进入 [Workers 控制台](https://dash.cloudflare.com/workers)
2. 选择你的 Worker
3. 点击 "Triggers" 标签
4. 添加自定义域名

## 项目结构

```
pte-di-number-year-trainer/
├── worker.js          # 主 Worker 脚本（包含所有代码）
├── wrangler.toml      # Cloudflare Workers 配置
├── index.html         # 原始 HTML（已集成到 worker.js）
├── app.js            # 原始 JS（已集成到 worker.js）
├── styles.css        # 原始 CSS（已集成到 worker.js）
└── WORKERS_DEPLOYMENT.md # 本部署指南
```

## 功能特性

### API 端点
- `GET /` - 返回练习应用的 HTML 页面
- `POST /api/tts` - 腾讯云 TTS 代理接口

### TTS API 使用
```javascript
fetch('/api/tts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Hello world',
    voice: '1001',  // 英文语音
    speed: 0        // 语速
  })
})
```

### 环境变量
- `TENCENT_SECRET_ID` - 腾讯云 SecretId（Worker Secret）
- `TENCENT_SECRET_KEY` - 腾讯云 SecretKey（Worker Secret）
- `TENCENT_REGION` - 腾讯云地域（默认：ap-guangzhou）

## 本地开发

### 开发环境配置
```bash
# 克隆项目
git clone https://github.com/lianj-141/pte-di-number-year-trainer.git
cd pte-di-number-year-trainer

# 设置本地开发环境变量
wrangler secret put TENCENT_SECRET_ID --env development
wrangler secret put TENCENT_SECRET_KEY --env development

# 启动开发服务器
wrangler dev
```

### 测试 TTS 功能
访问 `http://localhost:8787`，点击"播放发音"按钮测试 TTS 功能。

## 监控和日志

### 查看日志
```bash
wrangler tail
```

### 监控控制台
访问 [Cloudflare Workers 控制台](https://dash.cloudflare.com/workers) 查看：
- 请求统计
- 错误日志
- 性能指标

## 成本估算

Cloudflare Workers 免费套餐包括：
- 每天 100,000 次请求
- 每次请求最多 10ms CPU 时间

对于个人学习使用完全足够，超出部分按使用量计费。

## 故障排除

### 1. TTS 不工作
- 检查腾讯云凭证是否正确设置
- 确认腾讯云 TTS 服务已开通
- 查看 Worker 日志：`wrangler tail`

### 2. 部署失败
- 确认已登录 Cloudflare：`wrangler whoami`
- 检查 `wrangler.toml` 配置

### 3. 本地开发问题
- 确认 Node.js 版本 >= 16
- 重新安装 wrangler：`npm install -g wrangler@latest`

## 更新部署

修改代码后重新部署：
```bash
wrangler deploy
```

Worker 会立即更新，无需重启。

## 安全说明

- 腾讯云凭证安全存储为 Workers Secrets
- 前端代码无法访问敏感信息
- 支持 CORS，但仅限必要的方法
- TTS 请求有长度限制（150字符）

## 支持

如有问题，请查看：
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [腾讯云 TTS 文档](https://cloud.tencent.com/document/product/1073)
- [项目 GitHub Issues](https://github.com/lianj-141/pte-di-number-year-trainer/issues)