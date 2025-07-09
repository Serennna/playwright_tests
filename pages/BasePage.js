class BasePage {
    constructor(page) {
        this.page = page;
    }

    // Navigate to the specified URL
    async goto(url) {
        await this.page.goto(url);
        await this.page.waitForLoadState('networkidle');
    }

    // Wait for the element to be visible
    async waitForElement(selector, timeout = 30000) {
        await this.page.waitForSelector(selector, { timeout });
    }

    // Click on the element
    async click(selector) {
        await this.page.click(selector);
    }

    // Enter text into the element
    async fill(selector, text) {
        await this.page.fill(selector, text);
    }

    //  Get the text of the element
    async getText(selector) {
        return await this.page.textContent(selector);
    }

    //  Check if the element is visible
    async isVisible(selector) {
        return await this.page.isVisible(selector);
    }

    // Wait for the page to load
    async waitForLoad() {
        await this.page.waitForLoadState('networkidle');
    }

    // Screenshot 
    async screenshot(name) {
        await this.page.screenshot({ path: `debug-${name}.png` });
    }

    // Pause execution 
    async pause() {
        await this.page.pause();
    }

    // Get the title of the page
    async getTitle() {
        return await this.page.title();
    }

    // Get the current URL
    async getUrl() {
        return this.page.url();
    }

    // ============ Debugging ============

    // Debugging: Check if the element exists
    async debugElementExists(selector, description = '') {
        const exists = await this.page.locator(selector).count() > 0;
        console.log(`[DEBUG] ${description || selector}: ${exists ? 'exists' : 'not exists'}`);
        return exists;
    }

    // Debugging: Get the number of elements
    async debugElementCount(selector, description = '') {
        const count = await this.page.locator(selector).count();
        console.log(`[DEBUG] ${description || selector}: found ${count} elements`);
        return count;
    }

    // Debugging: Check if the element is visible
    async debugElementVisible(selector, description = '') {
        const visible = await this.page.isVisible(selector);
        console.log(`[DEBUG] ${description || selector}: ${visible ? 'Visible' : 'Invisible'}`);
        return visible;
    }

    // Debugging: Get the attribute of the element
    async debugElementAttribute(selector, attribute, description = '') {
        const value = await this.page.getAttribute(selector, attribute);
        console.log(`[DEBUG] ${description || selector} ${attribute}: ${value || 'null'}`);
        return value;
    }

    // Debugging: Get the text of the element
    async debugElementText(selector, description = '') {
        const text = await this.page.textContent(selector);
        console.log(`[DEBUG] ${description || selector} Text: "${text || ''}"`);
        return text;
    }

    // Debugging: Wait for the element and report the status
    async debugWaitForElement(selector, description = '', timeout = 5000) {
        try {
            await this.page.waitForSelector(selector, { timeout });
            console.log(`[DEBUG] ${description || selector}: element found`);
            return true;
        } catch (error) {
            console.log(`[DEBUG] ${description || selector}: element not found (${timeout}ms)`);
            return false;
        }
    }

    // Debugging: List all matching elements
    async debugListElements(selector, description = '') {
        const elements = await this.page.locator(selector).all();
        console.log(`[DEBUG] ${description || selector}: found ${elements.length} elements`);
        
        for (let i = 0; i < elements.length; i++) {
            const text = await elements[i].textContent();
            const visible = await elements[i].isVisible();
            console.log(`   ${i + 1}. ${visible ? '✅' : '❌'} "${text || 'No text'}"`);
        }
        return elements;
    }

    // Debugging: Get all input elements on the page
    async debugAllInputs() {
        const inputs = await this.page.locator('input').all();
        console.log(`[DEBUG] All input elements on the page (${inputs.length} elements):`);
        
        for (let i = 0; i < inputs.length; i++) {
            const type = await inputs[i].getAttribute('type');
            const id = await inputs[i].getAttribute('id');
            const name = await inputs[i].getAttribute('name');
            const placeholder = await inputs[i].getAttribute('placeholder');
            const visible = await inputs[i].isVisible();
            
            console.log(`   ${i + 1}. ${visible ? '✅' : '❌'} type="${type}" id="${id}" name="${name}" placeholder="${placeholder}"`);
        }
        return inputs;
    }

    // Debugging: Comprehensive element analysis
    async debugElementAnalysis(selector, description = '') {
        console.log(`[DEBUG] Element analysis: ${description || selector}`);
        console.log('─'.repeat(50));
        
        await this.debugElementExists(selector, 'Existence');
        await this.debugElementCount(selector, 'Count');
        await this.debugElementVisible(selector, 'Visibility');
        
        const count = await this.page.locator(selector).count();
        if (count > 0) {
            const text = await this.debugElementText(selector, 'Content');
            const id = await this.debugElementAttribute(selector, 'id', 'ID');
            const className = await this.debugElementAttribute(selector, 'class', 'Class');
            const type = await this.debugElementAttribute(selector, 'type', 'Type'); 
        }
        
        console.log('─'.repeat(50));
    }

    // Debugging: Page snapshot (includes all key information)
    async debugPageSnapshot(name = 'snapshot') {
        console.log(`\n📸 [DEBUG] Snapshot: ${name}`);
        console.log('─'.repeat(50));
        
        const title = await this.getTitle();
        const url = await this.getUrl();
        
        console.log(`Title: ${title}`);
        console.log(`URL: ${url}`);
        
        await this.screenshot(name);
        await this.debugAllInputs();
        
        console.log('─'.repeat(50));
    }
}

module.exports = BasePage; 