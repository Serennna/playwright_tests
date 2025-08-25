const BasePage = require('../base_page');
const { BASE_URL_UI } = require('../../config/api_config');


class DashboardPage extends BasePage {
    constructor(page) {
        super(page);
        this.url = `${BASE_URL_UI}/admin/dashboard`;
        
        // Page elements selectors
        this.selectors = {
            viewAllLink: 'a:has-text("View All")',
            // dashboard elements
            overviewCard: 'h1:has-text("Overview")',
            satisfactionCard: 'h1:has-text("Satisfaction and Feedback")',

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

    async navigateToDashboard() {
        await this.page.goto(this.url);
    }

    async clickViewAllLink() {
        await this.page.click(this.selectors.viewAllLink);
    }

    async verifyDashboardElements() {
        await this.page.waitForSelector(this.selectors.overviewCard);
    }


}

module.exports = DashboardPage;