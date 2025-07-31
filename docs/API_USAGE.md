# API 调用功能使用指南

本测试框架采用分离式架构，将 API 功能与 UI 页面对象完全分开，提供独立的 API 层进行接口调用和验证。

## 功能特性

- ✅ **分离式架构**：API 与 UI 完全解耦，各司其职
- ✅ 支持 GET, POST, PUT, DELETE 等 HTTP 方法
- ✅ 自动处理认证（Cookies）
- ✅ 请求和响应日志
- ✅ 重试机制和错误处理
- ✅ 超时配置
- ✅ 环境配置管理
- ✅ 批量操作支持
- ✅ 测试数据管理和清理
- ✅ 数据验证工具

## 文件结构

```
├── apis/
│   ├── base_api.js            # 基础 API 类
│   └── account_api.js         # 账户管理 API 类
├── config/
│   └── api_config.js          # API 配置文件
├── utils/
│   └── api_helper.js          # API 助手工具类
├── pages/
│   ├── base_page.js           # 基础页面类（纯 UI 操作）
│   └── admin/
│       └── account_setup.js   # 账户设置页面（纯 UI 操作）
└── tests/
    ├── account_setup.spec.js  # UI 测试文件（包含 API 验证）
    └── api/
        └── account_api.spec.js # 纯 API 测试文件
```

## 基础用法

### 1. 独立的 API 类使用

```javascript
// apis/account_api.js
class AccountApi extends BaseApi {
    
    // 通过 API 获取员工列表
    async getEmployees() {
        try {
            const response = await this.get(apiConfig.endpoints.employees);
            console.log(`✅ Got ${Array.isArray(response.data) ? response.data.length : 'unknown'} employees from API`);
            return response;
        } catch (error) {
            console.error('Failed to get employees from API:', error.message);
            throw error;
        }
    }

    // 通过 API 添加员工
    async addEmployee(name, email) {
        const employeeData = { name, email };
        const response = await this.post(apiConfig.endpoints.employees, employeeData);
        console.log(`✅ Added employee via API: ${name} (${email})`);
        return response;
    }
}
```

### 2. 在 UI 测试中集成 API 验证

```javascript
// tests/account_setup.spec.js
const AccountSetupPage = require('../pages/admin/account_setup');
const AccountApi = require('../apis/account_api');

test('Verify employee data consistency between UI and API', async () => {
    // 初始化 UI 页面对象和 API 客户端
    const accountSetupPage = new AccountSetupPage(page);
    const accountApi = new AccountApi(page);
    
    // 通过 UI 添加员工
    await accountSetupPage.AddEmployees();
    const nameValue = await accountSetupPage.page.inputValue(accountSetupPage.selectors.addEmployeeNameInput);
    const emailValue = await accountSetupPage.page.inputValue(accountSetupPage.selectors.addEmployeeEmailInput);
    
    await accountSetupPage.click(accountSetupPage.selectors.addEmployeeModalConfirm);
    
    // 通过 API 验证员工是否真的存在于数据库中
    const existsInDB = await accountApi.verifyEmployeeExists(emailValue);
    expect(existsInDB).toBe(true);
});
```

### 3. 纯 API 测试

```javascript
// tests/api/account_api.spec.js
const AccountApi = require('../../apis/account_api');

test('API: Add new employee', async () => {
    const accountApi = new AccountApi(page);
    
    // 添加新员工
    const testEmployee = {
        name: 'api-test-user',
        email: 'test@example.com'
    };

    const response = await accountApi.addEmployee(testEmployee.name, testEmployee.email);
    expect(response.status).toBe(200);
    
    // 验证员工已添加
    const exists = await accountApi.verifyEmployeeExists(testEmployee.email);
    expect(exists).toBe(true);
});
```

## API 方法说明

### BaseApi 基础 API 类

#### 基础 API 调用
```javascript
const accountApi = new AccountApi(page);

// 通用 API 调用
await accountApi.apiCall(method, endpoint, options)

// GET 请求
await accountApi.get(endpoint, options)

// POST 请求
await accountApi.post(endpoint, data, options)

// PUT 请求
await accountApi.put(endpoint, data, options)

// DELETE 请求
await accountApi.delete(endpoint, options)

// 带认证的 API 调用（自动包含 Cookies）
await accountApi.authenticatedCall(method, endpoint, options)
```

#### 示例
```javascript
const accountApi = new AccountApi(page);

// GET 请求
const response = await accountApi.get('/employees');

// POST 请求
const userData = { name: 'John', email: 'john@example.com' };
const response = await accountApi.post('/employees', userData);

// 验证响应
const errors = accountApi.validateResponse(response, ['id', 'name', 'email']);
expect(errors.length).toBe(0);
```

### AccountApi 专用方法

#### 员工管理
```javascript
const accountApi = new AccountApi(page);

// 获取员工列表
await accountApi.getEmployees()

// 根据 ID 获取员工信息
await accountApi.getEmployeeById(employeeId)

// 根据邮箱查找员工
await accountApi.findEmployeeByEmail(email)

// 添加员工
await accountApi.addEmployee(name, email)

// 更新员工信息
await accountApi.updateEmployee(employeeId, updateData)

// 删除员工
await accountApi.deleteEmployee(employeeId)

// 设置员工为管理员
await accountApi.setEmployeeAsAdmin(employeeId, isAdmin)
```

