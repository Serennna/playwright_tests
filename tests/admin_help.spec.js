const { test, expect } = require('@playwright/test');
const MenteeLoginPage = require('../pages/mentee_login_page');
const FAQHelpPage = require('../pages/admin/faq_help');
const { admin_user} = require('../config/test_data');
const { BASE_URL_UI } = require('../config/api_config');

test.describe('Admin - Help Page - Tests', () => {
    let context;
    let page;
    let faqHelpPage;
    
    test.beforeAll(async ({ browser }) => {
        // 创建共享的浏览器上下文
        context = await browser.newContext();
        page = await context.newPage();
        const adminLoginPage = new MenteeLoginPage(page);
        await adminLoginPage.loginWithRole(admin_user.email, admin_user.password, 'admin');
        await page.waitForURL(`${BASE_URL_UI}/admin/dashboard`);
        faqHelpPage = new FAQHelpPage(page, 'admin');
        await faqHelpPage.ensureSidebarVisible();
    })

    test('Admin can access Help page', async () => {
        // login with admin role
        await page.getByRole('button', { name: 'Help' }).click();
        await page.waitForURL(`${BASE_URL_UI}/admin/faq`);
        const faq_title = 'Frequently Asked Questions for Admins';
        const faq_question = 'What is OhHello and why should my organization use it?';
        const faq_answer = 'OhHello is an AI-driven mentorship platform that boosts employee engagement, retention, and productivity. By providing on-demand access to top-tier mentors, you empower your workforce to navigate challenges and develop skills in a hybrid or remote environment.';
        await expect(page.getByText(`${faq_title}`)).toBeVisible();
        await expect(page.getByText(`${faq_question}`)).toBeVisible();
        await expect(page.getByText(`${faq_answer}`)).toBeVisible();
        // click to hidden the answer part
        await page.getByRole('button', { name: `${faq_question}`}).click();
        await expect(page.getByText(`${faq_answer}`)).toBeHidden();

        // click to show the answer part
        await page.getByRole('button', { name: `${faq_question}`}).click();
        await expect(page.getByText(`${faq_answer}`)).toBeVisible();
        })

    test('Contact Support interactions works as expected', async () => {

        await faqHelpPage.clickHelpButton();

        // click contact support icon
        await faqHelpPage.clickContactSupportIcon();

        // verify the contact support icon is visible
        await expect(page.getByText('Contact Support')).toBeVisible();
        await expect(faqHelpPage.selectors.emailInput).toHaveValue(`${admin_user.email}`);

        // fill in the form
        await faqHelpPage.selectors.describeProblemInput.fill('Just for testing - I have a question about the platform');
        await faqHelpPage.selectors.nameInput.fill('test name');
        await faqHelpPage.selectors.emailInput.fill('test@test.com');

        // submit the form
        await faqHelpPage.selectors.closeButton.click();
        await expect(page.getByText('Contact Support')).toBeHidden();

        // click contact support icon   
        await faqHelpPage.clickContactSupportIcon();

        // verify the contact support icon is visible
        await expect(page.getByText('Contact Support')).toBeVisible();
        await expect(faqHelpPage.selectors.nameInput).toHaveValue(`${admin_user.name}`);
        await expect(faqHelpPage.selectors.emailInput).toHaveValue(`${admin_user.email}`);

        // fill in the form
        await expect(faqHelpPage.selectors.describeProblemInput).toHaveAttribute('placeholder', 'Tell us what you need help with...');
    })

    test('Admin can submit contact support', async () => {
        await faqHelpPage.clickHelpButton();
        // click contact support icon
        await faqHelpPage.clickContactSupportIcon();

        // verify the contact support icon is visible
        await expect(page.getByText('Contact Support')).toBeVisible();
        await expect(faqHelpPage.selectors.nameInput).toHaveValue(`${admin_user.name}`);
        await expect(faqHelpPage.selectors.emailInput).toHaveValue(`${admin_user.email}`);

        await faqHelpPage.submitContactSupportForm('Just for testing - I have a question about the platform');
    })

})