const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/login_page');
const MentorSettingsPage = require('../pages/mentor/settings');
const { mentor_user} = require('../config/test_data');
const { BASE_URL_UI } = require('../config/api_config');

test.describe('Mentor - Settings Page - Tests', () => {
    let context;
    let page;
    let mentorSettingsPage;
    
    test.beforeAll(async ({ browser }) => {
        // 创建共享的浏览器上下文
        context = await browser.newContext();
        page = await context.newPage();
        
        // 登录
        const loginPage = new LoginPage(page, 'mentor');
        await loginPage.login(mentor_user.email, mentor_user.password);
        
        // 初始化页面对象
        mentorSettingsPage = new MentorSettingsPage(page);
        await mentorSettingsPage.navigate();
        mentorApi = new MentorsAPI(mentor_user.email, mentor_user.password);
        await mentorApi.login();
    });

    test.beforeEach(async ({ browser },) => {
        try {
            // 每次登录后，导航到测试页面
            await mentorSettingsPage.navigate();
        } catch (error) {
            // 如果导航失败（可能是前一个测试崩溃了），重新初始化
            console.log('Failed to navigate to mentor settings page...', error.message);
            
            // 安全关闭旧的上下文
            try {
                if (context) await context.close();
            } catch (closeError) {
                console.log('Error closing old context:', closeError.message);
            }
            
            // Re-create the browser instance
            context = await browser.newContext();
            page = await context.newPage();
            
            // Relogin
            const loginPage = new LoginPage(page, 'mentor');
            await loginPage.login(mentor_user.email, mentor_user.password)
            
            // Re-initialize the page object
            mentorSettingsPage = new MentorSettingsPage(page);
            await mentorSettingsPage.navigate();
        }
    });

    test.afterAll(async () => {
        await mentorApi.updateMentorName(mentor_user.id, mentor_user.name);
        try {
            if (context) {
                await context.close();

            }
        } catch (error) {
            // Context might already be closed, ignore the error
            console.log('Context cleanup error (probably already closed):', error.message);
        }
    });

    test('Mentor can access Settings page and elements are visible', async () => {
        
        test.step('Verify page labels are visible', async () => {
            await expect(mentorSettingsPage.selectors.accountSettingLabel).toBeVisible();
            await expect(mentorSettingsPage.selectors.nameLable).toBeVisible();
            await expect(mentorSettingsPage.selectors.emailLable).toBeVisible();
            await expect(mentorSettingsPage.selectors.passwordLable).toBeVisible();
            await expect(mentorSettingsPage.selectors.feesLabel).toBeVisible();
            await expect(mentorSettingsPage.selectors.phoneNumberLabel).toBeVisible();
        });

        test.step('Verify input fields have correct default values', async () => {
            // Wait for form to fully load
            await expect(mentorSettingsPage.selectors.nameInput).toBeVisible();
            await expect(mentorSettingsPage.selectors.emailInput).toBeVisible();
            await expect(mentorSettingsPage.selectors.feesInput).toBeVisible();
            
            // Verify the input values are correct
            await expect(mentorSettingsPage.selectors.nameInput).toHaveValue(mentor_user.name);
            await expect(mentorSettingsPage.selectors.emailInput).toHaveValue(mentor_user.email);
            await expect(mentorSettingsPage.selectors.feesInput).toHaveValue('100');
        });
    });

    test('Mentor can edit name', async () => {
        
        test.step('Enter edit mode for name field', async () => {
            await expect(mentorSettingsPage.selectors.nameEditButton).toBeVisible();
            await mentorSettingsPage.selectors.nameEditButton.click();
            
            // Verify name input is editable
            await expect(mentorSettingsPage.selectors.nameInput).toBeEditable();
        });

        test.step('Update name value', async () => {
            const newName = 'Updated Mentor Name';
            await mentorSettingsPage.selectors.nameInput.clear();
            await mentorSettingsPage.selectors.nameInput.fill(newName);
            
            // Verify the new value is entered
            await expect(mentorSettingsPage.selectors.nameInput).toHaveValue(newName);
        });

        test.step('Save changes', async () => {
            await expect(mentorSettingsPage.selectors.saveChangesbutton).toBeVisible();
            await mentorSettingsPage.selectors.saveChangesbutton.click();
            
            // Wait for save operation to complete
            await page.waitForTimeout(2000);
            
            // Could add verification for success message if available
            console.log('Name update completed');
        });
    });
 


})