#### 验证和查询
```javascript
// 验证员工是否存在
await accountApi.verifyEmployeeExists(email)

// 获取员工总数
await accountApi.getEmployeeCount()

// 等待员工总数达到预期值
await accountApi.waitForEmployeeCount(expectedCount, timeout)
```

#### 批量操作
```javascript
// 批量添加员工
const employees = [
    { name: 'User1', email: 'user1@example.com' },
    { name: 'User2', email: 'user2@example.com' }
];
await accountApi.batchAddEmployees(employees)

// 批量删除员工
await accountApi.batchDeleteEmployees([id1, id2, id3])
```

#### 测试数据管理
```javascript
// 创建单个测试员工
await accountApi.createTestEmployee('test')

// 批量创建测试员工
await accountApi.createTestEmployees(5, 'test')

// 清理测试数据
await accountApi.cleanupTestEmployees()
```

#### 数据验证
```javascript
// 验证员工数据完整性
const errors = accountApi.validateEmployeeData(employee, ['id', 'name', 'email']);

// 比较两个员工对象
const differences = accountApi.compareEmployees(employee1, employee2, ['name', 'email']);
```

## 配置管理

### API 配置文件 (config/api_config.js)

```javascript
module.exports = {
    // 不同环境的 API URL
    baseUrl: {
        development: 'https://ohhello-dev-909a7.web.app/api',
        staging: 'https://ohhello-staging-909a7.web.app/api',
        production: 'https://ohhello-prod-909a7.web.app/api'
    },

    // 端点配置
    endpoints: {
        employees: '/employees',
        employeeById: (id) => `/employees/${id}`,
        employeeByEmail: (email) => `/employees?email=${encodeURIComponent(email)}`
    },

    // 超时和重试配置
    timeout: { default: 30000 },
    retry: { times: 3, delay: 1000 }
};
```

### 环境切换

通过设置环境变量来切换 API 环境：

```bash
# 开发环境
NODE_ENV=development npm test

# 预发布环境  
NODE_ENV=staging npm test

# 生产环境
NODE_ENV=production npm test
```

## 高级用法

### 1. 使用 API 助手工具类

```javascript
const ApiHelper = require('../utils/api_helper');

test('Batch operations with API helper', async () => {
    const apiHelper = new ApiHelper(page);
    
    // 批量创建测试用户
    const results = await apiHelper.batchCreateTestUsers(5);
    expect(results.filter(r => r.success).length).toBe(5);
    
    // 清理测试数据
    const deletedCount = await apiHelper.cleanupAllTestUsers();
    console.log(`Cleaned up ${deletedCount} test users`);
});
```

### 2. UI 和 API 数据一致性验证

```javascript
test('Compare UI and API data consistency', async () => {
    const apiHelper = new ApiHelper(page);
    
    // 从 UI 获取数据
    const uiEmployeeCount = await accountSetupPage.getTotalEmployeeCount();
    
    // 从 API 获取数据
    const apiEmployeeCount = await accountSetupPage.getEmployeeCountFromAPI();
    
    // 比较一致性
    expect(apiEmployeeCount).toBe(uiEmployeeCount);
});
```

### 3. 测试数据准备和清理

```javascript
test.beforeEach(async () => {
    // 准备测试数据
    await accountSetupPage.addEmployeeViaAPI('Test User', 'test@example.com');
});

test.afterEach(async () => {
    // 清理测试数据
    await accountSetupPage.cleanupTestEmployees();
});
```

## 响应格式

API 方法返回统一的响应格式：

```javascript
{
    status: 200,                    // HTTP 状态码
    statusText: 'OK',              // 状态文本
    headers: {...},                // 响应头
    data: {...},                   // 响应数据（JSON 或文本）
    response: originalResponse     // 原始响应对象
}
```

## 错误处理

API 调用会自动处理错误并提供详细的日志：

```javascript
try {
    const response = await accountSetupPage.getEmployeesFromAPI();
    // 处理成功响应
} catch (error) {
    console.error('API call failed:', error.message);
    // 处理错误情况
}
```

## 日志输出

框架会自动输出详细的 API 调用日志：

```
[API] GET https://ohhello-dev-909a7.web.app/api/employees
[API] Response status: 200
[API] Response data: [{"id": 1, "name": "John", "email": "john@example.com"}]
```

## 最佳实践

1. **环境隔离**：使用不同的 API 环境进行测试
2. **数据清理**：测试后及时清理创建的测试数据
3. **错误处理**：妥善处理 API 调用可能的错误
4. **认证管理**：确保 API 调用包含正确的认证信息
5. **并发控制**：避免并发测试之间的数据冲突
6. **验证完整性**：同时验证 UI 和 API 的数据一致性

## 常见问题

### Q: API 端点还没有实现怎么办？
A: 代码已经包含了错误处理，会显示友好的提示信息，不会影响其他测试的运行。

### Q: 如何处理认证？
A: 框架会自动从当前页面获取 Cookies 并添加到 API 请求中，支持基于 Session 的认证。

### Q: 如何自定义 API 配置？
A: 修改 `config/api_config.js` 文件中的配置，包括 URL、端点、超时等。

### Q: 如何添加新的 API 方法？
A: 在相应的页面对象类中添加新方法，使用 `this.authenticatedApiCall()` 进行 API 调用。

这个 API 功能为测试框架提供了强大的数据验证能力，让测试更加全面和可靠！