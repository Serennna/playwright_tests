const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/login_page');
const FAQHelpPage = require('../pages/admin/faq_help');
const { mentor_user } = require('../config/test_data');
const { BASE_URL_UI } = require('../config/api_config');

test.describe('Mentor - Help Page - Tests', () => {
    let context;
    let page;
    let faqHelpPage;
    
    test.beforeAll(async ({ browser }) => {
        // 创建共享的浏览器上下文
        context = await browser.newContext();
        page = await context.newPage();
        const adminLoginPage = new LoginPage(page,'mentor');
        await adminLoginPage.loginWithRole(mentor_user.email, mentor_user.password, 'mentor');
        await page.waitForURL(`${BASE_URL_UI}/mentor/meetings/upcoming_meetings`);
        faqHelpPage = new FAQHelpPage(page, 'mentor');
        await faqHelpPage.ensureSidebarVisible();
    })

    test('Mentor can access Help page', async () => {
        // login with admin role
        await page.getByRole('button', { name: 'Help' }).click();
        await page.waitForURL(`${BASE_URL_UI}/mentor/faq`);
        const faq_title = 'Frequently Asked Questions for Mentors';
        const faq_question = 'What is OhHello and how does it work for me as a mentor?';
        const faq_answer = 'OhHello is an AI-powered platform that connects you with mentees seeking professional guidance. You create a profile highlighting your expertise, and our AI matches you with mentees who align with your skill set. Sessions are conducted via integrated video calls, and you manage your availability through your mentor dashboard.';
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
        await expect(faqHelpPage.selectors.emailInput).toHaveValue(`${mentor_user.email}`);

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
        await expect(faqHelpPage.selectors.nameInput).toHaveValue(`${mentor_user.name}`);
        await expect(faqHelpPage.selectors.emailInput).toHaveValue(`${mentor_user.email}`);

        // fill in the form
        await expect(faqHelpPage.selectors.describeProblemInput).toHaveAttribute('placeholder', 'Tell us what you need help with...');
    })

    test('Mentor can submit contact support', async () => {
        await faqHelpPage.clickHelpButton();
        // click contact support icon
        await faqHelpPage.clickContactSupportIcon();

        // verify the contact support icon is visible
        await expect(page.getByText('Contact Support')).toBeVisible();
        await expect(faqHelpPage.selectors.nameInput).toHaveValue(`${mentor_user.name}`);
        await expect(faqHelpPage.selectors.emailInput).toHaveValue(`${mentor_user.email}`);

        await faqHelpPage.submitContactSupportForm('Just for testing - I have a question about the platform');
    })

})