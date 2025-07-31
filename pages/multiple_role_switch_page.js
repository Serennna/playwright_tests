const BasePage = require('./base_page');

class MultipleRoleSwitchPage extends BasePage {
    constructor(page) {
        super(page);
        this.url = 'https://ohhello-dev-909a7.web.app/multiple_role_switch';
        
        // Page elements selectors
        this.selectors = {
            employeeRole: 'span:has-text("Employee")',
            adminRole: 'span:has-text("Admin")',
            signInButton: 'button:has-text("Sign in")',
        };
    }

// Choose the Employee Role
async chooseEmployeeRole() {
    await this.click(this.selectors.employeeRole);
}

// Choose the Admin Role
async chooseAdminRole() {
    await this.click(this.selectors.adminRole);
}

// Click the Sign In Button
async clickSignInButton() {
    await this.click(this.selectors.signInButton);
}

// Choose the role and click the sign in button
async chooseRoleAndClickSignInButton(role) {
    if (role === 'employee') {
        await this.chooseEmployeeRole();
    } else if (role === 'admin') {
        await this.chooseAdminRole();
    }
    await this.clickSignInButton();
}
}

module.exports = MultipleRoleSwitchPage; 