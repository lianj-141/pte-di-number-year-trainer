# PTE DI 数字/年份朗读练习（需求说明）

## 目标
- 练习年份与纯数字的英文读法（专注 year 读法，数字读法不使用 British “and”）。
- 随机生成题目；支持键盘快速操作；可播放腾讯云 TTS（经服务端代理），未配置时回退浏览器 Web Speech。
- 可配置：
  - 模式：Years / Numbers
  - 年份范围：默认 1800–2099，可调整
  - 数字范围：按“位数”（最小位数/最大位数）

## 功能清单
- 模式切换（Years、Numbers）。
- 随机出题（年份或数字）。
- 正确英文读法文本展示（可显隐）。
- 语音播放：优先腾讯云 TTS（Cloudflare Workers/Pages Functions 代理）；失败时回退 Web Speech API。
- 键盘快捷键：
  - Space / Enter：下一题
  - A：显示/隐藏读法
  - S：播放发音
  - 1：切换到 Numbers 模式
  - 2：切换到 Years 模式
- 配置持久化：`localStorage` 保存模式与范围设置。
 - Numbers 模式下题目数值显示使用千分位分隔符（如 123,456）。

## 读法规则
- 年份（Year 读法）：
  - 1800–1999：按两位一组（如 1905 → “nineteen oh five”；1900 → “nineteen hundred”）。
  - 2000–2009：“two thousand X”（如 2003 → “two thousand three”）。
  - 2010–2099：“twenty ten / twenty nineteen”风格（如 2021 → “twenty twenty-one”）。
- 数字（Cardinal）：
  - 0–999,999,999 的常规读法；不使用 British “and”（如 101 → “one hundred one”）。
  - 20–99 使用连字符（如 21 → “twenty-one”）。

## 非目标（MVP 不包含）
- 前端直连腾讯云 TTS（会暴露密钥）。
- 混合模式、替代读法多风格切换、发音音色选择。

## 架构与安全
- 前端（SPA）：
  - 仍为单页面应用，静态资源为 `index.html`、`styles.css`、`app.js`。
  - 不保存任何云厂商密钥与签名逻辑。
- 服务端代理：
  - 使用 Cloudflare Workers 或 Cloudflare Pages Functions 暴露 `POST /api/tts`。
  - 环境变量：`TENCENT_SECRET_ID`、`TENCENT_SECRET_KEY`、`TENCENT_REGION`（如 `ap-guangzhou`）。
  - 职责：按腾讯云 API v3（TC3-HMAC-SHA256）签名并请求 TTS，返回音频数据；可做限流、长度校验与 CORS 控制。
- API 约定：
  - 请求：`POST /api/tts`，JSON：`{ text: string, voice?: string, speed?: number }`。
  - 响应：`audio/mpeg`（二进制流）或 `{ audioBase64: string }`。
- 回退策略：
  - 当代理不可用/超限/网络异常时，前端回退到浏览器 Web Speech API 保证可用性。
- 结论：
  - 需要一个极薄的服务端函数来保护密钥，但前端仍然是单页面（SPA）。

## 部署
- Cloudflare Pages + Functions：静态资源部署在 Pages，使用 Functions 提供 `/api/tts` 代理到腾讯云。
- 或 Cloudflare Workers：静态资源托管在 Pages/任意 CDN，独立 Worker 提供 `/api/tts`。
- 本地开发：使用 `wrangler` 注入环境变量后运行 Functions/Worker；前端照常通过 `fetch('/api/tts')` 获取音频。

## 视觉风格
- 采用明亮配色方案（浅底深字），简洁清晰。
