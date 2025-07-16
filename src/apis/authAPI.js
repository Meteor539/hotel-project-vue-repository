import { userHttpInstance } from "@/utils/request";

// ==================== 用户列表相关接口 ====================

//查询分页用户列表 - 根据AuthAPI文档更新路径
export function getPagedUsersListAPI(pageNo = 1){
     return userHttpInstance({
        url:`auth/list?pageNo=${pageNo}`
     })
}

//根据ID查询用户详情
export function getUserByIdAPI(id){
   return userHttpInstance({
      url:`auth/${id}`,
      method:'GET'
   })
}

// ==================== 用户管理相关接口 ====================

//新增用户 - 根据AuthAPI文档更新路径
export function addUserAPI(data){
   return userHttpInstance({
      url:'auth/save',
      method:'POST',
      data
   })
}

//更新用户 - 根据AuthAPI文档更新路径
export function updateUserAPI(data){
   return userHttpInstance({
      url:'auth/update',
      method:'PUT',
      data
   })
}

//删除用户 - 根据AuthAPI文档更新路径
export function deleteUserAPI(id){
   return userHttpInstance({
      url:`auth/delete/${id}`,
      method:'DELETE'
   })
}

//用户登录接口 - 根据AuthAPI文档更新路径
export function loginAPI(data){
   return userHttpInstance({
      url:'auth/login',
      method:'POST',
      data
   })
}
