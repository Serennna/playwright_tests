// 账户管理 API 类
const BaseApi = require('./base_api');
const apiConfig = require('../config/api_config');

class AccountApi extends BaseApi {
    constructor(page) {
        super(page);
    }

    /**
     * ===================== Account Setup API =====================
     */

    /**
     * 获取用户列表（使用真实的 API 端点）
     */
    async getUsers(current = 1, pageSize = 10, keyword = '') {
        try {
            const endpoint = apiConfig.endpoints.admin.getUsers(current, pageSize, keyword);
            const response = await this.get(endpoint);
            console.log(`✅ Got users from API (page ${current}, size ${pageSize})`);
            return response;
        } catch (error) {
            console.error('Failed to get users from API:', error.message);
            throw error;
        }
    }

    /**
     * 获取员工列表（兼容旧方法）
     */
    async getEmployees() {
        return await this.getUsers();
    }

    /**
     * 根据 ID 获取员工信息
     */
    async getEmployeeById(employeeId) {
        try {
            const response = await this.get(apiConfig.endpoints.employeeById(employeeId));
            console.log(`✅ Got employee ${employeeId} from API`);
            return response;
        } catch (error) {
            console.error(`Failed to get employee ${employeeId} from API:`, error.message);
            throw error;
        }
    }

    /**
     * 根据邮箱查找员工
     */
    async findEmployeeByEmail(email) {
        try {
            const response = await this.get(apiConfig.endpoints.employeeByEmail(email));
            console.log(`✅ Found employee by email: ${email}`);
            return response;
        } catch (error) {
            console.error(`Failed to find employee by email ${email}:`, error.message);
            throw error;
        }
    }

    /**
     * 添加员工
     */
    async addEmployee(name, email) {
        try {
            const employeeData = {
                name: name,
                email: email
            };
            
            const response = await this.post(apiConfig.endpoints.employees, employeeData);
            console.log(`✅ Added employee via API: ${name} (${email})`);
            return response;
        } catch (error) {
            console.error(`Failed to add employee ${name} (${email}) via API:`, error.message);
            throw error;
        }
    }

    /**
     * 更新员工信息
     */
    async updateEmployee(employeeId, updateData) {
        try {
            const response = await this.put(apiConfig.endpoints.employeeById(employeeId), updateData);
            console.log(`✅ Updated employee ${employeeId} via API`);
            return response;
        } catch (error) {
            console.error(`Failed to update employee ${employeeId} via API:`, error.message);
            throw error;
        }
    }

    /**
     * 删除员工
     */
    async deleteEmployee(employeeId) {
        try {
            const response = await this.delete(apiConfig.endpoints.employeeById(employeeId));
            console.log(`✅ Deleted employee ${employeeId} via API`);
            return response;
        } catch (error) {
            console.error(`Failed to delete employee ${employeeId} via API:`, error.message);
            throw error;
        }
    }

    /**
     * 设置员工为管理员
     */
    async setEmployeesAsAdmins(employeeIds) {
        try {
            // 确保 employeeIds 是数组
            const ids = Array.isArray(employeeIds) ? employeeIds : [employeeIds];
            
            const response = await this.put(apiConfig.endpoints.admin.setUserAdmin(), ids);
            console.log(`✅ Set employees as admins: ${ids.join(', ')}`);
            return response;
        } catch (error) {
            console.error(`Failed to set employees as admins via API:`, error.message);
            throw error;
        }
    }

    /**
     * 设置单个员工为管理员
     */
    async setEmployeeAsAdmin(employeeId, isAdmin = true) {
        if (isAdmin) {
            return await this.setEmployeesAsAdmins([employeeId]);
        } else {
            // 如果有移除管理员权限的 API，在这里实现
            console.warn('Remove admin permission not implemented yet');
            throw new Error('Remove admin permission not implemented');
        }
    }

    /**
     * ===================== 验证和查询方法 =====================
     */

    /**
     * 验证员工是否存在于数据库中
     */
    async verifyEmployeeExists(email) {
        try {
            const response = await this.findEmployeeByEmail(email);
            const exists = response.status === 200 && response.data && (
                Array.isArray(response.data) ? response.data.length > 0 : !!response.data.id
            );
            console.log(`✅ Employee ${email} exists in database: ${exists}`);
            return exists;
        } catch (error) {
            console.warn(`Could not verify employee ${email} exists:`, error.message);
            return false;
        }
    }

    /**
     * 获取员工总数
     */
    async getEmployeeCount() {
        try {
            const response = await this.getEmployees();
            if (response.status === 200 && response.data) {
                const count = Array.isArray(response.data) ? response.data.length : response.data.total || 0;
                console.log(`✅ Total employee count from API: ${count}`);
                return count;
            }
            return 0;
        } catch (error) {
            console.warn('Could not get employee count from API:', error.message);
            return 0;
        }
    }

