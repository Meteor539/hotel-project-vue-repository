<template>
  <div class="user-add">
    <div class="wrapper">
      <div class="title">{{ isEdit ? '编辑用户' : '新增用户' }}</div>
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="formData.userName" placeholder="请输入用户名" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="用户密码" prop="userPassword">
          <el-input 
            v-model="formData.userPassword" 
            type="password" 
            placeholder="请输入用户密码" 
            show-password 
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword" v-if="!isEdit || formData.userPassword">
          <el-input 
            v-model="formData.confirmPassword" 
            type="password" 
            placeholder="请再次输入密码" 
            show-password 
          />
        </el-form-item>
        <el-form-item label="用户角色" prop="userRole">
          <el-select v-model="formData.userRole" placeholder="请选择用户角色">
            <el-option label="管理员" value="admin" />
            <el-option label="经理" value="manager" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建人" prop="createdBy" v-if="isEdit">
          <el-input v-model="formData.createdBy" disabled />
        </el-form-item>
        <el-form-item label="更新人" prop="updatedBy">
          <el-input v-model="formData.updatedBy" placeholder="请输入更新人编号" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">{{ isEdit ? '更新' : '保存' }}</el-button>
          <el-button @click="resetForm">重置</el-button>
          <el-button @click="goBack">返回</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { addUserAPI, updateUserAPI, getUserByIdAPI } from '@/apis/userAPI'

const router = useRouter()
const route = useRoute()
const formRef = ref()

// 判断是否为编辑模式
const isEdit = ref(false)

const formData = reactive({
  userId: null,
  userName: '',
  userPassword: '',
  confirmPassword: '',
  userRole: 'user',
  createdBy: '000001',
  updatedBy: '000001'
})

// 表单验证规则
const rules = reactive({
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度在 3 到 50 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  userPassword: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 100, message: '密码长度在 6 到 100 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value !== formData.userPassword) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  userRole: [
    { required: true, message: '请选择用户角色', trigger: 'change' }
  ],
  updatedBy: [
    { required: true, message: '请输入更新人编号', trigger: 'blur' },
    { len: 6, message: '更新人编号必须是6位', trigger: 'blur' }
  ]
})

// 加载用户详情（编辑模式）
const loadUserDetail = async (id) => {
  try {
    console.log('进入编辑模式，用户ID:', id)
    
    const res = await getUserByIdAPI(id)
    console.log('用户详情API响应:', res)

    if (res && res.code === 1 && res.data) {
      const userData = res.data
      
      // 填充表单数据
      formData.userId = userData.userId || userData.user_id
      formData.userName = userData.userName || userData.user_name
      formData.userPassword = '' // 编辑时不显示原密码
      formData.confirmPassword = ''
      formData.userRole = userData.userRole || userData.user_role
      formData.createdBy = userData.createdBy || userData.created_by
      formData.updatedBy = userData.updatedBy || userData.updated_by
      
      console.log('填充后的表单数据:', formData)
    } else {
      console.error('用户详情API响应格式不正确:', res)
      ElMessage.error('获取用户详情失败')
    }
  } catch (error) {
    console.error('加载用户详情失败:', error)
    ElMessage.error('加载用户详情失败')
  }
}

// 提交表单
const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const submitData = {
          userName: formData.userName,
          userPassword: formData.userPassword,
          userRole: formData.userRole,
          updatedBy: formData.updatedBy
        }

        if (isEdit.value) {
          submitData.userId = formData.userId
          submitData.createdBy = formData.createdBy
        } else {
          submitData.createdBy = formData.createdBy
        }

        console.log('提交数据:', submitData)

        let res
        if (isEdit.value) {
          res = await updateUserAPI(submitData)
        } else {
          res = await addUserAPI(submitData)
        }

        console.log('提交API响应:', res)

        if (res && res.code === 1) {
          ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
          router.push('/user/list')
        } else {
          ElMessage.error(res?.msg || (isEdit.value ? '更新失败' : '添加失败'))
        }
      } catch (error) {
        console.error('提交失败:', error)
        ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
      }
    } else {
      console.log('表单验证失败')
      ElMessage.error('请检查表单输入')
    }
  })
}

// 重置表单
const resetForm = () => {
  formRef.value.resetFields()
  if (!isEdit.value) {
    formData.userRole = 'user'
    formData.createdBy = '000001'
    formData.updatedBy = '000001'
  }
}

// 返回列表
const goBack = () => {
  router.push('/user/list')
}

// 页面初始化
onMounted(() => {
  console.log('页面初始化，路由参数:', route.query)

  // 检查是否为编辑模式
  if (route.query.id && route.query.mode === 'edit') {
    console.log('进入编辑模式，用户ID:', route.query.id)
    isEdit.value = true
    formData.userId = route.query.id
    loadUserDetail(route.query.id)
  } else {
    console.log('进入新增模式')
  }
})
</script>

<style lang="scss" scoped>
.user-add {
  margin: 10px;
}

.wrapper {
  padding: 10px;
  margin: 10px;
  background-color: #fff;

  .title {
    background-color: #f6f6f6;
    height: 50px;
    line-height: 50px;
    font-weight: bold;
    padding-left: 10px;
    margin-bottom: 20px;
  }
}
</style>
