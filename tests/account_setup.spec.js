const { test, expect } = require('@playwright/test');
const MenteeLoginPage = require('../pages/mentee_login_page');
const AccountSetupPage = require('../pages/admin/account_setup');
const AccountApi = require('../apis/account_api');
const { mentee_login_data } = require('../config/test_data');

test.describe('Admin - Account Setup Page Tests', () => {
    
    // 登录辅助函数 - 每个测试都会调用这个函数获得独立的会话
    async function setupAdminSession(page) {
        const loginPage = new MenteeLoginPage(page);
        await loginPage.loginWithRole(mentee_login_data.email, mentee_login_data.password, 'admin');
        await page.waitForLoadState('networkidle');
        
        const accountSetupPage = new AccountSetupPage(page);
        const accountApi = new AccountApi(page);
        
        await accountSetupPage.goto(accountSetupPage.url);
        await accountSetupPage.waitForLoad();
        
        return { accountSetupPage, accountApi };
    }

    test('Account Setup Page Elements are Visible', async ({ page }) => {
        const { accountSetupPage } = await setupAdminSession(page);
        
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

    test('Search Functionality Works Correctly', async ({ page }) => {
        const { accountSetupPage } = await setupAdminSession(page);
        
        const searchTerm = 'test';
        await accountSetupPage.Search(searchTerm);
        
        // Verify the search input contains the search term
        const searchInputValue = await accountSetupPage.page.inputValue(accountSetupPage.selectors.searchInput);
        expect(searchInputValue).toBe(searchTerm);
    });

    test('Add employee modal opens and closes correctly', async ({ page }) => {
        const { accountSetupPage } = await setupAdminSession(page);
        
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

    test('Add employee with valid data', async ({ page }) => {
        const { accountSetupPage, accountApi } = await setupAdminSession(page);
        
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
        
        // For paginated tables, wait for total count to increase
        if (hasPagination) {
            console.log('Table has pagination, waiting for total count to increase...');
            const totalIncreased = await accountSetupPage.waitForTotalCountIncrease(initialTotalCount);
            expect(totalIncreased).toBe(true);
            
            // Verify total count increased by 1
            const finalTotalCount = await accountSetupPage.getTotalEmployeeCount();
            expect(finalTotalCount).toBe(initialTotalCount + 1);
            console.log(`Final total count: ${finalTotalCount}`);
            
            // Use search to verify the specific employee is findable
            console.log('Searching for added employee via search functionality...');
            const isEmployeeSearchable = await accountSetupPage.searchForEmployee(NewEmployeeEmail);
            expect(isEmployeeSearchable).toBe(true);
        } else {
            // For non-paginated tables, use the original method
            console.log('Table has no pagination, checking current page...');
            const expectedCount = initialTotalCount + 1;
            const tableUpdated = await accountSetupPage.waitForTableUpdate(expectedCount);
            expect(tableUpdated).toBe(true);
            
            // Verify the specific employee is added to the antd table (only check if on current page)
            const isEmployeeAdded = await accountSetupPage.isEmployeeInTable(NewEmployeeName, NewEmployeeEmail);
            expect(isEmployeeAdded).toBe(true);
        }
    });

    test('Add employee with empty name shows submit button disabled', async ({ page }) => {
        const { accountSetupPage } = await setupAdminSession(page);
        
        // Open add employee modal
        await accountSetupPage.click(accountSetupPage.selectors.addEmployeesButton);
        await accountSetupPage.waitForElement(accountSetupPage.selectors.addEmployeeNameInput);
        
        // Fill only email, leave name empty
        await accountSetupPage.fill(accountSetupPage.selectors.addEmployeeEmailInput, 'test@57blocks.com');
        
        // Try to submit
        await accountSetupPage.click(accountSetupPage.selectors.addEmployeeModalConfirm);
        
        // Submit button should be disabled
        const submitButton = await accountSetupPage.page.locator(accountSetupPage.selectors.addEmployeeModalConfirm);
        expect(submitButton).toBeDisabled();

        const errorMessage = await accountSetupPage.GetAddEmployeeErrorMessage();
        expect(errorMessage).toBeTruthy();
    });

    test('Add employee with empty name shows error message', async ({ page }) => {
        const { accountSetupPage } = await setupAdminSession(page);
        
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

    test('Add employee with empty email shows error message', async ({ page }) => {
        const { accountSetupPage } = await setupAdminSession(page);
        
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

    test('Add employee with invalid email format shows error', async ({ page }) => {
        const { accountSetupPage } = await setupAdminSession(page);
        
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

    test('Add employee with existing email shows error', async ({ page }) => {
        const { accountSetupPage } = await setupAdminSession(page);
        
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

    test('Upload icon is clickable', async ({ page }) => {
        const { accountSetupPage } = await setupAdminSession(page);
        
        // Test if upload icon can be clicked (doesn't test actual upload functionality)
        await accountSetupPage.click(accountSetupPage.selectors.uploadIcon);
        // Add verification based on what happens when upload is clicked
        // This might open a file dialog or show an upload modal
    });

    test('Download template icon is clickable', async ({ page }) => {
        const { accountSetupPage } = await setupAdminSession(page);
        
        // Test if download template icon can be clicked
        await accountSetupPage.click(accountSetupPage.selectors.downloadTemplateIcon);
        // Add verification based on what happens when download is clicked
        // This might trigger a file download
    });

    test('Page title contains expected text', async ({ page }) => {
        const { accountSetupPage } = await setupAdminSession(page);
        
        const title = await accountSetupPage.getTitle();
        expect(title).toBeTruthy(); // Verify page has a title
        // Add specific title expectation if known
    });

    test('Page URL is correct', async ({ page }) => {
        const { accountSetupPage } = await setupAdminSession(page);
        
        const currentUrl = await accountSetupPage.getUrl();
        expect(currentUrl).toBe(accountSetupPage.url);
    });
});