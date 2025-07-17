import { userHttpInstance } from "@/utils/request";

// ==================== RBAC认证接口 ====================

// RBAC系统登录
export function rbacLoginAPI(data) {
  console.log('调用登录API，请求数据:', data)
  return userHttpInstance({
    url: 'auth/rbac/login',
    method: 'POST',
    data
  });
}

// ==================== 简化用户管理接口 ====================

// 获取用户列表 - 简化版本
export function getUserListAPI() {
  return userHttpInstance({
    url: 'sys-user/page?pageNo=1&pageSize=1000',
    method: 'GET'
  });
}

// 删除用户 - 简化版本
export function deleteUserAPI(userId) {
  return userHttpInstance({
    url: `sys-user/delete/${userId}`,
    method: 'DELETE'
  });
}

// 更新用户状态 - 简化版本
export function updateUserStatusAPI(userId, status) {
  return userHttpInstance({
    url: 'sys-user/update-status',
    method: 'POST',
    data: { userId, status }
  });
}

// ==================== 系统用户管理接口 ====================

// 创建系统用户
export function createSysUserAPI(data) {
  return userHttpInstance({
    url: 'sys-user/create',
    method: 'POST',
    data
  });
}

// 更新用户信息
export function updateSysUserAPI(data) {
  return userHttpInstance({
    url: 'sys-user/update',
    method: 'PUT',
    data
  });
}

// 删除用户
export function deleteSysUserAPI(userId) {
  return userHttpInstance({
    url: `sys-user/delete/${userId}`,
    method: 'DELETE'
  });
}

// 获取用户信息
export function getSysUserByIdAPI(userId) {
  return userHttpInstance({
    url: `sys-user/${userId}`,
    method: 'GET'
  });
}

// 分页查询用户列表
export function getSysUserPageAPI(pageNo = 1, pageSize = 10) {
  return userHttpInstance({
    url: `sys-user/page?pageNo=${pageNo}&pageSize=${pageSize}`,
    method: 'GET'
  });
}

// 重置用户密码
export function resetSysUserPasswordAPI(data) {
  return userHttpInstance({
    url: 'sys-user/reset-password',
    method: 'POST',
    data
  });
}

// 启用/禁用用户
export function updateSysUserStatusAPI(data) {
  return userHttpInstance({
    url: 'sys-user/update-status',
    method: 'POST',
    data
  });
}

// ==================== 角色管理接口 ====================

// 创建角色
export function createRoleAPI(data) {
  return userHttpInstance({
    url: 'sys-role/create',
    method: 'POST',
    data
  });
}

// 更新角色
export function updateRoleAPI(data) {
  return userHttpInstance({
    url: 'sys-role/update',
    method: 'PUT',
    data
  });
}

// 删除角色
export function deleteRoleAPI(roleId) {
  return userHttpInstance({
    url: `sys-role/delete/${roleId}`,
    method: 'DELETE'
  });
}

// 获取角色信息
export function getRoleByIdAPI(roleId) {
  return userHttpInstance({
    url: `sys-role/${roleId}`,
    method: 'GET'
  });
}

// 分页查询角色列表
export function getRolePageAPI(pageNo = 1, pageSize = 10) {
  return userHttpInstance({
    url: `sys-role/page?pageNo=${pageNo}&pageSize=${pageSize}`,
    method: 'GET'
  });
}

// 查询激活状态的角色
export function getActiveRolesAPI() {
  return userHttpInstance({
    url: 'sys-role/active',
    method: 'GET'
  });
}

// ==================== 权限管理接口 ====================

// 创建权限
export function createPermissionAPI(data) {
  return userHttpInstance({
    url: 'sys-permission/create',
    method: 'POST',
    data
  });
}

// 更新权限
export function updatePermissionAPI(data) {
  return userHttpInstance({
    url: 'sys-permission/update',
    method: 'PUT',
    data
  });
}

// 删除权限
export function deletePermissionAPI(permId) {
  return userHttpInstance({
    url: `sys-permission/delete/${permId}`,
    method: 'DELETE'
  });
}

// 获取权限信息
export function getPermissionByIdAPI(permId) {
  return userHttpInstance({
    url: `sys-permission/${permId}`,
    method: 'GET'
  });
}

