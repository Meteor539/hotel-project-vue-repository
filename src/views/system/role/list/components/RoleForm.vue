<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑角色' : '新增角色'"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="角色名称" prop="roleName">
        <el-input
          v-model="formData.roleName"
          placeholder="请输入角色名称"
          maxlength="60"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="角色状态" prop="roleStatus">
        <el-radio-group v-model="formData.roleStatus">
          <el-radio label="a">激活</el-radio>
          <el-radio label="d">禁用</el-radio>
        </el-radio-group>
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
import { createRoleAPI, updateRoleAPI, getRoleByIdAPI } from '@/apis/rbacAPI'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const emit = defineEmits(['refresh'])

// 响应式数据
const dialogVisible = ref(false)
const loading = ref(false)
const isEdit = ref(false)
const formRef = ref()

// 表单数据
const formData = reactive({
  roleId: null,
  roleName: '',
  roleStatus: 'a'
})

// 表单验证规则
const formRules = {
  roleName: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 60, message: '角色名称长度在2到60个字符', trigger: 'blur' }
  ],
  roleStatus: [
    { required: true, message: '请选择角色状态', trigger: 'change' }
  ]
}

// 打开对话框
const open = async (roleData = null) => {
  isEdit.value = !!roleData
  dialogVisible.value = true

  if (roleData) {
    // 编辑模式，填充数据
    await fillFormData(roleData)
  } else {
    // 新增模式，重置表单
    resetForm()
  }
}

// 填充表单数据
const fillFormData = async (roleData) => {
  try {
    // 获取角色详细信息
    const res = await getRoleByIdAPI(roleData.roleId)
    if (res && res.code === 200 && res.data) {
      const role = res.data
      formData.roleId = role.id || role.roleId
      formData.roleName = role.name || role.roleName
      formData.roleStatus = role.status || role.roleStatus
    } else {
      // 如果获取详情失败，使用传入的数据
      formData.roleId = roleData.roleId
      formData.roleName = roleData.roleName
      formData.roleStatus = roleData.roleStatus === '激活' ? 'a' : 'd'
    }
  } catch (error) {
    console.error('获取角色信息失败:', error)
    // 使用传入的数据作为备选
    formData.roleId = roleData.roleId
    formData.roleName = roleData.roleName
    formData.roleStatus = roleData.roleStatus === '激活' ? 'a' : 'd'
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    roleId: null,
    roleName: '',
    roleStatus: 'a'
  })
  
  nextTick(() => {
    formRef.value?.clearValidate()
  })
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
      // 更新角色
      await updateRoleAPI({
        id: formData.roleId,
        name: formData.roleName,
        status: formData.roleStatus,
        updatedBy: userStore.userInfo.userId
      })

      ElMessage.success('更新角色成功')
    } else {
      // 创建角色
      await createRoleAPI({
        name: formData.roleName,
        status: formData.roleStatus,
        createdBy: userStore.userInfo.userId
      })

      ElMessage.success('创建角色成功')
    }

    dialogVisible.value = false
    resetForm()
    emit('refresh')
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error(isEdit.value ? '更新角色失败' : '创建角色失败')
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
