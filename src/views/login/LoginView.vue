<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="login-title">酒店管理系统</h2>
      <el-form
        :model="loginForm"
        :rules="loginRules"
        ref="loginFormRef"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用户名"
            size="large"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/counter'
import { loginAPI } from '@/apis/authAPI'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const loginFormRef = ref()

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  try {
    await loginFormRef.value.validate()
    loading.value = true

    // 调用实际登录API - 根据API文档，需要发送完整的User对象
    const loginData = {
      userId: 0,  // API文档显示userId是可选的，设为0
      userName: loginForm.username,
      userPassword: loginForm.password,
      userRole: ""  // API文档显示userRole是可选的，设为空字符串
    }

    console.log('发送登录请求:', loginData)
    const res = await loginAPI(loginData)
    console.log('登录API响应:', res)

    // 检查登录是否成功 - 根据实际API响应，成功时code为1
    if (res && res.code === 1) {
      // 登录成功，保存用户信息
      const token = res.data?.token || 'token-' + Date.now()
      const userInfo = res.data?.user || {}
      userStore.login(userInfo.userName || loginForm.username, token)

      ElMessage.success('登录成功')
      router.push('/branch/list')
    } else {
      // 登录失败，统一显示用户名或密码错误
      ElMessage.error('用户名或密码错误')
    }

  } catch (error) {
    console.error('登录请求失败:', error)
    ElMessage.error('网络请求失败，请检查网络连接')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.login-title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
}

.login-form {
  width: 100%;
}

.login-btn {
  width: 100%;
}
</style>
