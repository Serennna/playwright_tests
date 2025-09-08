const { urls } = require('../config/api_config')
const BaseAPI = require('./base_api')

class MentorsAPI extends BaseAPI {
  constructor(email, password) {
    super(email, password)
  }

  /**
   * 
   * @param {number} current 当前页面
   * @param {number} pageSize 每页条数
   * @param {string} keyword 搜索关键词
   * @param {string} companyId 公司名称ID+
   * @param {string} skillId 技能ID+
   * @returns 
   */
  async getMentors(current=1, pageSize=10,keyword='',companyId='',skillId='') {
    // current, pageSize, keyword, companyId, skillId
    const response = await this.get(urls.mentors.getMentors, {current, pageSize, keyword, companyId, skillId})
    return response
  }

  async updateMentorName(mentorId, updatedName) {
    // mentorId, updatedName
    const response = await this.put(urls.mentors.settings, {mentorId, updatedName})
    return response
  }

  
}

module.exports = MentorsAPI