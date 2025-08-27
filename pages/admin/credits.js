const { expect } = require('@playwright/test');
const BasePage = require('../base_page');
const { BASE_URL_UI } = require('../../config/api_config');


class CreditsPage extends BasePage {
    constructor(page) {
        super(page);
        this.url = `${BASE_URL_UI}/admin/credits`;
        
        // Page elements selectors
        this.selectors = {
            fcfsButton: 'button:has-text("First-come, first-served")',
            cherryPickButton: 'span:has-text("Cherry-pick")',
            viewUsageLink: 'a:has-text("View Usage History")',
            viewAcquisitionLink: 'a:has-text("View Acquisition History")',
            
            // Cherry-pick mode
            monthlyQuotaColumn:'span:has-text("Monthly Quota")',
            monthlyQuotaInput:'input[class*="ant-input-number-input"]',
            totalUnallocatedColumn:'div:has-text("Total Unallocated")',
            
            // add employee
            confirmButton: 'button:has-text("Confirm")',
            cancelButton: 'butoon:has-text("Cancel")',
            closeIcon: '.ant-modal button[aria-label="Close"], .ant-modal .ant-modal-close, .ant-modal button[class*="close"]',
            
            // antd table elements
            employeeTable: '.ant-table-tbody, table tbody',
            tableRows: '.ant-table-tbody tr, table tbody tr',
            tableCells: '.ant-table-tbody td, table tbody td',
            tableMenteeColumn: '.ant-table-tbody tr td:nth-child(1), table tbody tr td:nth-child(1)',
            tableTotalUsageColumn: '.ant-table-tbody tr td:nth-child(2), table tbody tr td:nth-child(2)',
            tableMonthlyUsageColumn: '.ant-table-tbody tr td:nth-child(3), table tbody tr td:nth-child(3)',
            tableMonthlyQuotaColumn: '.ant-table-tbody tr td:nth-child(3), table tbody tr td:nth-child(4)',            


            // error message
            errorMessage: 'div[class*="ant-form-item-explain-error"]',
            noticeWrapper: 'div[class*="ant-message-notice-content"]',

            // modal
            modalTitle: 'span[class*="ant-modal-confirm-title"]',
            modalContent: 'div[class*="ant-modal-confirm-content"]',
            modalCancelButton: 'span:has-text("Cancel")',

            // cherry-pick mode
            addQuotaButton: page.locator('div:nth-child(3) > .h-\\[30px\\]').first(),
            minusQuotaButton: page.locator('.h-\\[30px\\]').first(),
            totalUnallocatedColumn: page.getByText('Total Unallocated'),



        };
    }

    async navigateToDashboard() {
        await this.page.goto(this.url);
    }

    async clickViewAllLink() {
        await this.page.click(this.selectors.viewAllLink);
    }

    async clickFCFSButton() {
        await this.page.click(this.selectors.fcfsButton);
    }

    async clickCherryPickButton() {
        await this.page.click(this.selectors.cherryPickButton);
    }

    async clickViewUsageLink() {
        await this.page.click(this.selectors.viewUsageLink);
    }

    async clickConfirmButton() {
        const confirmButton = this.page.getByRole('button', { name: 'Confirm' });
        await expect(confirmButton).toBeVisible({ timeout: 5000 });
        await expect(confirmButton).toBeEnabled();
        await confirmButton.click();
      }
      

    async clickViewAcquisitionLink() {
        await this.page.click(this.selectors.viewAcquisitionLink);
    }

    async verifyDashboardElements() {
        await this.page.waitForSelector(this.selectors.overviewCard);
    }
    async setDefaultFCFSMode() {
        await this.clickFCFSButton();
        await this.page.waitForSelector(this.selectors.confirmButton);
        await this.page.click(this.selectors.confirmButton);
        const isFCFSModeSelected = await this.isModeSelected('First-come, first-served');
        expect(isFCFSModeSelected).toBe(true);
    }
    
    async isButtonSelected(buttonText) {
        const buttons = this.page.locator('.ant-btn');
    
        const count = await buttons.count();
    
        for (let i = 0; i < count; i++) {
            const btn = buttons.nth(i);
            const text = await btn.textContent();
            if (text.trim() === buttonText) {
                // 找到按钮后，向上找父容器，再查找对应 dot 状态
                const container = btn.locator('..'); // div.cursor-pointer.flex.items-center...
                const dot = container.locator('div.h-3.w-3');
                const classList = await dot.getAttribute('class');
                return classList && !classList.includes('hidden');
            }
        }
    
        return false;
    }
    
      
    async isModeSelected(buttonLabel) {
        return await this.page.evaluate((label) => {
            const buttonContainer = Array.from(document.querySelectorAll('.cursor-pointer'))
                .find(container => container.innerText && container.innerText.includes(label));
            if (!buttonContainer) return false;
          
            const dot = buttonContainer.querySelector('.h-3.w-3');
            if (!dot) return false;
            
            return !dot.classList.contains('hidden');
        }, buttonLabel);
    }

    async isFCFSModeSelected() {
        return await this.isModeSelected('First-come, first-served');
    }

    async isCherryPickModeSelected() {
        return await this.isModeSelected('Cherry-pick');
    }
}

module.exports = CreditsPage;