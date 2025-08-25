const BasePage = require('../base_page');
const { BASE_URL_UI } = require('../../config/api_config');


class AccountSetupPage extends BasePage {
    constructor(page) {
        super(page);
        this.url = `${BASE_URL_UI}/admin/account`;
        
        // Page elements selectors
        this.selectors = {
            searchInput: 'input[placeholder="Search"]',
            addEmployeesButton: 'button:has-text("Add Employees")',
            deleteEmployeesButton: 'button:has-text("Delete Employees")',
            addAsAdminButton: 'button:has-text("Add as Admins")',
            accountSetupLabel:'header:has-text("Account Setup")',
            uploadIcon: 'button.admin_step_3, button[title*="upload"], button[aria-label*="upload"]',
            downloadTemplateIcon: 'button[title*="download"], button[aria-label*="download"], .gap-x-5 button:nth-child(8)',
            
            // add employee
            addEmployeeNameInput: '#username',
            addEmployeeEmailInput: '#email',
            addEmployeeModalCancel: 'button:has-text("Cancel")',
            addEmployeeModalConfirm: 'button:has-text("Submit")',
            addEmployeeModalClose: 'button:has-text("Close")',
            modalCloseIcon: '.ant-modal button[aria-label="Close"], .ant-modal .ant-modal-close, .ant-modal button[class*="close"]',

            // antd table elements
            employeeTable: '.ant-table-tbody, table tbody',
            tableRows: '.ant-table-tbody tr, table tbody tr',
            tableCells: '.ant-table-tbody td, table tbody td',
            tableSelectColumn: '.ant-table-tbody tr td:nth-child(1), table tbody tr td:nth-child(1)',
            tableNameColumn: '.ant-table-tbody tr td:nth-child(2), table tbody tr td:nth-child(2)',
            tableEmailColumn: '.ant-table-tbody tr td:nth-child(3), table tbody tr td:nth-child(3)',
            tableTotalColumn: '.ant-pagination-total-text, li[class*="ant-pagination-total-text"], .ant-pagination .ant-pagination-total-text, [class*="total"], text=/Total.*items?/i',
            
            // pagination elements  
            pagination: '.ant-pagination',
            paginationTotal: '.ant-pagination-total-text',
            nextPageButton: '.ant-pagination-next',
            prevPageButton: '.ant-pagination-prev',

            // delete employee
            deleteEmployeeCheckbox: 'input[type="checkbox"]',
            deleteEmployeeModalCancel: 'button:has-text("Cancel")',
            deleteEmployeeModalConfirm: 'button:has-text("Delete")',
            deleteEmployeeModalClose: 'button:has-text("Close")',

            // error message
            errorMessage: 'div[class*="ant-form-item-explain-error"]',
            noticeWrapper: 'div[class*="ant-message-notice-content"]',

            // modal
            modalTitle: 'div[class*="ant-modal-title"]',
            modalContent: 'div[class*="ant-modal-body"]',
            modalCancelButton: 'button:has-text("Cancel")',
        };
    }

    async GetNoticeMessage() {
        return await this.page.locator(this.selectors.noticeWrapper).first().textContent();
    }

    async GetAddEmployeeErrorMessage() {
        return await this.page.locator(this.selectors.errorMessage).textContent();
    }

    async GetModalContent() {
        return await this.page.locator(this.selectors.modalContent).textContent();
    }

    async GetModalTitle() {
        return await this.page.locator(this.selectors.modalTitle).textContent();
    }   

    // Verify if employee is added to table
    async isEmployeeInTable(name, email) {
        // Wait for table to load
        await this.waitForElement(this.selectors.employeeTable);
        
        // Get all table rows
        const rows = await this.page.locator(this.selectors.tableRows);
        const rowCount = await rows.count();
        
        for (let i = 0; i < rowCount; i++) {
            const row = rows.nth(i);
            const cells = await row.locator('td');
            const cellCount = await cells.count();
            
            if (cellCount >= 2) {
                const nameCell = await cells.nth(0).textContent();
                const emailCell = await cells.nth(1).textContent();
                
                if (nameCell?.trim() === name && emailCell?.trim() === email) {
                    return true;
                }
            }
        }
        return false;
    }

    // Get employee count from current page only
    async getCurrentPageEmployeeCount() {
        await this.waitForElement(this.selectors.employeeTable);
        const rows = await this.page.locator(this.selectors.tableRows);
        return await rows.count();
    }

    // Get total employee count (from pagination info or current page if no pagination)
    async getTotalEmployeeCount() {
        try {
            // Check if pagination total exists
            const totalElement = await this.page.locator(this.selectors.tableTotalColumn);
            const isVisible = await totalElement.isVisible();
            
            if (isVisible) {
                const totalText = await totalElement.textContent();
                console.log(`Pagination total text found: "${totalText}"`);
                
                // Extract number from various formats:
                // "Total 3 items",
                const patterns = [
                    /Total\s+(\d+)\s+items?/i,           // "Total 3 items"
                ];
                
                for (const pattern of patterns) {
                    const match = totalText.match(pattern);
                    if (match) {
                        const count = parseInt(match[1]);
                        console.log(`Extracted total count: ${count} using pattern: ${pattern}`);
                        return count;
                    }
                }
                
                console.log('No matching pattern found in pagination text');
            } else {
                console.log('Pagination total element not visible');
            }
        } catch (error) {
            console.log('Error reading pagination total:', error.message);
        }
        
        // Fallback to current page count if no pagination
        console.log('Using current page count as fallback');
        return await this.getCurrentPageEmployeeCount();
    }

