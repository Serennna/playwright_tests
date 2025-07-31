# JWT Token 认证使用指南

基于您提供的真实 API 请求，本指南展示如何在测试框架中正确携带 `authorization` header。

## 🔑 您的 API 请求分析

```bash
curl 'https://ohhello-dev-909a7.web.app/api/v1/roles/admins' \
  -X 'PUT' \
  -H 'authorization: eyJhbGciOiJSUzI1NiIs...' \
  --data-raw '[1152]'
```

**关键信息：**
- 端点：`/api/v1/roles/admins`
- 方法：`PUT`
- 认证：JWT token 在 `authorization` header 中
- 数据：员工 ID 数组 `[1152]`

## 🚀 使用方法

### 方法 1：自动获取 Token（推荐）

框架会自动从浏览器存储中获取 token：

```javascript
const { test, expect } = require('@playwright/test');
const AccountApi = require('../apis/account_api');

test('自动认证示例', async ({ page }) => {
    // 先登录获取 token
    // ... 登录操作 ...
    
    // 初始化 API 客户端
    const accountApi = new AccountApi(page);
    
    // API 会自动获取 localStorage/sessionStorage 中的 token
    const response = await accountApi.setEmployeesAsAdmins([1152]);
    expect(response.status).toBe(200);
});
```

### 方法 2：手动设置 Token

如果需要使用特定的 token：

```javascript
test('手动认证示例', async ({ page }) => {
    const accountApi = new AccountApi(page);
    
    // 手动设置您的 JWT token
    const jwtToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ijk1MW...';
    accountApi.setAuthToken(jwtToken);
    
    // 现在所有 API 调用都会使用这个 token
    const response = await accountApi.setEmployeesAsAdmins([1152]);
    expect(response.status).toBe(200);
});
```

### 方法 3：从页面获取 Token

```javascript
test('从页面获取 token', async ({ page }) => {
    // 从页面 localStorage 获取 token
    const token = await page.evaluate(() => {
        return localStorage.getItem('access_token') || 
               localStorage.getItem('authToken') || 
               localStorage.getItem('token');
    });
    
    const accountApi = new AccountApi(page);
    if (token) {
        accountApi.setAuthToken(token);
    }
    
    const response = await accountApi.setEmployeesAsAdmins([1152]);
    expect(response.status).toBe(200);
});
```

## 🛠️ API 方法说明

### 设置员工为管理员

```javascript
// 设置单个员工为管理员
await accountApi.setEmployeeAsAdmin(1152);

// 设置多个员工为管理员（对应您的 curl 命令）
await accountApi.setEmployeesAsAdmins([1152, 1153, 1154]);

// 完整示例
const accountApi = new AccountApi(page);
accountApi.setAuthToken('your-jwt-token');

const response = await accountApi.setEmployeesAsAdmins([1152]);
console.log('设置结果:', response.status); // 200 表示成功
```

### 获取用户列表

```javascript
// 获取用户列表（分页）
const users = await accountApi.getUsers(1, 10, ''); // 第1页，每页10条，无关键词搜索
```

## 🔍 认证头自动处理

框架会按以下优先级处理认证：

1. **手动设置的 JWT token**（最高优先级）
2. **页面 localStorage/sessionStorage 中的 token**
3. **浏览器 cookies**（兜底方案）

```javascript
// 认证头处理逻辑
async getAuthHeaders() {
    // 1. 手动设置的 token
    if (this.authToken) {
        return { 'Authorization': `Bearer ${this.authToken}` };
    }
    
    // 2. 页面存储的 token
    const token = await page.evaluate(() => localStorage.getItem('token'));
    if (token) {
        return { 'Authorization': `Bearer ${token}` };
    }
    
    // 3. 浏览器 cookies
    const cookies = await page.context().cookies();
    return { 'Cookie': cookies.map(c => `${c.name}=${c.value}`).join('; ') };
}
```

## 🧪 完整测试示例

```javascript
const { test, expect } = require('@playwright/test');
const AccountApi = require('../apis/account_api');
const MenteeLoginPage = require('../pages/mentee_login_page');

test.describe('管理员设置测试', () => {
    let accountApi;
    
    test.beforeAll(async ({ browser }) => {
        const page = await browser.newPage();
        
        // 登录获取认证
        const loginPage = new MenteeLoginPage(page);
        await loginPage.loginWithRole('admin@example.com', 'password', 'admin');
        
        // 初始化 API 客户端
        accountApi = new AccountApi(page);
    });

    test('设置员工为管理员', async () => {
        // 对应您的 curl 命令：设置员工 1152 为管理员
        const response = await accountApi.setEmployeesAsAdmins([1152]);
        
        expect(response.status).toBe(200);
        console.log('✅ 员工 1152 已设置为管理员');
    });

    test('批量设置管理员', async () => {
        // 批量设置多个员工为管理员
        const employeeIds = [1152, 1153, 1154];
        const response = await accountApi.setEmployeesAsAdmins(employeeIds);
        
        expect(response.status).toBe(200);
        console.log(`✅ 已设置 ${employeeIds.length} 个员工为管理员`);
    });
});
```

## 🔧 调试技巧

### 查看认证头信息

```javascript
test('查看认证信息', async ({ page }) => {
    const accountApi = new AccountApi(page);
    
    // 查看当前使用的认证头
    const authHeaders = await accountApi.getAuthHeaders();
    console.log('认证头:', authHeaders);
    
    if (authHeaders.Authorization) {
        console.log('✅ 使用 JWT token 认证');
    } else if (authHeaders.Cookie) {
        console.log('✅ 使用 Cookie 认证');
    } else {
        console.log('❌ 未找到认证信息');
    }
});
```

### 测试 Token 有效性

```javascript
test('测试 token 有效性', async ({ page }) => {
    const accountApi = new AccountApi(page);
    
    try {
        const response = await accountApi.getUsers(1, 1, '');
        if (response.status === 200) {
            console.log('✅ Token 有效');
        } else if (response.status === 401) {
            console.log('❌ Token 无效或已过期');
        }
    } catch (error) {
        console.log('❌ 认证失败:', error.message);
    }
});
```

## 📝 注意事项

1. **Token 过期**：JWT token 有有效期，过期后需要重新获取
2. **安全性**：不要在代码中硬编码真实的 token
3. **环境变量**：可以通过环境变量传递 token
4. **自动刷新**：实际项目中可能需要 token 自动刷新机制

```javascript
// 使用环境变量传递 token
const jwtToken = process.env.JWT_TOKEN || 'default-token';
accountApi.setAuthToken(jwtToken);
```

现在您可以轻松地在测试中使用带 JWT token 认证的 API 调用了！🎉