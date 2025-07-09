const BasePage = require('./BasePage');

class LoginPage extends BasePage {
    constructor(page) {
        super(page);
        this.url = 'https://wcp.57blocks.com/auth/login';
        
        // Page elements selectors
        this.selectors = {
            usernameInput: 'input[type="username"]',
            passwordInput: 'input[type="password"]',
            passwordToggle: 'span[class="icon-ico-visibility_off"], span[class="icon-ico-visibility"]',
            signInButton: 'button:has-text("Sign in")',
            forgotPasswordLink: 'a:has-text("Forgot Password")',
            googleSignInButton: 'button:has-text("Sign in with Google")',
            loginHeading: 'h1:has-text("Log in")',
            emailLabel: 'text="Email/Account"',
            passwordLabel: 'text="Password"'
        };
    }

    // Navigate to the login page
    async navigate() {
        await this.goto(this.url);
    }

    // Wait for the login page to load
    async waitForPageLoad() {
        await this.waitForElement(this.selectors.loginHeading);
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

    // Click the Google sign in button
    async clickGoogleSignIn() {
        await this.click(this.selectors.googleSignInButton);
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

module.exports = LoginPage; 