    // Check if table has pagination
    async hasPagination() {
        try {
            const paginationElement = await this.page.locator(this.selectors.pagination);
            return await paginationElement.isVisible();
        } catch (error) {
            return false;
        }
    }

    // Search for employee across all pages (for paginated tables)
    async findEmployeeAcrossPages(name, email, maxPages = 10) {
        const hasPagination = await this.hasPagination();
        
        if (!hasPagination) {
            // If no pagination, just check current page
            return await this.isEmployeeInTable(name, email);
        }

        // If has pagination, search across pages
        for (let page = 1; page <= maxPages; page++) {
            // Check current page
            const found = await this.isEmployeeInTable(name, email);
            if (found) {
                return true;
            }

            // Try to go to next page
            try {
                const nextButton = await this.page.locator(this.selectors.nextPageButton);
                const isNextDisabled = await nextButton.getAttribute('aria-disabled');
                
                if (isNextDisabled === 'true') {
                    // Reached last page
                    break;
                }
                
                await nextButton.click();
                await this.page.waitForTimeout(1000); // Wait for page to load
                await this.waitForElement(this.selectors.employeeTable);
            } catch (error) {
                console.log(`Error navigating to page ${page + 1}:`, error.message);
                break;
            }
        }
        
        return false;
    }

    // Alternative: Use search functionality to find specific employee
    async searchForEmployee(email) {
        await this.Search(email);
        await this.page.waitForTimeout(2000); // Wait for search results
        
        // Check if employee appears in search results
        const found = await this.page.locator(`text=${email}`).isVisible();
        
        // Clear search to restore original view
        await this.fill(this.selectors.searchInput, '');
        await this.page.keyboard.press('Enter');
        await this.page.waitForTimeout(1000);
        
        return found;
    }

    // Wait for table to update (using total count if pagination exists)
    async waitForTableUpdate(expectedRowCount, timeout = 10000) {
        const startTime = Date.now();
        const hasPagination = await this.hasPagination();
        
        while (Date.now() - startTime < timeout) {
            const currentRowCount = hasPagination ? 
                await this.getTotalEmployeeCount() : 
                await this.getCurrentPageEmployeeCount();
                
            if (currentRowCount === expectedRowCount) {
                return true;
            }
            await this.page.waitForTimeout(500);
        }
        return false;
    }

    // Wait for total count to increase (more reliable for pagination)
    async waitForTotalCountIncrease(initialCount, timeout = 10000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            const currentTotal = await this.getTotalEmployeeCount();
            if (currentTotal > initialCount) {
                return true;
            }
            await this.page.waitForTimeout(500);
        }
        return false;
    }

    async Search(content) {
        await this.click(this.selectors.searchInput);
        await this.fill(this.selectors.searchInput, content);
        await this.page.keyboard.press('Enter');
    }
    
    async AddEmployees(customData = null) {
        const ApiHelper = require('../../utils/api_helper');
        
        // Use custom data if provided, otherwise generate random data
        const employeeData = customData || ApiHelper.generateEmployeeData();
        
        await this.click(this.selectors.addEmployeesButton);
        await this.waitForElement(this.selectors.addEmployeeNameInput);
        await this.fill(this.selectors.addEmployeeNameInput, employeeData.name);
        await this.fill(this.selectors.addEmployeeEmailInput, employeeData.email);
        
        // Return the generated data for test verification
        return employeeData;
    }

    // 提交添加员工表单
    async submitAddEmployeeForm() {
        await this.click(this.selectors.addEmployeeModalConfirm);
        
        // Wait for modal to close
        await this.page.waitForSelector(this.selectors.addEmployeeNameInput, { 
            state: 'hidden',
            timeout: 10000 
        });
    }

    // 取消添加员工操作
    async cancelAddEmployee() {
        await this.click(this.selectors.addEmployeeModalCancel);
        
        // Wait for modal to close
        await this.page.waitForSelector(this.selectors.addEmployeeNameInput, { 
            state: 'hidden',
            timeout: 5000 
        });
    }

    async AddAsAdmin() {
        await this.click(this.selectors.addAsAdminButton);
    }

    async DeleteEmployees() {
    }

    async ClickAddAsAdminButton() {
        await this.click(this.selectors.addAsAdminButton);
    }

    async ClickDeleteEmployeesButton() {
        await this.click(this.selectors.deleteEmployeesButton);
    }

    async ClickEmployeeTableCheckboxByEmail(email) {
        const checkbox = await this.page.locator(`text=${email}`).locator(this.selectors.tableSelectColumn);
        await checkbox.click(); 
    }


}

module.exports = AccountSetupPage;