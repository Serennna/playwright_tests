// helpers/baseApi.js
const axios = require('axios');

const FIREBASE_API_KEY = 'AIzaSyCpZlq-Gxqhh3T-eQC33vVMbNFGqhSu8kg';
const FIREBASE_LOGIN_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;

class BaseAPI {
  constructor(email, password) {
    this.email = email;
    this.password = password;
    this.idToken = null;
    this.axiosInstance = axios.create();
  }

  async login() {
    try {
      const res = await axios.post(FIREBASE_LOGIN_URL, {
        email: this.email,
        password: this.password,
        returnSecureToken: true
      });

      this.idToken = res.data.idToken;
      this.axiosInstance = axios.create({
        headers: {
          Authorization: `Bearer ${this.idToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ 登录成功，Token 截断：', this.idToken.slice(0, 20) + '...');
    } catch (err) {
      console.error('❌ 登录失败：', err.response?.data || err.message);
      throw err;
    }
  }

  async request(method, url, data = null) {
    if (!this.idToken) throw new Error('🚨 未登录，无法调用接口');

    try {
      const res = await this.axiosInstance({
        method,
        url,
        data
      });
      return res.data;
    } catch (err) {
      console.error(`❌ API 请求失败：${method} ${url}`, err.response?.data || err.message);
      throw err;
    }
  }

  get(url, params) {
    return this.request('GET', url, params);
  }

  post(url, data) {
    return this.request('POST', url, data);
  }

  put(url, data) {
    return this.request('PUT', url, data);
  }

  delete(url, data) {
    return this.request('DELETE', url, data);
  }
}

module.exports = BaseAPI;
