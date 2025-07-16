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
            prefix-icon="User"
            size="large"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            prefix-icon="Lock"
            size="large"
            show-password
          />
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
import { useUserStore } from '@/stores/counter'
import { loginAPI } from '@/apis/authAPI'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const loginFormRef = ref()

const loginForm = reactive({
  username: 'admin',
  password: '123456'
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

    try {
      // 调用实际登录API
      const loginData = {
        userName: loginForm.username,
        userPassword: loginForm.password
      }

      const res = await loginAPI(loginData)
      console.log('登录API响应:', res)

      if (res && res.code === 1) {
        // 登录成功，保存用户信息
        const token = res.data?.token || 'token-' + Date.now()
        userStore.login(loginForm.username, token)

        ElMessage.success('登录成功')
        router.push('/branch/list')
      } else {
        throw new Error(res?.msg || '登录失败')
      }
    } catch (apiError) {
      console.warn('API登录失败，使用模拟登录:', apiError)
      // API调用失败时使用模拟登录
      const mockToken = 'mock-token-' + Date.now()
      userStore.login(loginForm.username, mockToken)

      ElMessage.success('登录成功（模拟）')
      router.push('/branch/list')
    }

  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error('登录失败，请检查用户名和密码')
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
