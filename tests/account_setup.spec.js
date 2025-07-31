const { test, expect } = require('@playwright/test');
const MenteeLoginPage = require('../pages/mentee_login_page');
const AccountSetupPage = require('../pages/admin/account_setup');
const AccountApi = require('../apis/account_api');
const { mentee_login_data } = require('../config/test_data');

test.describe('Admin - Account Setup Page Tests', () => {
    let context;
    let page;
    let accountSetupPage;
    let accountApi;
    
    test.beforeAll(async ({ browser }) => {
        // 创建共享的浏览器上下文
        context = await browser.newContext();
        page = await context.newPage();
        
        // 登录
        const loginPage = new MenteeLoginPage(page);
        await loginPage.loginWithRole(mentee_login_data.email, mentee_login_data.password, 'admin');
        await page.waitForLoadState('networkidle');
        
        // 初始化页面对象
        accountSetupPage = new AccountSetupPage(page);
        accountApi = new AccountApi(page);
    });

    test.beforeEach(async ({ browser }, testInfo) => {
        try {
            // 每个测试前导航到账户设置页面
            await accountSetupPage.goto(accountSetupPage.url);
            await accountSetupPage.waitForLoad();
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
            accountSetupPage = new AccountSetupPage(page);
            accountApi = new AccountApi(page);
            
            // 导航到目标页面
            await accountSetupPage.goto(accountSetupPage.url);
            await accountSetupPage.waitForLoad();
        }
    });
    


    test('Account Setup Page Elements are Visible', async () => {
        // Check if the Account Setup label is visible
        expect(await accountSetupPage.isVisible(accountSetupPage.selectors.accountSetupLabel)).toBe(true);
        
        // Check if main action buttons are visible
        expect(await accountSetupPage.isVisible(accountSetupPage.selectors.addEmployeesButton)).toBe(true);
        expect(await accountSetupPage.isVisible(accountSetupPage.selectors.deleteEmployeesButton)).toBe(true);
        expect(await accountSetupPage.isVisible(accountSetupPage.selectors.addAsAdminButton)).toBe(true);
        
        // Check if search input is visible
        expect(await accountSetupPage.isVisible(accountSetupPage.selectors.searchInput)).toBe(true);
        
        // Check if upload and download icons are visible
        expect(await accountSetupPage.isVisible(accountSetupPage.selectors.uploadIcon)).toBe(true);
        expect(await accountSetupPage.isVisible(accountSetupPage.selectors.downloadTemplateIcon)).toBe(true);
    });

    test('Search Functionality Works Correctly', async () => {
        
        const searchTerm = 'test';
        await accountSetupPage.Search(searchTerm);
        
        // Verify the search input contains the search term
        const searchInputValue = await accountSetupPage.page.inputValue(accountSetupPage.selectors.searchInput);
        expect(searchInputValue).toBe(searchTerm);
    });

    test('Add employee modal opens and closes correctly', async () => {
        
        // Open add employee modal
        await accountSetupPage.click(accountSetupPage.selectors.addEmployeesButton);
        
        // Wait for modal to be visible
        await accountSetupPage.waitForElement(accountSetupPage.selectors.addEmployeeNameInput);
        await accountSetupPage.waitForElement(accountSetupPage.selectors.addEmployeeEmailInput);
        
        // Check modal elements are visible
        expect(await accountSetupPage.isVisible(accountSetupPage.selectors.addEmployeeNameInput)).toBe(true);
        expect(await accountSetupPage.isVisible(accountSetupPage.selectors.addEmployeeEmailInput)).toBe(true);
        expect(await accountSetupPage.isVisible(accountSetupPage.selectors.addEmployeeModalCancel)).toBe(true);
        expect(await accountSetupPage.isVisible(accountSetupPage.selectors.addEmployeeModalConfirm)).toBe(true);
        
        // Close modal using cancel button
        await accountSetupPage.click(accountSetupPage.selectors.addEmployeeModalCancel);
        
        // Verify modal is closed (inputs should not be visible)
        await accountSetupPage.page.waitForSelector(accountSetupPage.selectors.addEmployeeNameInput, { 
            state: 'hidden',
            timeout: 5000 
        });
    });

    test('Add employee with valid data', async () => {
        // Get initial total employee count (handles pagination)
        const initialTotalCount = await accountSetupPage.getTotalEmployeeCount();
        const hasPagination = await accountSetupPage.hasPagination();
        
        console.log(`Initial total count: ${initialTotalCount}, Has pagination: ${hasPagination}`);
        
        // Use the AddEmployees method which includes random data generation
        await accountSetupPage.AddEmployees();
        
        // Verify the form is filled
        const NewEmployeeName = await accountSetupPage.page.inputValue(accountSetupPage.selectors.addEmployeeNameInput);
        const NewEmployeeEmail = await accountSetupPage.page.inputValue(accountSetupPage.selectors.addEmployeeEmailInput);
        
        expect(NewEmployeeName).toMatch(/^test\w+$/); // Should start with 'test' followed by random characters
        expect(NewEmployeeEmail).toMatch(/^serena\+\w+@57blocks\.com$/); // Should match the email pattern
        
        // Submit the form
        await accountSetupPage.click(accountSetupPage.selectors.addEmployeeModalConfirm);
        
        // Wait for modal to close (assuming successful submission)
        await accountSetupPage.page.waitForSelector(accountSetupPage.selectors.addEmployeeNameInput, { 
            state: 'hidden',
            timeout: 10000 
        });

        const expectedCount = initialTotalCount + 1;
        const tableUpdated = await accountSetupPage.waitForTableUpdate(expectedCount);
        expect(tableUpdated).toBe(true);
        
        // Verify the specific employee is added to the antd table (only check if on current page)
        const response = await accountApi.getEmployees();
        expect(response.status).toBe(200);
        expect(response.data.data[0].user.email).toBe(NewEmployeeEmail);
        expect(response.data.data[0].user.username).toBe(NewEmployeeName);
        

      
    });

    test('Add employee with empty fields shows submit button disabled', async () => {
        
        // Open add employee modal
        await accountSetupPage.click(accountSetupPage.selectors.addEmployeesButton);
        await accountSetupPage.waitForElement(accountSetupPage.selectors.addEmployeeNameInput);
        
        // Fill only email, leave name empty
        await accountSetupPage.fill(accountSetupPage.selectors.addEmployeeEmailInput, 'test@57blocks.com');
        // Submit button should be disabled
        let submitButton = await accountSetupPage.page.locator(accountSetupPage.selectors.addEmployeeModalConfirm);
        expect(submitButton).toBeDisabled();

        await accountSetupPage.fill(accountSetupPage.selectors.addEmployeeEmailInput, '');
        await accountSetupPage.fill(accountSetupPage.selectors.addEmployeeNameInput, 'test');

        submitButton = await accountSetupPage.page.locator(accountSetupPage.selectors.addEmployeeModalConfirm);
        expect(submitButton).toBeDisabled();
    });

    test('Add employee with empty name shows error message', async () => {
        
        // Open add employee modal
        await accountSetupPage.click(accountSetupPage.selectors.addEmployeesButton);
        await accountSetupPage.waitForElement(accountSetupPage.selectors.addEmployeeNameInput);
        
        // Fill only email, leave name empty
        await accountSetupPage.fill(accountSetupPage.selectors.addEmployeeEmailInput, 'test@57blocks.com');
        await accountSetupPage.fill(accountSetupPage.selectors.addEmployeeNameInput, ' ');
        await accountSetupPage.click(accountSetupPage.selectors.addEmployeeNameInput);
        await accountSetupPage.page.keyboard.press('Delete');

        const errorMessage = await accountSetupPage.GetAddEmployeeErrorMessage();
        expect(errorMessage).toBeTruthy();
        expect(errorMessage).toContain('Name must be between 1 and 20 characters long.');
    });

    test('Add employee with empty email shows error message', async () => {

        // Open add employee modal
        await accountSetupPage.click(accountSetupPage.selectors.addEmployeesButton);
        await accountSetupPage.waitForElement(accountSetupPage.selectors.addEmployeeNameInput);
        
        // Fill only name, leave email empty
        await accountSetupPage.fill(accountSetupPage.selectors.addEmployeeNameInput, 'testname');
        await accountSetupPage.fill(accountSetupPage.selectors.addEmployeeEmailInput, ' ');
        await accountSetupPage.click(accountSetupPage.selectors.addEmployeeEmailInput);
        await accountSetupPage.page.keyboard.press('Delete');
        // Try to submit
        await accountSetupPage.click(accountSetupPage.selectors.addEmployeeModalConfirm);
        
        // Check for error message
        const errorMessage = await accountSetupPage.GetAddEmployeeErrorMessage();
        expect(errorMessage).toBeTruthy();
        expect(errorMessage).toContain('Invalid email format');
    });

    test('Add employee with invalid email format shows error', async () => {
        
        // Open add employee modal
        await accountSetupPage.click(accountSetupPage.selectors.addEmployeesButton);
        await accountSetupPage.waitForElement(accountSetupPage.selectors.addEmployeeNameInput);
        
        // Fill with invalid email format
        await accountSetupPage.fill(accountSetupPage.selectors.addEmployeeNameInput, 'testname');
        await accountSetupPage.fill(accountSetupPage.selectors.addEmployeeEmailInput, 'invalid-email');
        
        // Try to submit
        await accountSetupPage.click(accountSetupPage.selectors.addEmployeeModalConfirm);
        
        // Check for error message
        const errorMessage = await accountSetupPage.GetAddEmployeeErrorMessage();
        expect(errorMessage).toBeTruthy();
        expect(errorMessage).toContain('Invalid email format');
    });

    test('Add employee with existing email shows error', async () => {
        
        const initialTotalCount = await accountSetupPage.getTotalEmployeeCount();
        
        // Open add employee modal
        await accountSetupPage.click(accountSetupPage.selectors.addEmployeesButton);
        await accountSetupPage.waitForElement(accountSetupPage.selectors.addEmployeeNameInput);
        
        // Fill with existing email
        await accountSetupPage.fill(accountSetupPage.selectors.addEmployeeNameInput, 'Serena');
        await accountSetupPage.fill(accountSetupPage.selectors.addEmployeeEmailInput, mentee_login_data.email);
        
        // Try to submit
        await accountSetupPage.click(accountSetupPage.selectors.addEmployeeModalConfirm);
        
        // Check for error message
        const errorMessage = await accountSetupPage.GetNoticeMessage();
        expect(errorMessage).toBeTruthy();
        expect(errorMessage).toContain('Account with the email already exists.');
        
        // Verify total count is not increased
        const finalTotalCount = await accountSetupPage.getTotalEmployeeCount();
        expect(finalTotalCount).toBe(initialTotalCount);
    });

    test('Upload icon is clickable', async () => {
        await accountSetupPage.click(accountSetupPage.selectors.uploadIcon);
        // verify the modal is visible
        await accountSetupPage.waitForElement(accountSetupPage.selectors.uploadModal);
        expect(await accountSetupPage.isVisible(accountSetupPage.selectors.uploadModal)).toBe(true);
    });

    test('Download template icon is clickable', async () => {

        // Test if download template icon can be clicked
        await accountSetupPage.click(accountSetupPage.selectors.downloadTemplateIcon);
        // verify the modal is visible
        await accountSetupPage.waitForElement(accountSetupPage.selectors.downloadModal);
        expect(await accountSetupPage.isVisible(accountSetupPage.selectors.noticeWrapper)).toBe(true);
        const errorMessage = await accountSetupPage.GetNoticeMessage();
        expect(errorMessage).toBeTruthy();
        expect(errorMessage).toContain('Download Successful!');
 
    });

    // 清理共享的浏览器上下文
    test.afterAll(async () => {
        if (context) {
            const response = await accountApi.getEmployees(1,100,'test');
            const employeeIds = response.data.data.map(employee => employee.id);
            await accountApi.deleteMultipleEmployees(employeeIds);
            await context.close();
        }
    });
});