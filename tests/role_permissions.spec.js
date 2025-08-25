const { test, expect } = require('@playwright/test');
const MenteeLoginPage = require('../pages/mentee_login_page');
const { admin_user, owner_user, mentee_role_user} = require('../config/test_data');
const { BASE_URL_UI } = require('../config/api_config');

test.describe('Admin - Role Permissions Tests', () => {
    let context;
    let page;
    let creditsPage;
    let adminApi;
    
    test.beforeAll(async ({ browser }) => {
        // 创建共享的浏览器上下文
        context = await browser.newContext();
        page = await context.newPage();
        
    })

    test('Admin can not access Credits page', async () => {
        // login with admin role
        const adminLoginPage = new MenteeLoginPage(page);
        await adminLoginPage.loginWithRole(admin_user.email, admin_user.password, 'admin');
        await page.waitForURL(`${BASE_URL_UI}/admin/dashboard`);
        
        await expect(page.getByRole('link', { name: 'Credits' })).toHaveCount(0);

        await page.goto(`${BASE_URL_UI}/admin/credits`);
        await expect(page.locator('text=403')).toBeVisible();
        // 确认不出现 Credits UI
        await expect(page.locator('div:has-text("Sorry, you are not authorized to access this page.")')).toBeVisible();
            
    });

    test('Admin can not access Subscription page', async () => {
        // login with admin role
        const adminLoginPage = new MenteeLoginPage(page);
        await adminLoginPage.loginWithRole(admin_user.email, admin_user.password, 'admin');
        await page.waitForURL(`${BASE_URL_UI}/admin/dashboard`);

        await expect(page.getByRole('link', { name: 'Subscription' })).toHaveCount(0);

        await page.goto(`${BASE_URL_UI}/admin/subscription`);        await expect(page.locator('text=403')).toBeVisible();
        // 确认不出现 Subscription UI
        await expect(page.locator('div:has-text("Sorry, you are not authorized to access this page.")')).toBeVisible;
    });

    test('Owner can access Credits page', async () => {
        // login with owner role
        const ownerLoginPage = new MenteeLoginPage(page);
        await ownerLoginPage.loginWithRole(owner_user.email, owner_user.password, 'admin');
        await page.waitForLoadState('networkidle');
        await expect(page.getByRole('link', { name: 'Credits' })).toBeVisible();

        const currentUrl = page.url();
        await page.goto(currentUrl+'/credits');
        await expect(page.locator('text=403')).toHaveCount(0);
        await expect(page.locator('div:has-text("Sorry, you are not authorized to access this page.")')).toHaveCount(0);
    });

    test('Owner can access Subscription page', async () => {
        // login with owner role
        const ownerLoginPage = new MenteeLoginPage(page);
        await ownerLoginPage.loginWithRole(owner_user.email, owner_user.password, 'admin');
        await page.waitForLoadState('networkidle');
        await expect(page.getByRole('link', { name: 'Subscription' })).toBeVisible();

        const currentUrl = page.url();
        await page.goto(currentUrl+'/subscription');
        await expect(page.locator('text=403')).toHaveCount(0);
        await expect(page.locator('div:has-text("Sorry, you are not authorized to access this page.")')).toHaveCount(0);

    });

    test('User with only one mentee role do not display role switch button', async () => {
        // login with mentee role
        const menteeLoginPage = new MenteeLoginPage(page);
        await menteeLoginPage.login(mentee_role_user.email, mentee_role_user.password);
        await page.waitForURL(`${BASE_URL_UI}/mentee/find_mentors/mentors`);
        // verify the user is not redirected to the multiple role switch pages
        await expect(page.url()).not.toContain('multiple_role_switch');
        // verify the user is redirected to the find mentors page
        await expect(page.url()).toContain('/mentee/find_mentors/mentors');
        
    });


})