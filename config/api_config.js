// API 配置文件
module.exports = {
    // API 基础 URL 配置
    baseUrl: {
        development: 'https://ohhello-dev-909a7.web.app/api/v1',
        production: 'https://ohhello.ai/api'
    },

    // 获取当前环境的 API URL
    getCurrentApiUrl() {
        const env = process.env.NODE_ENV || 'development';
        return this.baseUrl[env] || this.baseUrl.development;
    },

    // API 端点配置
    endpoints: {
        admin:{
            getUsers: (current, pageSize,keyword) => `/users?current=${current}&pageSize=${pageSize}&keyword=${keyword}`,
            setUserAdmin: (id) => `/roles/admins`,
        },
        employee:{
            employees: (current, pageSize,keyword) => `/employees?current=${current}&pageSize=${pageSize}&keyword=${keyword}`,
            employeeById: (id) => `/employees/${id}`,
            employeeByEmail: (email) => `/employees?email=${encodeURIComponent(email)}`,
            setEmployeeAdmin: (id) => `/employees/${id}/admin`,
        },
        auth: {
            login: '/auth/login',
            logout: '/auth/logout',
            profile: '/auth/profile'
        }
    },

    // 默认请求头配置
    defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Playwright-Test-Framework'
    },

    // 超时配置
    timeout: {
        default: 30000,  // 30 秒
        upload: 60000,   // 1 分钟
        download: 120000 // 2 分钟
    },

    // 重试配置
    retry: {
        times: 3,
        delay: 1000 // 1 秒
    }
};