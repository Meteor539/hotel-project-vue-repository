<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑用户' : '新增用户'"
    width="600px"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="用户ID" prop="userId">
        <el-input
          v-model="formData.userId"
          placeholder="请输入6位用户ID"
          :disabled="isEdit"
          maxlength="6"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="用户姓名" prop="userName">
        <el-input
          v-model="formData.userName"
          placeholder="请输入用户姓名"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item v-if="!isEdit" label="密码" prop="userPwd">
        <el-input
          v-model="formData.userPwd"
          type="password"
          placeholder="请输入密码"
          show-password
          maxlength="100"
        />
      </el-form-item>

      <el-form-item v-if="!isEdit" label="确认密码" prop="confirmPwd">
        <el-input
          v-model="formData.confirmPwd"
          type="password"
          placeholder="请再次输入密码"
          show-password
          maxlength="100"
        />
      </el-form-item>

      <el-form-item label="用户状态" prop="userStatus">
        <el-radio-group v-model="formData.userStatus">
          <el-radio label="a">正常</el-radio>
          <el-radio label="d">禁用</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="所属分店" prop="branchId">
        <el-select
          v-model="formData.branchId"
          placeholder="请选择所属分店"
          clearable
          style="width: 100%"
        >
          <el-option label="系统管理员" :value="null" />
          <el-option
            v-for="branch in branchList"
            :key="branch.id"
            :label="branch.name"
            :value="branch.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="用户角色" prop="roleIds">
        <el-checkbox-group v-model="formData.roleIds">
          <el-checkbox
            v-for="role in roleList"
            :key="role.id"
            :label="role.id"
          >
            {{ role.name }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  createSysUserAPI, 
  updateSysUserAPI, 
  getSysUserByIdAPI,
  assignUserRolesBatchAPI,
  getUserRoleIdsAPI
} from '@/apis/rbacAPI'
import { getAllBranchesAPI } from '@/apis/branchAPI'
import { getActiveRolesAPI } from '@/apis/rbacAPI'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const emit = defineEmits(['refresh'])

// 响应式数据
const dialogVisible = ref(false)
const loading = ref(false)
const isEdit = ref(false)
const formRef = ref()
const branchList = ref([])
const roleList = ref([])

// 表单数据
const formData = reactive({
  userId: '',
  userName: '',
  userPwd: '',
  confirmPwd: '',
  userStatus: 'a',
  branchId: null,
  roleIds: []
})

// 表单验证规则
const formRules = {
  userId: [
    { required: true, message: '请输入用户ID', trigger: 'blur' },
    { len: 6, message: '用户ID必须为6位', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9]+$/, message: '用户ID只能包含字母和数字', trigger: 'blur' }
  ],
  userName: [
    { required: true, message: '请输入用户姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '用户姓名长度在2到50个字符', trigger: 'blur' }
  ],
  userPwd: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPwd: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== formData.userPwd) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  userStatus: [
    { required: true, message: '请选择用户状态', trigger: 'change' }
  ]
}

// 打开对话框
const open = async (userData = null) => {
  isEdit.value = !!userData
  dialogVisible.value = true

  // 加载基础数据
  await Promise.all([
    loadBranches(),
    loadRoles()
  ])

  if (userData) {
    // 编辑模式，填充数据
    await fillFormData(userData)
  } else {
    // 新增模式，重置表单
    resetForm()
  }
}

// 填充表单数据
const fillFormData = async (userData) => {
  try {
    // 获取用户详细信息
    const userRes = await getSysUserByIdAPI(userData.userId)
    if (userRes && userRes.code === 200 && userRes.data) {
      const user = userRes.data
      formData.userId = user.userId
      formData.userName = user.userName
      formData.userStatus = user.userStatus
      formData.branchId = user.branchId
    }

    // 获取用户角色
    const roleRes = await getUserRoleIdsAPI(userData.userId)
    if (roleRes && roleRes.code === 200 && roleRes.data) {
      formData.roleIds = roleRes.data || []
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    userId: '',
    userName: '',
    userPwd: '',
    confirmPwd: '',
    userStatus: 'a',
    branchId: null,
    roleIds: []
  })
  
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

// 加载分店列表
const loadBranches = async () => {
  try {
    const res = await getAllBranchesAPI()
    if (res && res.data) {
      branchList.value = (res.data || []).map(branch => ({
        id: branch.id || branch.branchId,
        name: branch.name || branch.branchName
      }))
    }
  } catch (error) {
    console.error('加载分店列表失败:', error)
  }
}

// 加载角色列表
const loadRoles = async () => {
  try {
    const res = await getActiveRolesAPI()
    if (res && res.code === 200 && res.data) {
      roleList.value = (res.data || []).map(role => ({
        id: role.id || role.roleId,
        name: role.name || role.roleName
      }))
    }
  } catch (error) {
    console.error('加载角色列表失败:', error)
  }
}

// 处理取消
const handleCancel = () => {
  dialogVisible.value = false
  resetForm()
}

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    if (isEdit.value) {
      // 更新用户
      await updateSysUserAPI({
        userId: formData.userId,
        userName: formData.userName,
        userStatus: formData.userStatus,
        branchId: formData.branchId,
        updatedBy: userStore.userInfo.userId
      })

      // 更新用户角色
      if (formData.roleIds.length > 0) {
        await assignUserRolesBatchAPI({
          userId: formData.userId,
          roleIds: formData.roleIds
        })
      }

      ElMessage.success('更新用户成功')
    } else {
      // 创建用户
      await createSysUserAPI({
        userId: formData.userId,
        userPwd: formData.userPwd,
        userName: formData.userName,
        userStatus: formData.userStatus,
        branchId: formData.branchId,
        createdBy: userStore.userInfo.userId
      })

      // 分配用户角色
      if (formData.roleIds.length > 0) {
        await assignUserRolesBatchAPI({
          userId: formData.userId,
          roleIds: formData.roleIds
        })
      }

      ElMessage.success('创建用户成功')
    }

    dialogVisible.value = false
    resetForm()
    emit('refresh')
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error(isEdit.value ? '更新用户失败' : '创建用户失败')
  } finally {
    loading.value = false
  }
}

// 暴露方法
defineExpose({
  open
})
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
