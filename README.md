# Playwright 测试项目

这是一个基于 Playwright 的端到端测试框架，集成了 UI 测试和 API 验证功能。

## 主要特性

- ✅ **UI 自动化测试**：支持跨浏览器的 UI 自动化测试
- ✅ **API 集成验证**：在 UI 测试中调用 API 进行数据验证
- ✅ **JWT 认证支持**：自动处理 JWT token 和 Cookie 认证
- ✅ **分离式架构**：UI 和 API 完全解耦，易于维护
- ✅ **自动截图**：测试失败时自动截图保存
- ✅ **分页处理**：完整的 antd 表格分页验证支持
- ✅ **测试数据管理**：自动清理测试数据
- ✅ **环境配置**：支持多环境 API 配置

## 运行测试

```bash
# 基础测试命令
npm test                # 运行所有测试并生成报告
npm run test:headed     # 有头模式运行测试
npm run test:debug      # 调试模式运行测试
npm run test:ui         # UI 模式运行测试（交互式）

# 测试报告相关
npm run test:report     # 运行测试并自动打开报告
npm run show-report     # 查看最新的测试报告
npm run clean-reports   # 清理所有报告文件

# 专门的测试类型
npm run test:api        # 只运行 API 测试
npm run test:ui-only    # 只运行 UI 测试

# 指定环境运行
NODE_ENV=development npm test   # 开发环境
NODE_ENV=staging npm test       # 预发布环境
```

## 测试报告

框架会自动生成多种格式的测试报告：

- 📊 **HTML 报告**：美观的网页报告，包含详细的测试结果和截图
- 📄 **JSON 报告**：结构化数据，用于 CI/CD 集成
- 📋 **JUnit 报告**：XML 格式，兼容 Jenkins 等 CI 系统

```bash
# 查看 HTML 报告
npm run show-report

# 报告文件位置
playwright-report/index.html    # HTML 报告
test-results.json              # JSON 报告
junit-results.xml              # JUnit 报告
```

## 失败时自动截图功能

### 功能说明
- 测试失败时会自动截图
- 截图保存到 `failed-screenshots` 文件夹
- 每个失败的测试都会生成对应的截图文件

### 使用方法
1. 运行 `npm test`
2. 如果有测试失败，会自动在 `failed-screenshots` 文件夹中生成截图
3. 截图文件名包含测试名称和时间戳

### 示例
运行测试后，失败的测试会在 `failed-screenshots` 文件夹中生成类似这样的文件：
```
failed-screenshots/
├── chromium/
│   ├── 简单测试-故意失败的测试-会自动截图/
│   │   └── test-failed-1.png
│   └── ...
```

## API 功能

### 快速开始

独立的 API 类调用：

```javascript
// 初始化 API 客户端
const accountApi = new AccountApi(page);

// 自动认证（框架会自动获取 JWT token）
const existsInDB = await accountApi.verifyEmployeeExists(email);
expect(existsInDB).toBe(true);

// 手动设置 JWT token（如果需要）
accountApi.setAuthToken('your-jwt-token-here');
const response = await accountApi.setEmployeesAsAdmins([1152]);

// 通过 API 获取员工总数并与 UI 对比
const apiCount = await accountApi.getEmployeeCount();
const uiCount = await accountSetupPage.getTotalEmployeeCount();
expect(apiCount).toBe(uiCount);
```

### 主要 API 方法

**基础操作：**
- `getEmployees()` - 获取员工列表
- `addEmployee(name, email)` - 添加员工
- `findEmployeeByEmail(email)` - 根据邮箱查找员工
- `deleteEmployee(employeeId)` - 删除员工
- `setEmployeeAsAdmin(employeeId)` - 设置为管理员

**验证方法：**
- `verifyEmployeeExists(email)` - 验证员工存在
- `getEmployeeCount()` - 获取员工总数
- `waitForEmployeeCount(count)` - 等待员工数量

**测试数据：**
- `createTestEmployee(prefix)` - 创建测试员工
- `batchAddEmployees(employees)` - 批量添加员工
- `cleanupTestEmployees()` - 清理测试数据

**认证方法：**
- `setAuthToken(token)` - 手动设置 JWT token
- `getAuthHeaders()` - 获取当前认证头信息
- 自动获取浏览器中的 token（localStorage/sessionStorage）

详细使用说明请查看：
- [API 使用指南](docs/API_USAGE.md)
- [JWT 认证指南](docs/JWT_AUTH_GUIDE.md) 
- [测试报告指南](docs/REPORTS_GUIDE.md)
- [测试隔离指南](docs/TEST_ISOLATION_GUIDE.md)
- [架构设计说明](docs/ARCHITECTURE.md)

## 项目结构

```
playwright_tests/
├── tests/
│   ├── account_setup.spec.js      # UI 测试（包含 API 验证）
│   └── api/
│       └── account_api.spec.js    # 纯 API 测试
├── pages/
│   ├── base_page.js               # 基础页面类（纯 UI 操作）
│   ├── mentee_login_page.js       # 登录页面
│   └── admin/
│       └── account_setup.js       # 账户设置页面（纯 UI 操作）
├── apis/
│   ├── base_api.js                # 基础 API 类
│   └── account_api.js             # 账户管理 API 类
├── config/
│   ├── test_data.js               # 测试数据配置
│   └── api_config.js              # API 配置文件
├── utils/
│   ├── test_hooks.js              # 测试钩子
│   ├── assert_events.js           # 事件断言
│   └── api_helper.js              # API 助手工具类
├── docs/
│   ├── API_USAGE.md               # API 使用指南
│   ├── JWT_AUTH_GUIDE.md          # JWT 认证指南
│   ├── REPORTS_GUIDE.md           # 测试报告指南
│   ├── TEST_ISOLATION_GUIDE.md    # 测试隔离指南
│   └── ARCHITECTURE.md            # 架构设计说明
├── failed-screenshots/             # 失败时截图文件夹
├── playwright.config.js           # Playwright 配置文件
└── package.json
```

## antd 表格分页验证

框架支持完整的 antd 表格分页验证功能：

- ✅ 自动检测是否有分页
- ✅ 解析 "Total X items" 等分页文字
- ✅ 通过搜索功能跨页面验证数据
- ✅ 支持中英文分页文字格式

```javascript
// 智能处理分页表格的数据验证
const hasPagination = await accountSetupPage.hasPagination();
if (hasPagination) {
    // 通过总数验证
    const totalCount = await accountSetupPage.getTotalEmployeeCount();
    // 通过搜索验证具体数据
    const found = await accountSetupPage.searchForEmployee(email);
} else {
    // 直接检查当前页
    const found = await accountSetupPage.isEmployeeInTable(name, email);
}
```

## 环境配置

支持多环境 API 配置，通过环境变量切换：

```bash
# 开发环境（默认）
npm test

# 预发布环境
NODE_ENV=staging npm test

# 生产环境
NODE_ENV=production npm test
```

API 配置文件位于 `config/api_config.js`，可以配置不同环境的 API 地址、超时时间、重试次数等。

现在这个测试框架不仅能进行 UI 测试，还能通过 API 验证数据的真实性，让测试更加可靠！ 