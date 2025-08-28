const BasePage = require('../base_page');
const { BASE_URL_UI } = require('../../config/api_config');


class MentorSettingsPage extends BasePage {
    constructor(page) {
        super(page);
        this.url = `${BASE_URL_UI}/mentor/settings/setting`;
        
        // Page elements selectors
        this.selectors = {
            // content
            accountSettingLabel: page.getByText('Account Settings'),
            nameLable: page.getByText('Name'),
            emailLable: page.getByText('Email'),
            passwordLable: page.getByText('Password'),
            feesLabel: page.getByText('Fees'),
            phoneNumberLabel: page.getByText('Phone Number'),

            // input elements
            nameInput: page.getByRole('textbox').first(),
            passwordInput: page.getByRole('textbox').nth(1),
            emailInput: page.locator('input[type="email"]').first(),
            feesInput: page.getByRole('textbox').nth(3),

            // tooltips
            emailTooltip: page.locator('label').filter({ hasText: 'Email' }).locator('path').first(),
            feesTooltip: page.locator('label').filter({ hasText: 'Fees' }).locator('path').first(),
            phoneNumberTooltip: page.locator('label').filter({ hasText: 'Phone Number' }).locator('path').first(),

            // buttons
            nameEditButton: page.locator('.ant-input-suffix > .cursor-pointer').first(),
            passwordEditButton:  page.locator('div:nth-child(3) > .ant-row > .ant-col.ant-form-item-control > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-input-affix-wrapper > .ant-input-suffix > .cursor-pointer'),
            phoneNumberEditButton:page.locator('div:nth-child(6) > .ant-row > .ant-col.ant-form-item-control > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-input-affix-wrapper > .ant-input-suffix > .cursor-pointer'),

            // save and cancel buttons
            cancelChangesbutton :  page.locator('.mr-1'),
            saveChangesbutton : page.locator('svg:nth-child(2) > path'),

            // edit password modal
            cancelModalButton :  page.getByRole('button', { name: 'Cancel' }),
            confirmNewPasswordInput : page.getByRole('textbox', { name: 'Confirm New Password *' }),
            newPasswordInput : page.getByRole('textbox', { name: 'New Password *', exact: true }),
            currentPasswordInput : page.getByRole('textbox', { name: 'Current Password *' })
        };
    }

    async navigate() {
        await this.goto(this.url);
    }
}

module.exports = MentorSettingsPage;