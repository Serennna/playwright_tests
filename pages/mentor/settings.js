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
    // actions

    async navigate() {
        await this.goto(this.url);
    }

    async enableNameEditMode() {
        await this.selectors.nameEditButton.click();
    }

    async enablePasswordEditMode() {
        await this.selectors.passwordEditButton.click();
    }

    async enterNewName(newName) {
        await this.selectors.nameInput.fill(newName);
    }

    async saveChanges() {
        await this.selectors.saveChangesbutton.click();
    }

    async cancelChanges() {
        await this.selectors.cancelChangesbutton.click();
    }

    // functions
    async changeMentorName(newName) {
        await this.enableNameEditMode();
        await this.enterNewName(newName);
        await this.saveChanges();
    }

    async changeMentorPassword(currentPassword, newPassword, confirmPassword) {
        await this.enablePasswordEditMode();
        await this.enterCurrentPassword(currentPassword);
        await this.enterNewPassword(newPassword);
        await this.enterConfirmPassword(confirmPassword);
        await this.submitPasswordChange();
    }

    async enterCurrentPassword(currentPassword) {
        await this.selectors.currentPasswordInput.fill(currentPassword);
    }

    async enterNewPassword(newPassword) {
        await this.selectors.newPasswordInput.fill(newPassword);
    }

    async enterConfirmPassword(confirmPassword) {
        await this.selectors.confirmNewPasswordInput.fill(confirmPassword);
    }

    async submitPasswordChange() {
        await this.selectors.confirmModalButton.click();
    }
}

module.exports = MentorSettingsPage;