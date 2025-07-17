<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2>酒店管理系统</h2>
        <p>RBAC权限管理登录</p>
      </div>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="userName">
          <el-input
            v-model="loginForm.userName"
            placeholder="请输入用户名"
            size="large"
            prefix-icon="User"
            clearable
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            prefix-icon="Lock"
            show-password
            clearable
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-button"
            :loading="loading"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="test-accounts">
        <h4>测试账号</h4>
        <div class="account-list">
          <div class="account-item" @click="fillAccount('陈海', '123456')">
            <span class="role">系统管理员</span>
            <span class="name">陈海 / 123456</span>
          </div>
          <div class="account-item" @click="fillAccount('刘东', '123456')">
            <span class="role">分店经理</span>
            <span class="name">刘东 / 123456 (北京朝阳店)</span>
          </div>
          <div class="account-item" @click="fillAccount('林璐', '123456')">
            <span class="role">酒店前台</span>
            <span class="name">林璐 / 123456 (北京朝阳店)</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// 表单引用
const loginFormRef = ref()

// 加载状态
const loading = ref(false)

// 登录表单数据
const loginForm = reactive({
  userName: '',
  password: ''
})

// 表单验证规则
const loginRules = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

// 填充测试账号
const fillAccount = (userName, password) => {
  loginForm.userName = userName
  loginForm.password = password
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    // 验证表单
    await loginFormRef.value.validate()
    
    loading.value = true
    
    // 调用登录接口
    const result = await userStore.login({
      userName: loginForm.userName,
      password: loginForm.password
    })
    
    if (result.success) {
      ElMessage.success('登录成功')
      
      // 跳转到首页
      router.push('/')
    } else {
      ElMessage.error(result.message || '登录失败')
    }
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error('登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}

// 页面挂载时检查是否已登录
onMounted(() => {
  // 恢复用户状态
  userStore.restoreUserState()
  
  // 如果已登录，直接跳转到首页
  if (userStore.isLoggedIn) {
    router.push('/')
  }
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-box {
  background: white;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  color: #303133;
  margin-bottom: 8px;
  font-size: 28px;
  font-weight: 600;
}

.login-header p {
  color: #909399;
  font-size: 14px;
  margin: 0;
}

.login-form {
  margin-bottom: 30px;
}

.login-button {
  width: 100%;
  height: 45px;
  font-size: 16px;
  font-weight: 500;
}

.test-accounts {
  border-top: 1px solid #ebeef5;
  padding-top: 20px;
}

.test-accounts h4 {
  color: #606266;
  font-size: 14px;
  margin-bottom: 15px;
  text-align: center;
}

.account-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.account-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 12px;
}

.account-item:hover {
  background: #e6f7ff;
  transform: translateY(-1px);
}

.account-item .role {
  color: #409eff;
  font-weight: 500;
}

.account-item .name {
  color: #606266;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-box {
    padding: 30px 20px;
  }
  
  .login-header h2 {
    font-size: 24px;
  }
}
</style>
