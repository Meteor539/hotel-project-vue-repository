import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  // 用户信息
  const userInfo = ref({
    username: '',
    token: ''
  })

  // 是否已登录
  const isLoggedIn = computed(() => !!userInfo.value.token)

  // 登录
  function login(username, token) {
    userInfo.value.username = username
    userInfo.value.token = token
    // 保存到localStorage
    localStorage.setItem('token', token)
    localStorage.setItem('username', username)
  }

  // 退出登录
  function logout() {
    userInfo.value.username = ''
    userInfo.value.token = ''
    // 清除localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('username')
  }

  // 初始化用户信息（从localStorage恢复）
  function initUserInfo() {
    const token = localStorage.getItem('token')
    const username = localStorage.getItem('username')
    if (token && username) {
      userInfo.value.token = token
      userInfo.value.username = username
    }
  }

  return {
    userInfo,
    isLoggedIn,
    login,
    logout,
    initUserInfo
  }
})
