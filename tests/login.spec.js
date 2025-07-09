const {test, expect} = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');

test.describe('Login Page Tests', () => {
    let loginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.navigate();
        await loginPage.waitForPageLoad();
    });

    test('password should be visible after toggle', async ({ page }) => {
        await loginPage.enterUsername('username');
        await loginPage.enterPassword('password');      
        expect(await loginPage.isPasswordVisible()).toBe(false);
        
        await loginPage.togglePasswordVisibility();
        expect(await loginPage.isPasswordVisible()).toBe(true);
    });

    test('login page elements are visible', async ({ page }) => {
        // Check if the page is loaded
        expect(await loginPage.isPageLoaded()).toBe(true);
        
        // Check the page title
        const title = await loginPage.getTitle();
        expect(title).toContain('Log in');
        
        // Check if the key elements are visible
        expect(await loginPage.isVisible(loginPage.selectors.usernameInput)).toBe(true);
        expect(await loginPage.isVisible(loginPage.selectors.passwordInput)).toBe(true);
        expect(await loginPage.isVisible(loginPage.selectors.signInButton)).toBe(true);
    });


    // test('debug mode test', async ({ page }) => {
    //     // 这个测试专门用于调试
        
    //     // 暂停执行，可以手动操作浏览器
    //     // await loginPage.pause();
        
    //     // 输入测试数据
    //     await loginPage.enterUsername('test@example.com');
    //     await loginPage.enterPassword('testpassword');
        
    //     // 截图
    //     await loginPage.screenshot('debug-filled-form');
        
    //     // 获取密码类型
    //     const passwordType = await loginPage.getPasswordInputType();
    //     console.log('Password input type:', passwordType);
        
    //     // 切换密码可见性
    //     await loginPage.togglePasswordVisibility();
        
    //     // 再次获取密码类型
    //     const newPasswordType = await loginPage.getPasswordInputType();
    //     console.log('New password input type:', newPasswordType);
        
    //     // 验证变化
    //     expect(passwordType).toBe('password');
    //     expect(newPasswordType).toBe('text');
    // });
});