<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑权限' : '新增权限'"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="权限名称" prop="permName">
        <el-input
          v-model="formData.permName"
          placeholder="请输入权限名称"
          maxlength="60"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="权限代码" prop="permCode">
        <el-input
          v-model="formData.permCode"
          placeholder="请输入权限代码，如：room:create"
          maxlength="100"
          show-word-limit
          :disabled="isEdit"
        />
        <div class="form-tip">
          <p>权限代码格式：模块:操作</p>
          <p>例如：room:create（房间创建）、branch:update（分店更新）</p>
        </div>
      </el-form-item>

      <el-form-item label="权限状态" prop="permStatus">
        <el-radio-group v-model="formData.permStatus">
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
import { createPermissionAPI, updatePermissionAPI, getPermissionByIdAPI } from '@/apis/rbacAPI'
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
  permId: null,
  permName: '',
  permCode: '',
  permStatus: 'a'
})

// 表单验证规则
const formRules = {
  permName: [
    { required: true, message: '请输入权限名称', trigger: 'blur' },
    { min: 2, max: 60, message: '权限名称长度在2到60个字符', trigger: 'blur' }
  ],
  permCode: [
    { required: true, message: '请输入权限代码', trigger: 'blur' },
    { min: 3, max: 100, message: '权限代码长度在3到100个字符', trigger: 'blur' },
    { 
      pattern: /^[a-zA-Z][a-zA-Z0-9]*:[a-zA-Z][a-zA-Z0-9]*$/, 
      message: '权限代码格式不正确，应为：模块:操作', 
      trigger: 'blur' 
    }
  ],
  permStatus: [
    { required: true, message: '请选择权限状态', trigger: 'change' }
  ]
}

// 打开对话框
const open = async (permissionData = null) => {
  isEdit.value = !!permissionData
  dialogVisible.value = true

  if (permissionData) {
    // 编辑模式，填充数据
    await fillFormData(permissionData)
  } else {
    // 新增模式，重置表单
    resetForm()
  }
}

// 填充表单数据
const fillFormData = async (permissionData) => {
  try {
    // 获取权限详细信息
    const res = await getPermissionByIdAPI(permissionData.permId)
    if (res && res.code === 200 && res.data) {
      const permission = res.data
      formData.permId = permission.id || permission.permId
      formData.permName = permission.name || permission.permName
      formData.permCode = permission.code || permission.permCode
      formData.permStatus = permission.status || permission.permStatus
    } else {
      // 如果获取详情失败，使用传入的数据
      formData.permId = permissionData.permId
      formData.permName = permissionData.permName
      formData.permCode = permissionData.permCode
      formData.permStatus = permissionData.permStatus === '激活' ? 'a' : 'd'
    }
  } catch (error) {
    console.error('获取权限信息失败:', error)
    // 使用传入的数据作为备选
    formData.permId = permissionData.permId
    formData.permName = permissionData.permName
    formData.permCode = permissionData.permCode
    formData.permStatus = permissionData.permStatus === '激活' ? 'a' : 'd'
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    permId: null,
    permName: '',
    permCode: '',
    permStatus: 'a'
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
      // 更新权限
      await updatePermissionAPI({
        id: formData.permId,
        name: formData.permName,
        code: formData.permCode,
        status: formData.permStatus,
        updatedBy: userStore.userInfo.userId
      })

      ElMessage.success('更新权限成功')
    } else {
      // 创建权限
      await createPermissionAPI({
        name: formData.permName,
        code: formData.permCode,
        status: formData.permStatus,
        createdBy: userStore.userInfo.userId
      })

      ElMessage.success('创建权限成功')
    }

    dialogVisible.value = false
    resetForm()
    emit('refresh')
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error(isEdit.value ? '更新权限失败' : '创建权限失败')
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

.form-tip {
  margin-top: 8px;
  padding: 8px 12px;
  background: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 4px;
  font-size: 12px;
  color: #409eff;
}

.form-tip p {
  margin: 0 0 4px 0;
}

.form-tip p:last-child {
  margin-bottom: 0;
}
</style>