    /**
     * 等待员工总数达到预期值
     */
    async waitForEmployeeCount(expectedCount, timeout = 10000) {
        console.log(`⏳ Waiting for employee count to reach ${expectedCount}...`);
        
        const condition = (response) => {
            if (response.status === 200 && response.data) {
                const count = Array.isArray(response.data) ? response.data.length : response.data.total || 0;
                return count === expectedCount;
            }
            return false;
        };

        try {
            const response = await this.waitForCondition(
                () => this.getEmployees(),
                condition,
                timeout
            );
            console.log(`✅ Employee count reached ${expectedCount}`);
            return response;
        } catch (error) {
            console.error(`❌ Employee count did not reach ${expectedCount} within ${timeout}ms`);
            throw error;
        }
    }

    /**
     * ===================== 批量操作 =====================
     */

    /**
     * 批量添加员工
     */
    async batchAddEmployees(employees) {
        const results = [];
        
        for (const employee of employees) {
            try {
                const response = await this.addEmployee(employee.name, employee.email);
                results.push({ success: true, employee, response });
            } catch (error) {
                results.push({ success: false, employee, error: error.message });
            }
        }

        const successCount = results.filter(r => r.success).length;
        console.log(`✅ Batch add completed: ${successCount}/${employees.length} successful`);
        
        return results;
    }

    /**
     * 批量删除员工
     */
    async batchDeleteEmployees(employeeIds) {
        const results = [];
        
        for (const employeeId of employeeIds) {
            try {
                const response = await this.deleteEmployee(employeeId);
                results.push({ success: true, employeeId, response });
            } catch (error) {
                results.push({ success: false, employeeId, error: error.message });
            }
        }

        const successCount = results.filter(r => r.success).length;
        console.log(`✅ Batch delete completed: ${successCount}/${employeeIds.length} successful`);
        
        return results;
    }

    /**
     * ===================== 测试数据管理 =====================
     */

    /**
     * 创建测试员工
     */
    async createTestEmployee(prefix = 'test') {
        const randomCode = Math.random().toString(36).substring(2, 8);
        const testEmployee = {
            name: `${prefix}-${randomCode}`,
            email: `serena+${prefix}-${randomCode}@57blocks.com`
        };

        try {
            const response = await this.addEmployee(testEmployee.name, testEmployee.email);
            return { success: true, employee: testEmployee, response };
        } catch (error) {
            return { success: false, employee: testEmployee, error: error.message };
        }
    }

    /**
     * 批量创建测试员工
     */
    async createTestEmployees(count = 5, prefix = 'test') {
        const employees = [];
        for (let i = 0; i < count; i++) {
            const result = await this.createTestEmployee(`${prefix}${i + 1}`);
            employees.push(result);
        }
        
        const successCount = employees.filter(r => r.success).length;
        console.log(`✅ Created ${successCount}/${count} test employees`);
        
        return employees;
    }

    /**
     * 清理测试员工数据
     */
    async cleanupTestEmployees(emailPattern = /serena\+.*@57blocks\.com/) {
        try {
            const response = await this.getEmployees();
            if (response.status !== 200 || !response.data) {
                console.log('No employees data to cleanup');
                return 0;
            }

            const employees = Array.isArray(response.data) ? response.data : response.data.employees || [];
            const testEmployees = employees.filter(emp => 
                emp.email && emailPattern.test(emp.email)
            );

            console.log(`🧹 Found ${testEmployees.length} test employees to cleanup`);
            
            let deletedCount = 0;
            for (const employee of testEmployees) {
                try {
                    await this.deleteEmployee(employee.id);
                    deletedCount++;
                    console.log(`🗑️ Deleted test employee: ${employee.email}`);
                } catch (error) {
                    console.warn(`❌ Failed to delete employee ${employee.email}:`, error.message);
                }
            }
            
            console.log(`✅ Cleanup completed: ${deletedCount}/${testEmployees.length} employees deleted`);
            return deletedCount;
        } catch (error) {
            console.warn('Failed to cleanup test employees:', error.message);
            return 0;
        }
    }

    /**
     * ===================== 数据比较和验证 =====================
     */

    /**
     * 验证员工数据的完整性
     */
    validateEmployeeData(employee, requiredFields = ['id', 'name', 'email']) {
        const errors = [];
        
        if (!employee) {
            errors.push('Employee data is null or undefined');
            return errors;
        }

        for (const field of requiredFields) {
            if (!employee[field]) {
                errors.push(`Missing or empty field: ${field}`);
            }
        }

        // 验证邮箱格式
        if (employee.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employee.email)) {
            errors.push('Invalid email format');
        }

        return errors;
    }

    /**
     * 比较两个员工对象的差异
     */
    compareEmployees(employee1, employee2, fieldsToCompare = ['name', 'email']) {
        const differences = [];
        
        for (const field of fieldsToCompare) {
            if (employee1[field] !== employee2[field]) {
                differences.push({
                    field,
                    value1: employee1[field],
                    value2: employee2[field]
                });
            }
        }
        
        return differences;
    }
}

module.exports = AccountApi;