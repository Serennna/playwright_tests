// api_config.js

// Define BASE_URL as a constant first
const BASE_URL = 'https://ohhello-dev-909a7.web.app/api/v1';

module.exports = {
    // API 基础 URL 配置
    BASE_URL: BASE_URL,

    // API 端点配置
    urls: {
        admin:{
            users:`${BASE_URL}/users`,
            setUserAdmin:`${BASE_URL}/roles/admins`,
        },
        employee:{
        },
        mentor:{
        },
        auth: {
            login: `${BASE_URL}/auth/login`,
            logout: `${BASE_URL}/auth/logout`,
            profile: `${BASE_URL}/auth/profile`
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