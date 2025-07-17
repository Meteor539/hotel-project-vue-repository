import { defineStore } from 'pinia'
import { ref } from 'vue'
import { rbacLoginAPI } from '@/apis/rbacAPI'

export const useUserStore = defineStore('user', () => {
  // 用户信息
  const userInfo = ref({
    userId: '',
    userName: '',
    branchId: null,
    userStatus: ''
  })

  // 用户权限列表
  const permissions = ref([])

  // 用户Token
  const token = ref('')

  // 是否已登录
  const isLoggedIn = ref(false)

  // 登录方法
  const login = async (loginData) => {
    try {
      console.log('发送登录请求:', loginData)
      const res = await rbacLoginAPI(loginData)
      console.log('登录响应:', res)

      if ((res.code === 200 || res.code === 1) && res.data) {
        // 保存用户信息
        userInfo.value = res.data.user
        permissions.value = res.data.permissions || []
        token.value = res.data.token
        isLoggedIn.value = true

        // 保存到localStorage
        localStorage.setItem('hotel_token', res.data.token)
        localStorage.setItem('hotel_user', JSON.stringify(res.data.user))
        localStorage.setItem('hotel_permissions', JSON.stringify(res.data.permissions || []))

        console.log('登录成功，用户信息:', userInfo.value)
        return { success: true, data: res.data }
      } else {
        console.log('登录失败，响应码:', res.code, '消息:', res.message)
        return { success: false, message: res.message || '登录失败' }
      }
    } catch (error) {
      console.error('登录错误:', error)
      return { success: false, message: error.response?.data?.message || '登录请求失败' }
    }
  }

  // 登出方法
  const logout = () => {
    userInfo.value = {
      userId: '',
      userName: '',
      branchId: null,
      userStatus: ''
    }
    permissions.value = []
    token.value = ''
    isLoggedIn.value = false

    // 清除localStorage
    localStorage.removeItem('hotel_token')
    localStorage.removeItem('hotel_user')
    localStorage.removeItem('hotel_permissions')
  }

  // 从localStorage恢复用户状态
  const restoreUserState = () => {
    const savedToken = localStorage.getItem('hotel_token')
    const savedUser = localStorage.getItem('hotel_user')
    const savedPermissions = localStorage.getItem('hotel_permissions')

    if (savedToken && savedUser) {
      token.value = savedToken
      userInfo.value = JSON.parse(savedUser)
      permissions.value = savedPermissions ? JSON.parse(savedPermissions) : []
      isLoggedIn.value = true
    }
  }

  // 检查用户是否有指定权限
  const hasPermission = (permissionCode) => {
    return permissions.value.includes(permissionCode)
  }

  // 检查用户是否有任一权限
  const hasAnyPermission = (permissionCodes) => {
    return permissionCodes.some(code => permissions.value.includes(code))
  }

  // 检查用户是否有所有权限
  const hasAllPermissions = (permissionCodes) => {
    return permissionCodes.every(code => permissions.value.includes(code))
  }

  // 是否为系统管理员（branchId为null）
  const isSystemAdmin = () => {
    return userInfo.value.branchId === null
  }

  // 是否为分店用户
  const isBranchUser = () => {
    return userInfo.value.branchId !== null
  }

  // 获取用户所属分店ID
  const getUserBranchId = () => {
    return userInfo.value.branchId
  }

  return {
    // 状态
    userInfo,
    permissions,
    token,
    isLoggedIn,
    
    // 方法
    login,
    logout,
    restoreUserState,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isSystemAdmin,
    isBranchUser,
    getUserBranchId
  }
})
