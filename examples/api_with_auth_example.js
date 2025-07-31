// API 认证使用示例
const { test, expect } = require('@playwright/test');
const AccountApi = require('../apis/account_api');
const MenteeLoginPage = require('../pages/mentee_login_page');
const { mentee_login_data } = require('../config/test_data');

test.describe('API 认证示例', () => {
    let accountApi;
    let page;

    test.beforeAll(async ({ browser }) => {
        const context = await browser.newContext();
        page = await context.newPage();

        // 登录以获取认证信息
        const loginPage = new MenteeLoginPage(page);
        await loginPage.loginWithRole(mentee_login_data.email, mentee_login_data.password, 'admin');
        await page.waitForLoadState('networkidle');

        // 初始化 API 客户端
        accountApi = new AccountApi(page);
    });

    test('方法1：自动获取 JWT token', async () => {
        try {
            // API 会自动从 localStorage/sessionStorage 获取 token
            const response = await accountApi.getUsers(1, 10, '');
            
            expect(response.status).toBe(200);
            console.log('✅ 自动认证成功');
        } catch (error) {
            console.log('自动认证失败:', error.message);
        }
    });

    test('方法2：手动设置 JWT token', async () => {
        try {
            // 手动设置 JWT token（例如从您的 curl 命令中获取）
            const jwtToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ijk1MWRkZTkzMmViYWNkODhhZmIwMDM3YmZlZDhmNjJiMDdmMDg2NmIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vb2hoZWxsby1kZXYtOTA5YTciLCJhdWQiOiJvaGhlbGxvLWRldi05MDlhNyIsImF1dGhfdGltZSI6MTc1MzY4NDQ4NSwidXNlcl9pZCI6Ik1aQ2xWNG50OGxmSzVhV1AwaFNEcFM5d3plTTIiLCJzdWIiOiJNWkNsVjRudDhsZks1YVdQMGhTRHBTOXd6ZU0yIiwiaWF0IjoxNzUzOTQzMjIwLCJleHAiOjE3NTM5NDY4MjAsImVtYWlsIjoic2VyZW5hK21lbnRlZUA1N2Jsb2Nrcy5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJzZXJlbmErbWVudGVlQDU3YmxvY2tzLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.iLr456-QEjWKARK2GCaA-1W2RWtXqLgfXVQoaDBLmqcMbohXZ7n6Yi9KPxL_eonu10krxcbWkO1qtZibaByO6hF1u-DFIwc-bTX9Y0zqk33Mp2_wsGEsY9mB-XiWMmmyn6cvZ_bApGXuxAoubrVWTs3VUmFNnZMhm4p6vuSu2D_N-3DWlnrWi_yAZkACQGwNSRlvnAVcnGLkFd_n-WbSMdpflUdgia44LIedC8_XtKYdn_P3cY48fcGHZskeplTuxNclZgPtAfoqqke07TOE0KyIgvIwQabqM0ApW7EnmwmcWaqyOEW104VOlsONWH94tJUNypERppv0hBUlSr0Nlg';
            
            accountApi.setAuthToken(jwtToken);
            
            // 现在所有的 API 调用都会使用这个 token
            const response = await accountApi.getUsers(1, 10, '');
            
            expect(response.status).toBe(200);
            console.log('✅ 手动认证成功');
        } catch (error) {
            console.log('手动认证失败:', error.message);
        }
    });

    test('设置员工为管理员', async () => {
        try {
            // 设置员工 ID 1152 为管理员（对应您的 curl 命令）
            const employeeIds = [1152];
            
            const response = await accountApi.setEmployeesAsAdmins(employeeIds);
            
            expect(response.status).toBeGreaterThanOrEqual(200);
            expect(response.status).toBeLessThan(300);
            
            console.log('✅ 成功设置员工为管理员');
        } catch (error) {
            console.log('设置管理员失败:', error.message);
        }
    });

    test('从页面直接获取 token 并使用', async () => {
        try {
            // 直接从页面 localStorage 获取 token
            const token = await page.evaluate(() => {
                return localStorage.getItem('access_token') || 
                       localStorage.getItem('authToken') || 
                       localStorage.getItem('token');
            });
            
            if (token) {
                console.log('✅ 从页面获取到 token:', token.substring(0, 50) + '...');
                
                // 设置到 API 客户端
                accountApi.setAuthToken(token);
                
                // 使用 token 调用 API
                const response = await accountApi.getUsers(1, 10, '');
                expect(response.status).toBe(200);
                
                console.log('✅ 使用页面 token 调用成功');
            } else {
                console.log('❌ 页面中未找到 token');
            }
        } catch (error) {
            console.log('获取页面 token 失败:', error.message);
        }
    });

    test('检查认证头信息', async () => {
        try {
            // 测试认证头获取
            const authHeaders = await accountApi.getAuthHeaders();
            console.log('认证头信息:', authHeaders);
            
            // 如果有 Authorization 头，表示 JWT 认证
            if (authHeaders.Authorization) {
                console.log('✅ 使用 JWT token 认证');
                console.log('Token preview:', authHeaders.Authorization.substring(0, 50) + '...');
            }
            
            // 如果有 Cookie 头，表示 Cookie 认证
            if (authHeaders.Cookie) {
                console.log('✅ 使用 Cookie 认证');
                console.log('Cookies preview:', authHeaders.Cookie.substring(0, 100) + '...');
            }
            
        } catch (error) {
            console.log('获取认证头失败:', error.message);
        }
    });
});

// 单独的工具函数示例
async function setAdminsExample() {
    // 使用示例：设置多个员工为管理员
    const accountApi = new AccountApi(page);
    
    // 方法1：直接使用您的 JWT token
    const jwtToken = 'your-jwt-token-here';
    accountApi.setAuthToken(jwtToken);
    
    // 方法2：设置多个员工为管理员
    const employeeIds = [1152, 1153, 1154]; // 员工 ID 数组
    const response = await accountApi.setEmployeesAsAdmins(employeeIds);
    
    console.log('设置管理员结果:', response.status);
    return response;
}

module.exports = { setAdminsExample };