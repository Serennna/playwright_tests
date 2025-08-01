// API 助手工具类
const apiConfig = require('../config/api_config');

class ApiHelper {
    constructor(page) {
        this.page = page;
        this.request = page.request;
    }

    /**
     * 生成测试员工数据
     * @param {string} prefix - 名称前缀，默认为'test'
     * @returns {Object} 包含name和email的对象
     */
    static generateEmployeeData(prefix = 'test') {
        const randomCode = Math.random().toString(36).substring(2, 8);
        return {
            name: `${prefix}${randomCode}`,
            email: `serena+${randomCode}@57blocks.com`
        };
    }

    /**
     * 批量 API 操作助手
     */
    
    // 批量添加测试用户
    async batchCreateTestUsers(count = 5) {
        const users = [];
        for (let i = 0; i < count; i++) {
            const randomCode = Math.random().toString(36).substring(2, 8);
            users.push({
                name: `test-user-${randomCode}`,
                email: `test+${randomCode}@57blocks.com`
            });
        }

        const results = [];
        for (const user of users) {
            try {
                const response = await this.createUser(user);
                results.push({ success: true, user, response });
                console.log(`✅ Created user: ${user.email}`);
            } catch (error) {
                results.push({ success: false, user, error: error.message });
                console.log(`❌ Failed to create user: ${user.email}`);
            }
        }

        return results;
    }

    // 清理所有测试用户
    async cleanupAllTestUsers() {
        try {
            const response = await this.getUsers();
            if (response.status === 200 && response.data) {
                const users = Array.isArray(response.data) ? response.data : response.data.users || [];
                const testUsers = users.filter(user => 
                    user.email && (
                        user.email.includes('test+') || 
                        user.email.includes('serena+') ||
                        user.name?.startsWith('test-')
                    )
                );

                let deletedCount = 0;
                for (const user of testUsers) {
                    try {
                        await this.deleteUser(user.id);
                        deletedCount++;
                        console.log(`🗑️ Deleted test user: ${user.email}`);
                    } catch (error) {
                        console.log(`❌ Failed to delete user ${user.email}:`, error.message);
                    }
                }

                return deletedCount;
            }
        } catch (error) {
            console.log('Failed to cleanup test users:', error.message);
        }
        return 0;
    }

    /**
     * 基础 API 操作
     */
    
    // 获取用户列表
    async getUsers() {
        return await this.apiCall('GET', apiConfig.endpoints.employees);
    }

    // 创建用户
    async createUser(userData) {
        return await this.apiCall('POST', apiConfig.endpoints.employees, { data: userData });
    }

    // 删除用户
    async deleteUser(userId) {
        return await this.apiCall('DELETE', apiConfig.endpoints.employeeById(userId));
    }

    // 根据邮箱查找用户
    async findUserByEmail(email) {
        return await this.apiCall('GET', apiConfig.endpoints.employeeByEmail(email));
    }

    /**
     * 通用 API 调用方法（带重试机制）
     */
    async apiCall(method, endpoint, options = {}) {
        const url = `${apiConfig.getCurrentApiUrl()}${endpoint}`;
        const { times, delay } = apiConfig.retry;

        for (let attempt = 1; attempt <= times; attempt++) {
            try {
                const defaultOptions = {
                    headers: {
                        ...apiConfig.defaultHeaders,
                        ...options.headers
                    },
                    timeout: apiConfig.timeout.default,
                    ...options
                };

                // 如果有 cookies，自动添加认证
                const cookies = await this.page.context().cookies();
                if (cookies.length > 0) {
                    const cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
                    defaultOptions.headers['Cookie'] = cookieString;
                }

                if (options.data) {
                    defaultOptions.data = JSON.stringify(options.data);
                }

                console.log(`[API] ${method} ${url} (attempt ${attempt}/${times})`);
                
                const response = await this.request[method.toLowerCase()](url, defaultOptions);
                
                // 解析响应
                let responseData;
                try {
                    responseData = await response.json();
                } catch (e) {
                    responseData = await response.text();
                }

                const result = {
                    status: response.status(),
                    statusText: response.statusText(),
                    headers: response.headers(),
                    data: responseData,
                    response: response
                };

                console.log(`[API] Response status: ${result.status}`);
                
                // 如果成功，返回结果
                if (response.ok()) {
                    return result;
                }

                // 如果是最后一次尝试，抛出错误
                if (attempt === times) {
                    throw new Error(`API call failed: ${result.status} ${result.statusText}`);
                }

            } catch (error) {
                console.log(`[API] Attempt ${attempt} failed:`, error.message);
                
                // 如果是最后一次尝试，抛出错误
                if (attempt === times) {
                    throw error;
                }

                // 等待后重试
                await this.page.waitForTimeout(delay);
            }
        }
    }

    /**
     * 数据验证助手
     */
    
    // 验证 API 响应结构
    validateApiResponse(response, expectedFields = []) {
        const errors = [];

        if (!response) {
            errors.push('Response is null or undefined');
            return errors;
        }

        if (!response.status || response.status < 200 || response.status >= 400) {
            errors.push(`Invalid status code: ${response.status}`);
        }

        if (response.data && expectedFields.length > 0) {
            const data = Array.isArray(response.data) ? response.data[0] : response.data;
            
            for (const field of expectedFields) {
                if (!(field in data)) {
                    errors.push(`Missing field: ${field}`);
                }
            }
        }

        return errors;
    }

    // 比较 UI 和 API 数据
    async compareUIAndAPIData(uiData, apiEndpoint) {
        try {
            const apiResponse = await this.apiCall('GET', apiEndpoint);
            
            if (apiResponse.status !== 200) {
                return { success: false, error: `API call failed: ${apiResponse.status}` };
            }

            const differences = [];
            const apiData = apiResponse.data;

            // 简单比较逻辑（根据实际需求调整）
            if (JSON.stringify(uiData) !== JSON.stringify(apiData)) {
                differences.push({
                    type: 'content_mismatch',
                    ui: uiData,
                    api: apiData
                });
            }

            return {
                success: differences.length === 0,
                differences: differences,
                uiData: uiData,
                apiData: apiData
            };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = ApiHelper;