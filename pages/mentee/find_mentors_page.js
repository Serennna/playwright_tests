const BasePage = require('../base_page');

class MenteeLoginPage extends BasePage {
    constructor(page) {
        super(page);
        this.url = 'https://ohhello-dev-909a7.web.app/mentee/sign_in';
        
        // Page elements selectors
        this.selectors = {
            usernameInput: '#email',
            passwordInput: '#password',
            passwordToggle: 'span[class="anticon-eye-invisible"], span[class="anticon-eye-visible"]',
            signInButton: 'button:has-text("Sign In")',
            forgotPasswordLink: 'a:has-text("Forgot?")',
            signUpLink: 'h1:has-text("Sign Up")',
            emailLabel: 'text="Your Email"',
            passwordLabel: 'text="Password"',
            menteeLabel:'text="Mentee Sign In"',
            signInAsMentorLink:'button:has-text("Sign in as Mentor")'
        };
    }

    // Navigate to the login page
    async navigate() {
        await this.goto(this.url);
    }

    // Wait for the login page to load
    async waitForPageLoad() {
        await this.waitForElement(this.selectors.usernameInput);
        await this.waitForElement(this.selectors.passwordInput);
    }

    // Enter the username
    async enterUsername(username) {
        await this.click(this.selectors.usernameInput);
        await this.fill(this.selectors.usernameInput, username);
    }

    // Enter the password
    async enterPassword(password) {
        await this.click(this.selectors.passwordInput);
        await this.fill(this.selectors.passwordInput, password);
    }

    // Click the password visibility toggle button
    async togglePasswordVisibility() {
        await this.click(this.selectors.passwordToggle);
    }

    // Click the sign in button
    async clickSignIn() {
        await this.click(this.selectors.signInButton);
    }

    // Click the forgot password link
    async clickForgotPassword() {
        await this.click(this.selectors.forgotPasswordLink);
    }

    // Get the type attribute of the password input
    async getPasswordInputType() {
        return await this.page.getAttribute(this.selectors.passwordInput, 'type');
    }

    // Check if the password is visible
    async isPasswordVisible() {
        const type = await this.getPasswordInputType();
        return type === 'text';
    }

    // Execute the complete login process
    async login(username, password) {
        await this.navigate();
        await this.waitForPageLoad();
        await this.enterUsername(username);
        await this.enterPassword(password);
        await this.clickSignIn();
    }

    // Execute the login and toggle the password visibility
    async loginWithPasswordToggle(username, password) {
        await this.navigate();
        await this.waitForPageLoad();
        await this.enterUsername(username);
        await this.enterPassword(password);
        await this.togglePasswordVisibility();
    }

    // Check if the page is loaded
    async isPageLoaded() {
        return await this.isVisible(this.selectors.loginHeading) && 
               await this.isVisible(this.selectors.usernameInput) && 
               await this.isVisible(this.selectors.passwordInput);
    }
}

module.exports = MenteeLoginPage; 