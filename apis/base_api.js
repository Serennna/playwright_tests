// 基础 API 类
const apiConfig = require('../config/api_config');

class BaseApi {
    constructor(page) {
        this.page = page;
        this.request = page.request;
    }

    /**
     * 获取认证头信息
     * 支持 Cookies 和 JWT Token 两种认证方式
     */
    async getAuthHeaders() {
        const headers = {};
        
        // 1. 尝试从页面获取 JWT token（从 localStorage 或其他地方）
        try {
            const token = await this.page.evaluate(() => {
                return localStorage.getItem('access_token') || 
                       localStorage.getItem('authToken') || 
                       localStorage.getItem('token') ||
                       sessionStorage.getItem('access_token') ||
                       sessionStorage.getItem('authToken') ||
                       sessionStorage.getItem('token');
            });
            
            if (token) {
                headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
                console.log('[API] Using JWT token for authentication');
                return headers;
            }
        } catch (error) {
            console.log('[API] Could not get JWT token from storage:', error.message);
        }
        
        // 2. 回退到 Cookies 认证
        try {
            const cookies = await this.page.context().cookies();
            if (cookies.length > 0) {
                const cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
                headers['Cookie'] = cookieString;
                console.log('[API] Using cookies for authentication');
            }
        } catch (error) {
            console.log('[API] Could not get cookies:', error.message);
        }
        
        return headers;
    }

    /**
     * 手动设置 JWT token
     */
    setAuthToken(token) {
        this.authToken = token;
        console.log('[API] JWT token set manually');
    }

    /**
     * 获取手动设置的认证头
     */
    getManualAuthHeaders() {
        if (this.authToken) {
            return {
                'Authorization': this.authToken.startsWith('Bearer ') ? this.authToken : `Bearer ${this.authToken}`
            };
        }
        return {};
    }

    /**
     * 通用 API 调用方法
     * @param {string} method - HTTP 方法 (GET, POST, PUT, DELETE)
     * @param {string} endpoint - API 端点
     * @param {Object} options - 请求选项
     * @returns {Promise<Object>} API 响应
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

                // 添加认证头信息
                const authHeaders = await this.getAuthHeaders();
                const manualAuthHeaders = this.getManualAuthHeaders();
                
                // 合并认证头（手动设置的优先级更高）
                Object.assign(defaultOptions.headers, authHeaders, manualAuthHeaders);

                if (options.data) {
                    defaultOptions.data = JSON.stringify(options.data);
                }

                console.log(`[API] ${method} ${url} (attempt ${attempt}/${times})`);
                if (options.data) {
                    console.log(`[API] Request data:`, JSON.stringify(options.data, null, 2));
                }
                
                const response = await this.request[method.toLowerCase()](url, defaultOptions);
                
                console.log(`[API] Response status: ${response.status()}`);
                
                // 尝试解析响应为 JSON
                let responseData;
                try {
                    responseData = await response.json();
                    console.log(`[API] Response data:`, JSON.stringify(responseData, null, 2));
                } catch (e) {
                    responseData = await response.text();
                    console.log(`[API] Response text:`, responseData);
                }

                const result = {
                    status: response.status(),
                    statusText: response.statusText(),
                    headers: response.headers(),
                    data: responseData,
                    response: response
                };

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
     * GET 请求
     */
    async get(endpoint, options = {}) {
        return await this.apiCall('GET', endpoint, options);
    }

    /**
     * POST 请求
     */
    async post(endpoint, data = null, options = {}) {
        const postOptions = {
            ...options,
            data: data
        };
        return await this.apiCall('POST', endpoint, postOptions);
    }

    /**
     * PUT 请求
     */
    async put(endpoint, data = null, options = {}) {
        const putOptions = {
            ...options,
            data: data
        };
        return await this.apiCall('PUT', endpoint, putOptions);
    }

    /**
     * DELETE 请求
     */
    async delete(endpoint, options = {}) {
        return await this.apiCall('DELETE', endpoint, options);
    }

    /**
     * 带认证的 API 调用（已经在 apiCall 中自动处理）
     */
    async authenticatedCall(method, endpoint, options = {}) {
        return await this.apiCall(method, endpoint, options);
    }

    /**
     * 数据验证助手
     */
    
    // 验证 API 响应结构
    validateResponse(response, expectedFields = []) {
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

    /**
     * 等待 API 响应满足条件
     */
    async waitForCondition(apiCall, condition, timeout = 10000, interval = 1000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            try {
                const response = await apiCall();
                if (condition(response)) {
                    return response;
                }
            } catch (error) {
                console.log('API call failed during wait, retrying...', error.message);
            }
            
            await this.page.waitForTimeout(interval);
        }
        
        throw new Error(`Condition not met within ${timeout}ms`);
    }
}

module.exports = BaseApi;