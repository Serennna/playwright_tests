const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/login_page');
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
        const loginPage = new LoginPage(page);
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
        
        test.step('Verify initial FCFS mode is active', async () => {
            const currentMode = await adminApi.getAllocationMode();
            expect(currentMode).toBe('fcfs');
            expect(await creditsPage.page.isVisible(creditsPage.selectors.totalUnallocatedColumn)).toBe(false);
        });

        test.step('Switch to cherry-pick mode via confirmation modal', async () => {
            await creditsPage.clickCherryPickButton();
            
            // Verify modal appears with correct content
            await expect(creditsPage.page.locator(creditsPage.selectors.modalTitle)).toBeVisible();
            await expect(creditsPage.page.locator(creditsPage.selectors.modalTitle)).toContainText('Cherry-pick');
            await expect(creditsPage.page.locator(creditsPage.selectors.modalContent)).toContainText('Are you sure you want to switch to the "Cherry-pick" mode?');
            await expect(creditsPage.page.locator(creditsPage.selectors.modalContent)).toContainText('You need to manually assign credits to selected mentees in your organization.');
            
            // Confirm the switch
            await creditsPage.clickConfirmButton();
            await creditsPage.waitForLoad();
            
            // Verify modal is dismissed
            expect(await creditsPage.page.isVisible(creditsPage.selectors.modalTitle)).toBe(false);
        });

        test.step('Verify cherry-pick mode features are now visible', async () => {
            // Verify mode switch was successful via API
            const updatedMode = await adminApi.getAllocationMode('Cherry-pick', 5000);
            expect(updatedMode).toBe('Cherry-pick');
            
            // Verify UI elements for cherry-pick mode are visible
            expect(await creditsPage.page.isVisible(creditsPage.selectors.totalUnallocatedColumn)).toBe(true);
            expect(await creditsPage.page.isVisible(creditsPage.selectors.monthlyQuotaInput)).toBe(true);
        });
    });

    test('Switch to cherry-pick mode and work with cherry-pick mode', async () => {
        let initialCredits;

        // Helper function to get credits value
        const getCreditsValue = async () => {
            const creditsTextLocator = creditsPage.selectors.totalUnallocatedColumn.locator('xpath=preceding-sibling::div[1]');
            await creditsTextLocator.waitFor({ state: 'visible', timeout: 5000 });
            await creditsPage.page.waitForTimeout(1500); // 给页面充足的渲染时间
            
            const creditsText = await creditsTextLocator.innerText();
            const creditsNumber = parseInt(creditsText.replace('Credits', '').trim(), 10);
            
            if (isNaN(creditsNumber)) {
                throw new Error(`Invalid credits value: "${creditsText}"`);
            }
            
            return creditsNumber;
        };
        
        test.step('Switch to cherry-pick mode', async () => {
            await creditsPage.clickCherryPickButton();
            await expect(creditsPage.page.locator(creditsPage.selectors.modalTitle)).toBeVisible();
            await creditsPage.clickConfirmButton();
            await creditsPage.waitForLoad();
            
            // Verify Total Unallocated column is now visible
            await expect(creditsPage.selectors.totalUnallocatedColumn).toBeVisible();
        });

        test.step('Record initial credits value', async () => {
            initialCredits = await getCreditsValue();
            console.log(`Initial credits: ${initialCredits}`);
            expect(initialCredits).toBeGreaterThanOrEqual(0);
        });

        test.step('Add monthly quota', async () => {
            await creditsPage.selectors.addQuotaButton.click();
            const noticeMessage = await creditsPage.getNoticeMessage();
            expect(noticeMessage).toContain('Changes Saved');
        });

        test.step('Verify credits decreased after quota addition', async () => {
            // Reload page to get updated credits
            await creditsPage.page.reload();
            await expect(creditsPage.selectors.totalUnallocatedColumn).toBeVisible();

            // Get updated credits value
            const newCreditsNumber = await getCreditsValue();
            
            console.log(`Credits after quota addition: ${newCreditsNumber}, expected: ${initialCredits - 1}`);
            expect(newCreditsNumber).toBe(initialCredits - 1);
        });
    });

    test.afterAll(async () => {
            const response = await adminApi.setAllocationMode('fcfs');
        if (response.status === 200) {
            console.log('[Info]Set credit mode to default mode:', response)
        } else {
            console.log('[Error]Failed to set credit mode to default mode:', response)
        }
    });
});