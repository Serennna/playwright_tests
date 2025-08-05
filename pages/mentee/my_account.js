const BasePage = require('../base_page');

class MyAccountPage extends BasePage {
    constructor(page) {
        super(page);
        this.url = 'https://ohhello-dev-909a7.web.app/mentee/account';
        
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

    // Check if the page is loaded
    async isPageLoaded() {
        // return await this.isVisible(this.selectors.loginHeading) && 
        //        await this.isVisible(this.selectors.usernameInput) && 
        //        await this.isVisible(this.selectors.passwordInput);
    }
}

module.exports = MenteeLoginPage; 