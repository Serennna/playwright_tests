const { urls } = require('../config/api_config')
const BaseAPI = require('./base_api')

class AccountSetupAPI extends BaseAPI {
  constructor(email, password) {
    super(email, password)
  }

  async queryUsers(current=1, pageSize=10, keyword='') {
    const response = await this.get(urls.admin.users, {current, pageSize, keyword})
    return response
  } 

  async getUsersTotal() {
    const response = this.queryUsers()
    if (response.status === 200) {
      return response.data.data.pageResult.total
    } else {
      return null
    }
  }

  async getUsersID(search='') {
    const response = await this.queryUsers(1,1000,search)
    if (response.status === 200) {
      return response.data.data.data.map(user => user.id)
    } else {
      return null
    }
  }

  async deleteUser(id=[]) {
    const response = await this.delete(urls.admin.users, {id})
    if (response.status === 200) {
      return true
    } else {
      return null
    }
  }

  async setUserAdmin(id=[]) {  
    const response = await this.post(urls.admin.setUserAdmin, {id})
    return response
  }

}

module.exports = AccountSetupAPI