import httpInstance from "@/utils/request";

// ==================== 用户列表相关接口 ====================

//查询分页用户列表 - 直接调用用户服务（端口3000）
export function getPagedUsersListAPI(pageNo = 1){
     return httpInstance({
        url:`http://localhost:3000/api/user/list?pageNo=${pageNo}`
     })
}

//查询所有用户列表（用于下拉选择）
export function getAllUsersAPI(){
   return httpInstance({
      url:'http://localhost:3000/api/user/list?pageNo=1',
      method:'GET'
   })
}

//根据ID查询用户详情
export function getUserByIdAPI(id){
   return httpInstance({
      url:`http://localhost:3000/api/user/${id}`,
      method:'GET'
   })
}

//根据用户名查询用户
export function getUserByNameAPI(userName){
   return httpInstance({
      url:`http://localhost:3000/api/user/userName/${userName}`,
      method:'GET'
   })
}

//根据用户角色查询用户列表
export function getUsersByRoleAPI(userRole){
   return httpInstance({
      url:`http://localhost:3000/api/user/userRole/${userRole}`,
      method:'GET'
   })
}

// ==================== 用户管理相关接口 ====================

//新增用户
export function addUserAPI(data){
   return httpInstance({
      url:'http://localhost:3000/api/user/save',
      method:'POST',
      data
   })
}

//更新用户
export function updateUserAPI(data){
   return httpInstance({
      url:'http://localhost:3000/api/user/update',
      method:'PUT',
      data
   })
}

//删除用户
export function deleteUserAPI(id){
   return httpInstance({
      url:`http://localhost:3000/api/user/delete/${id}`,
      method:'DELETE'
   })
}

//用户登录接口（暂不实现登录功能）
export function loginAPI(data){
   return httpInstance({
      url:'http://localhost:3000/api/user/login',
      method:'POST',
      data
   })
}
