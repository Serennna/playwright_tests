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
    
    // 报告生成器配置
    reporter: [
        // HTML 报告（美观的网页报告）
        ['html', { 
            outputFolder: 'playwright-report',
            open: 'never'  // 'always' | 'never' | 'on-failure'
        }],
        // 控制台输出（显示测试进度）
        ['list'],
        // JSON 报告（用于 CI/CD 集成）
        ['json', { 
            outputFile: 'test-results.json' 
        }],
        // JUnit 报告（用于 CI/CD 系统）
        ['junit', { 
            outputFile: 'junit-results.xml' 
        }]
    ],
    
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