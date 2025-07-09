# Playwright 测试项目

## 运行测试

```bash
npm test                # 运行所有测试
npm run test:headed     # 有头模式运行测试
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

## 项目结构

```
playwright_tests/
├── tests/
│   ├── simple-test.spec.js    # 示例测试文件
│   └── login.spec.js          # 登录测试
├── failed-screenshots/         # 失败时截图文件夹
├── playwright.config.js       # 配置文件
└── package.json
```

就这么简单！现在所有测试失败时都会自动截图保存到指定文件夹。 