const { urls } = require('../config/api_config')
const BaseAPI = require('./base_api')

class AdminAPI extends BaseAPI {
  constructor(email, password) {
    super(email, password)
  }

  async queryUsers(current=1, pageSize=10, keyword='') {
    const response = await this.get(urls.admin.users, {current, pageSize, keyword})
    return response
  } 

  async getUsersTotal() {
    const response = await this.queryUsers(1, 100)
    if (response.status === 200) {
      console.log('[Info]Users data:', response.data)
      return response.data.data.pageResult.total
    } else {
      console.log('[Error]Error getting users total:', response.status)
      return null
    }
  }
  

  async getUsersID(search='') {
    try {
      const response = await this.queryUsers(1, 100, search)
      if (response.status === 200) {
        return response.data.data.data.map(user => user.id)
      } else {
        console.log(`[Warning] Failed to get user IDs: ${response.status}`)
        return []
      }
    } catch (error) {
      console.error('[Error] Error getting user IDs:', error.message)
      return []
    }
  }

  // 验证员工是否存在
  async verifyEmployeeExists(email) {
    try {
      const response = await this.queryUsers(1, 100, email)
      if (response.status === 200) {
        const employees = response.data.data.data || []
        return employees.some(emp => emp.user.email === email)
      }
      return false
    } catch (error) {
      console.error('[Error] Error verifying employee existence:', error.message)
      return false
    }
  }

  // 获取特定员工信息
  async getEmployeeByEmail(email) {
    try {
      const response = await this.queryUsers(1, 100, email)
      if (response.status === 200) {
        const employees = response.data.data.data || []
        return employees.find(emp => emp.user.email === email) || null
      }
      return null
    } catch (error) {
      console.error('[Error] Error getting employee by email:', error.message)
      return null
    }
  }

  async deleteUser(id=[]) {
    try {
      // 确保id是数组格式
      const idsArray = Array.isArray(id) ? id : [id]
      
      if (idsArray.length === 0) {
        console.log('[Info] No user ID provided for deletion')
        return true
      }

      console.log(`[Debug] Deleting user(s) with ID(s): ${idsArray}`)
      const response = await this._performDeleteRequest(idsArray)
      return response.status === 200
    } catch (error) {
      console.error('[Error] Failed to delete user:', error.message)
      return false
    }
  }

  async setUserAdmin(id=[]) {  
    const response = await this.post(urls.admin.setUserAdmin, {id})
    return response
  }

  // 添加员工
  async addEmployee(name, email) {
    const response = await this.post(urls.admin.users, { name, email })
    return response
  }

  // 批量删除员工
  async deleteMultipleEmployees(employeeIds) {
    if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
      console.log('[Info] No employee IDs provided for deletion')
      return { success: true, message: 'No employees to delete' }
    }

    try {
      const response = await this.deleteUser(employeeIds)
      console.log(`[Info] Deleted ${employeeIds.length} employees`)
      return response
    } catch (error) {
      console.error('[Error] Failed to delete employees:', error.message)
      throw error
    }
  }

  // 清理测试员工
  async cleanupTestEmployees() {
    try {
      const response = await this.queryUsers(1, 100, 'test')
      
      if (response.status !== 200) {
        console.log('[Warning] Failed to fetch test users for cleanup')
        return
      }

      const data = response.data
      if (!data.data.data || data.data.data.length === 0) {
        console.log('[Info] No test users to delete')
        return
      }

      // 过滤出不是管理员或所有者的测试用户
      const employeeIds = data.data.data
        .filter(employee => {
          const roles = employee.user.roles || []
          return !roles.includes('admin') && !roles.includes('owner')
        })
        .map(employee => employee.user.id)

      if (employeeIds.length === 0) {
        console.log('[Info] No non-admin test users to delete')
        return
      }

      console.log(`[Info] Deleting ${employeeIds.length} test employee IDs: ${employeeIds}`)
      const deleteResponse = await this.deleteMultipleEmployees(employeeIds)
      console.log(`[Info] Delete response status: ${deleteResponse.status}`)

      // 验证清理结果
      const remainingTestUsers = await this.queryUsers(1, 100, 'test')
      const remainingCount = remainingTestUsers.data?.data?.length || 0
      console.log(`[Info] Remaining test users after cleanup: ${remainingCount}`)
      
      return { success: true, deletedCount: employeeIds.length, remainingCount }
    } catch (error) {
      console.error('[Error] Failed to cleanup test employees:', error.message)
      throw error
    }
  }
// Credits API
  async getAllocationMode() {
    const response = await this.get(urls.admin.allocationMode)
    if (response.status === 200) {
      const mode =  response.data.data.mode
      if (mode === 1) {
        return 'fcfs'
      } else{
        return 'cherry-pick'
      }
    } else {
      console.log('[Error]Error getting credit mode:', response.status)
      return null
    }
  }

  async setAllocationMode(mode = 'fcfs') {
    const modeMap = {
      fcfs: 1,
      'first-come': 1, // 可扩展别名
      cherry: 2,
      'cherry-pick': 2,
    };
  
    const allocationMode = modeMap[mode];
    
    if (!allocationMode) {
      throw new Error(`Invalid allocation mode: ${mode}`);
    }
  
    return await this.put(urls.admin.allocationMode, { mode: allocationMode });
  }
  

// Dashboard API
  async viewAllMentorsSortByScore(current=1, pageSize=10,sortBy='score') {
    const response = await this.get(urls.admin.viewAll, {current, pageSize, sortBy})
    return response
  }

  async viewAllMentorsSortBySessionAmounr(current=1, pageSize=10,sortBy='session') {
    const response = await this.get(urls.admin.viewAll, {current, pageSize, sortBy})
    return response
  }

  async viewAllMentorsSortByCreatedTime(current=1, pageSize=10,sortBy='createdAt') {
    const response = await this.get(urls.admin.viewAll, {current, pageSize, sortBy})
    return response
  }


}

module.exports = AdminAPI