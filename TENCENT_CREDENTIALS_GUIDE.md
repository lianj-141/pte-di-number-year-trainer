# 腾讯云密钥获取详细指南

## 你现有的密钥说明

你提到有 **APPID** 和 **SecretId**，这是好的开始！但我们还需要：

- ✅ **SecretId** - 你已经有了
- ❌ **SecretKey** - 还需要获取
- ✅ **APPID** - 你已经有了（不过这个项目不需要）

## 🔑 获取完整密钥的方法

### 方法 1：从现有的 SecretId 查看对应的 SecretKey

1. **登录腾讯云控制台**：https://console.cloud.tencent.com/
2. **进入访问管理**：https://console.cloud.tencent.com/cam/capi
3. **查看 API 密钥**：
   - 在"API密钥管理"页面
   - 找到你的 SecretId（应该以 `AKID` 开头）
   - 点击"显示"查看对应的 **SecretKey**（以 `xxx` 显示的部分）

### 方法 2：创建新的 API 密钥对（推荐）

如果找不到现有的 SecretKey，可以创建新的：

1. **访问 API 密钥管理**：https://console.cloud.tencent.com/cam/capi
2. **点击"新建密钥"**
3. **完成身份验证**（可能需要微信或短信验证）
4. **获得新的密钥对**：
   - **SecretId**：类似 `AKIDxxxxxxxxxxxxxxxx`
   - **SecretKey**：类似 `xxxxxxxxxxxxxxxx`

## 📋 部署时需要的环境变量

在 Cloudflare Workers 中设置：

| 变量名 | 值 | 类型 | 说明 |
|--------|----|----|------|
| `TENCENT_SECRET_ID` | 你的 SecretId | Secret | 以 AKID 开头的字符串 |
| `TENCENT_SECRET_KEY` | 你的 SecretKey | Secret | 对应的密钥 |
| `TENCENT_REGION` | `ap-guangzhou` | Text | 服务区域 |

## 🚨 重要提醒

### 关于 APPID
- **APPID** 是腾讯云账号 ID，通常在一些服务中需要
- **但在我们的 TTS 项目中不需要 APPID**
- 我们只需要 **SecretId** 和 **SecretKey**

### 安全注意事项
1. **SecretKey 非常重要**，不要泄露给他人
2. **不要**把密钥写在代码中或上传到 GitHub
3. 只在 Cloudflare Workers 的 **"Secret"** 类型变量中设置

## 🛠️ 确保 TTS 服务已开通

在获取密钥后，还需要确保：

1. **开通语音合成服务**：
   - 访问：https://console.cloud.tencent.com/tts
   - 如果没有开通，点击"立即开通"
   - 选择按量计费（有免费额度）

2. **检查服务状态**：
   - 在 TTS 控制台能看到"服务已开通"
   - 可以看到免费额度和使用情况

## 📱 获取步骤截图说明

### 步骤详解：
1. **登录腾讯云** → 右上角头像 → 访问管理
2. **访问管理** → API密钥管理
3. **查看现有密钥** → 找到你的 SecretId → 显示 SecretKey
4. **如果没有** → 新建密钥 → 完成验证 → 获得密钥对

## ❓ 常见问题

**Q: 我忘记了 SecretKey 怎么办？**
A: SecretKey 无法找回，只能重新创建 API 密钥对。

**Q: 一个账号可以有多个密钥吗？**
A: 可以，最多创建 2 个 API 密钥对。

**Q: 密钥有有效期吗？**
A: 没有有效期，但建议定期更换。

**Q: APPID 在哪里看？**
A: 登录腾讯云控制台 → 右上角头像 → 账号信息，里面有 APPID。

## 🎯 总结

你需要准备：
- ✅ **SecretId**（你已有）
- ❌ **SecretKey**（需要获取）
- ❌ **确保 TTS 服务已开通**

获取到这两个密钥后，就可以按照 WORKERS_DEPLOYMENT.md 继续部署了！