// 分页查询权限列表
export function getPermissionPageAPI(pageNo = 1, pageSize = 10) {
  return userHttpInstance({
    url: `sys-permission/page?pageNo=${pageNo}&pageSize=${pageSize}`,
    method: 'GET'
  });
}

// 查询激活状态的权限
export function getActivePermissionsAPI() {
  return userHttpInstance({
    url: 'sys-permission/active',
    method: 'GET'
  });
}

// 根据角色ID查询权限列表
export function getPermissionsByRoleIdAPI(roleId) {
  return userHttpInstance({
    url: `sys-permission/role/${roleId}`,
    method: 'GET'
  });
}

// 根据用户ID查询用户的所有权限
export function getPermissionsByUserIdAPI(userId) {
  return userHttpInstance({
    url: `sys-permission/user/${userId}`,
    method: 'GET'
  });
}

// ==================== 用户角色分配接口 ====================

// 为用户分配角色
export function assignUserRoleAPI(data) {
  return userHttpInstance({
    url: 'user-role/assign',
    method: 'POST',
    data
  });
}

// 为用户分配多个角色
export function assignUserRolesBatchAPI(data) {
  return userHttpInstance({
    url: 'user-role/assign-batch',
    method: 'POST',
    data
  });
}

// 取消用户的角色
export function removeUserRoleAPI(data) {
  return userHttpInstance({
    url: 'user-role/remove',
    method: 'POST',
    data
  });
}

// 更新用户的角色列表
export function updateUserRolesAPI(data) {
  return userHttpInstance({
    url: 'user-role/update',
    method: 'POST',
    data
  });
}

// 根据用户ID查询用户角色关联
export function getUserRolesByUserIdAPI(userId) {
  return userHttpInstance({
    url: `user-role/user/${userId}`,
    method: 'GET'
  });
}

// 根据角色ID查询用户角色关联
export function getUserRolesByRoleIdAPI(roleId) {
  return userHttpInstance({
    url: `user-role/role/${roleId}`,
    method: 'GET'
  });
}

// 获取用户的角色ID列表
export function getUserRoleIdsAPI(userId) {
  return userHttpInstance({
    url: `user-role/user/${userId}/role-ids`,
    method: 'GET'
  });
}

// 获取拥有指定角色的用户ID列表
export function getUserIdsByRoleIdAPI(roleId) {
  return userHttpInstance({
    url: `user-role/role/${roleId}/user-ids`,
    method: 'GET'
  });
}

// ==================== 角色权限分配接口 ====================

// 为角色分配权限
export function assignRolePermissionAPI(data) {
  return userHttpInstance({
    url: 'role-permission/assign',
    method: 'POST',
    data
  });
}

// 为角色分配多个权限
export function assignRolePermissionsBatchAPI(data) {
  return userHttpInstance({
    url: 'role-permission/assign-batch',
    method: 'POST',
    data
  });
}

// 取消角色的权限
export function removeRolePermissionAPI(data) {
  return userHttpInstance({
    url: 'role-permission/remove',
    method: 'POST',
    data
  });
}

// 更新角色的权限列表
export function updateRolePermissionsAPI(data) {
  return userHttpInstance({
    url: 'role-permission/update',
    method: 'POST',
    data
  });
}

// 根据角色ID查询角色权限关联
export function getRolePermissionsByRoleIdAPI(roleId) {
  return userHttpInstance({
    url: `role-permission/role/${roleId}`,
    method: 'GET'
  });
}

// 根据权限ID查询角色权限关联
export function getRolePermissionsByPermIdAPI(permId) {
  return userHttpInstance({
    url: `role-permission/permission/${permId}`,
    method: 'GET'
  });
}

// 获取角色的权限ID列表
export function getRolePermissionIdsAPI(roleId) {
  return userHttpInstance({
    url: `role-permission/role/${roleId}/permission-ids`,
    method: 'GET'
  });
}

// 获取拥有指定权限的角色ID列表
export function getRoleIdsByPermissionIdAPI(permId) {
  return userHttpInstance({
    url: `role-permission/permission/${permId}/role-ids`,
    method: 'GET'
  });
}
