# PTE DI 数字/年份练习器 - 部署指南

## 项目结构
```
pte-di-number-year-trainer/
├── index.html          # 主页面
├── app.js             # 前端逻辑
├── styles.css         # 样式文件
├── functions/api/tts.js # Cloudflare Functions TTS 代理
├── wrangler.toml      # Cloudflare 配置
└── requirements.md    # 需求文档
```

## 部署到 Cloudflare Pages

### 1. 准备腾讯云 TTS 服务
1. 登录[腾讯云控制台](https://console.cloud.tencent.com/)
2. 开通语音合成（TTS）服务
3. 获取 `SecretId` 和 `SecretKey`

### 2. 部署到 Cloudflare Pages
1. 将项目推送到 GitHub 仓库
2. 在 Cloudflare Pages 中连接该仓库
3. 构建设置：
   - 构建命令：（留空）
   - 构建输出目录：`/`
   - 根目录：`/`

### 3. 配置环境变量
在 Cloudflare Pages 项目设置中添加环境变量：
```
TENCENT_SECRET_ID=你的SecretId
TENCENT_SECRET_KEY=你的SecretKey
TENCENT_REGION=ap-guangzhou
```

### 4. 本地开发
```bash
# 安装 Wrangler CLI
npm install -g wrangler

# 设置环境变量
wrangler secret put TENCENT_SECRET_ID
wrangler secret put TENCENT_SECRET_KEY

# 本地开发
wrangler pages dev .
```

## 功能特性

### 语音合成策略
- **主要方案**：腾讯云 TTS（高质量英文语音）
- **回退方案**：浏览器 Web Speech API
- **自动切换**：TTS 服务不可用时自动回退

### 支持的操作
- **Space/Enter**：生成下一题
- **A**：显示/隐藏英文读法
- **S**：播放语音
- **1**：切换到数字模式
- **2**：切换到年份模式

### 配置选项
- **年份模式**：可设置年份范围（默认 1800-2099）
- **数字模式**：可设置位数范围（默认 2-6 位）
- **设置持久化**：使用 localStorage 保存用户配置

## API 端点

### POST /api/tts
**请求参数：**
```json
{
  "text": "要合成的英文文本",
  "voice": "1001",
  "speed": 0
}
```

**响应：**
- 成功：返回 `audio/mpeg` 音频流
- 失败：返回 JSON 错误信息

## 安全考虑
- 腾讯云密钥完全在服务端处理
- 前端无需接触任何敏感信息
- 支持 CORS 但仅限必要的方法
- 请求文本长度限制（最大 150 字符）