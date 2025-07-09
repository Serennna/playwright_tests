const {devices} = require('@playwright/test');

module.exports = {
    timeout: 30000,
    use: {
        headless: false,
        viewport: {width: 1280, height: 720},
        ignoreHTTPSErrors: false,
        screenshot: 'only-on-failure',
    },
    testDir: './tests',
    testMatch: /.*\.spec\.js$/,
    
    // Configure the output directory for screenshots
    outputDir: './screenshots',
    
    // Single worker for better resource management
    workers: 1,
    
    projects: [
        {
            name: 'chromium',
            use: { 
                ...devices['Desktop Chrome'],
                headless: false,
            },
        },
    ],
};