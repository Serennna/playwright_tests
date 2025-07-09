const {test, expect} = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');

test.describe.skip('调试测试 - 元素定位', () => {
    let loginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.navigate();
    });

    test('调试：页面快照和所有输入框', async ({ page }) => {
        // 获取页面快照，包括所有 input 元素的详细信息
        await loginPage.debugPageSnapshot('login-page-inputs');
        
        // 暂停执行，可以手动检查浏览器
        // await loginPage.pause();
    });

    test('调试：分析用户名输入框', async ({ page }) => {
        // 测试当前的选择器
        await loginPage.debugElementAnalysis('input[type="username"]', '用户名输入框 - 当前选择器');
        
        // 测试其他可能的选择器
        await loginPage.debugElementAnalysis('input[type="text"]', '用户名输入框 - text 类型');
        await loginPage.debugElementAnalysis('input[type="email"]', '用户名输入框 - email 类型');
        await loginPage.debugElementAnalysis('input:not([type="password"])', '用户名输入框 - 非密码输入框');
        await loginPage.debugElementAnalysis('input:first-child', '用户名输入框 - 第一个输入框');
        await loginPage.debugElementAnalysis('input:nth-child(1)', '用户名输入框 - 第一个子元素');
        
        // 检查是否有 ID 或 name 属性
        const inputs = await loginPage.debugAllInputs();
        
        // 暂停查看结果
        // await loginPage.pause();
    });

    test('调试：分析密码输入框', async ({ page }) => {
        await loginPage.debugElementAnalysis('input[type="password"]', '密码输入框');
        
        // 检查密码切换按钮
        await loginPage.debugElementAnalysis('span[class="icon-ico-visibility_off"]', '密码切换按钮 - 隐藏状态');
        await loginPage.debugElementAnalysis('span[class="icon-ico-visibility"]', '密码切换按钮 - 显示状态');
        await loginPage.debugElementAnalysis('span[class*="visibility"]', '密码切换按钮 - 包含 visibility');
        
        // 暂停查看结果
        // await loginPage.pause();
    });

    test('调试：等待元素出现', async ({ page }) => {
        // 测试等待不同元素
        await loginPage.debugWaitForElement('input[type="username"]', '用户名输入框', 3000);
        await loginPage.debugWaitForElement('input[type="password"]', '密码输入框', 3000);
        await loginPage.debugWaitForElement('button:has-text("Sign in")', '登录按钮', 3000);
        
        // 测试等待不存在的元素
        await loginPage.debugWaitForElement('input[type="nonexistent"]', '不存在的输入框', 2000);
    });

    test('调试：逐步填写表单', async ({ page }) => {
        // 先分析页面状态
        await loginPage.debugPageSnapshot('before-fill');
        
        // 尝试填写用户名 - 使用不同的选择器
        console.log('\n🔍 尝试填写用户名...');
        
        // 方法1：使用当前选择器
        const usernameExists = await loginPage.debugElementExists('input[type="username"]');
        if (usernameExists) {
            await loginPage.enterUsername('admin');
            console.log('✅ 使用 input[type="username"] 成功');
        } else {
            console.log('❌ input[type="username"] 不存在，尝试其他选择器...');
            
            // 方法2：使用第一个 input
            const firstInput = await loginPage.debugElementExists('input:first-of-type');
            if (firstInput) {
                await loginPage.page.fill('input:first-of-type', 'admin');
                console.log('✅ 使用 input:first-of-type 成功');
            }
        }
        
        // 截图查看状态
        await loginPage.screenshot('after-username');
        
        // 尝试填写密码
        console.log('\n🔍 尝试填写密码...');
        await loginPage.debugElementAnalysis('input[type="password"]', '密码输入框');
        await loginPage.enterPassword('admin');
        
        // 截图查看状态
        await loginPage.screenshot('after-password');
        
        // 暂停查看结果
        // await loginPage.pause();
    });

    test('调试：手动探索模式', async ({ page }) => {
        console.log('\n🔍 手动探索模式启动...');
        console.log('💡 可以在控制台中使用以下方法：');
        console.log('   - await loginPage.debugAllInputs()');
        console.log('   - await loginPage.debugElementAnalysis("选择器", "描述")');
        console.log('   - await loginPage.debugPageSnapshot("名称")');
        console.log('   - await loginPage.screenshot("名称")');
        
        // 暂停执行，让你手动探索
        await loginPage.pause();
    });
}); 