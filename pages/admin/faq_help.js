const BasePage = require('../base_page');
const { BASE_URL_UI } = require('../../config/api_config');


class FAQHelpPage extends BasePage {
    constructor(page, role) {
        super(page);
        this.url = `${BASE_URL_UI}/${role}/help`;
        
        // Page elements selectors
        this.selectors = {
            // sidebar / navigation
            helpButton: page.getByRole('button', { name: 'Help' }),
            creditsLink: page.getByRole('link', { name: 'Credits' }),
            subscriptionLink: page.getByRole('link', { name: 'Subscription' }),
            // form elements
            nameInput: page.getByRole('textbox', { name: 'Name *' }),
            emailInput: page.getByRole('textbox', { name: 'Email *' }),
            describeProblemInput: page.getByRole('textbox', { name: 'Describe Problem *' }),
            closeButton: page.getByRole('button', { name: 'Close' }),
            contactSupportIcon: page.getByRole('main').getByRole('button').filter({ hasText: /^$/ }),
            submitButton: page.getByRole('button', { name: 'Submit' }),
          };
    }

    async clickContactSupportIcon() {
        await this.page.getByRole('main').getByRole('button').filter({ hasText: /^$/ }).click();
    }

    async ensureSidebarVisible() {
        const sidebarVisible = await this.page.getByRole('button', { name: 'Help' }).isVisible();
        if (!sidebarVisible) {
          // 这里的 toggle 按钮最好给个 data-testid，而不是用空文本
          await this.page.getByRole('button').filter({ hasText: /^$/ }).first().click();
        }
      }

    async clickHelpButton() {
        await this.page.getByRole('button', { name: 'Help' }).click();
    }

    async submitContactSupportForm(describeProblem, name, email, ) {
        if (name) {
            await this.page.getByRole('textbox', { name: 'Name *' }).fill(name);
        }
        if (email) {
            await this.page.getByRole('textbox', { name: 'Email *' }).fill(email);
        }

        await this.page.getByRole('textbox', { name: 'Describe Problem *' }).fill(describeProblem);
        await this.page.getByRole('button', { name: 'Submit' }).click();
    }

    async cancelContactSupportForm() {
        await this.page.getByRole('button', { name: 'Cancel' }).click();
    }

    
}

module.exports = FAQHelpPage;