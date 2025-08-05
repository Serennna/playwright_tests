const { test, expect } = require('@playwright/test');
const MenteeLoginPage = require('../pages/mentee_login_page');
const { mentee_login_data } = require('../config/test_data');
const CreditsPage = require('../pages/admin/credits');
const AdminApi = require('../helpers/admin_api');
test.describe('Admin - Credits Page Tests', () => {
    let context;
    let page;
    let creditsPage;
    let adminApi;
    
    test.beforeAll(async ({ browser }) => {
        // 创建共享的浏览器上下文
        context = await browser.newContext();
        page = await context.newPage();
        
        // 登录
        const loginPage = new MenteeLoginPage(page);
        await loginPage.loginWithRole(mentee_login_data.email, mentee_login_data.password, 'admin');
        await page.waitForLoadState('networkidle');
        
        // 初始化页面对象
        creditsPage = new CreditsPage(page);
        await creditsPage.waitForLoad();
        adminApi = new AdminApi(mentee_login_data.email, mentee_login_data.password);
        await adminApi.login();
    });

    test.beforeEach(async ({ browser }, testInfo) => {
        try {
            // 每个测试前导航到账户设置页面
            await creditsPage.goto(creditsPage.url);
            await creditsPage.waitForLoad();
        } catch (error) {
            // 如果导航失败（可能是前一个测试崩溃了），重新初始化
            console.log('页面导航失败，重新初始化会话...', error.message);
            // 安全关闭旧的上下文
            try {
                if (context) await context.close();
            } catch (closeError) {
                console.log('关闭旧上下文时出错:', closeError.message);
            }

            // 使用框架提供的 browser 实例重新创建
            context = await browser.newContext();
            page = await context.newPage();
            
            // 重新登录
            const loginPage = new MenteeLoginPage(page);
            await loginPage.loginWithRole(mentee_login_data.email, mentee_login_data.password, 'admin');
            await page.waitForLoadState('networkidle');
            
            // 重新初始化页面对象
            creditsPage = new CreditsPage(page);
            // 导航到目标页面
            await creditsPage.goto(creditsPage.url);
            await creditsPage.waitForLoad();
        }
    });

    test('First-come,first-served mode switch to cherry-pick mode', async () => {
        test.step('verify default status', async () => {
        const isFCFSModeSelected = await adminApi.getAllocationMode();
        expect(isFCFSModeSelected).toBe('fcfs');
        expect(await creditsPage.page.isVisible(creditsPage.selectors.totalUnallocatedColumn)).toBe(false);
        });

        test.step('switch to cherry-pick mode', async () => {
        await creditsPage.clickCherryPickButton();
        // modal not found
        await expect(creditsPage.page.locator(creditsPage.selectors.modalTitle)).toContainText('Switch to Cherry-pick');
        await expect(creditsPage.page.locator(creditsPage.selectors.modalContent)).toContainText('Are you sure you want to switch to the "Cherry-pick" mode?');
        await expect(creditsPage.page.locator(creditsPage.selectors.modalContent)).toContainText('You need to manually assign credits to selected mentees in your organization.');
        await creditsPage.page.click(creditsPage.selectors.confirmButton);
        await creditsPage.waitForLoad();
        expect(await creditsPage.page.isVisible(creditsPage.selectors.modalTitle)).toBe(false);
        });

        test.step('verify total unallocated column displayed', async () => {
        const isCherryPickModeSelected = await adminApi.getAllocationMode();
        expect(isCherryPickModeSelected).toBe('Cherry-pick');
        expect(await creditsPage.page.isVisible(creditsPage.selectors.totalUnallocatedColumn)).toBe(true);
        expect(await creditsPage.page.isVisible(creditsPage.selectors.monthlyQuotaInput)).toBe(true);
        });
    });

    test('Cherry-pick mode', async () => {
        await creditsPage.click(creditsPage.selectors.cherryPickButton);
        await creditsPage.waitForLoad();
    });

    test.afterAll(async () => {
            const response = await adminApi.setAllocationMode('fcfs');
        if (response.status === 200) {
            console.log('[Info]Set credit mode to fcfs:', response)
        } else {
            console.log('[Error]Failed to set credit mode to fcfs:', response)
        }
    });
});