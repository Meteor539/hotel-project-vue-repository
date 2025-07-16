import httpInstance from "@/utils/request";

//查询分页用户列表
export function getPagedUsersListAPI(pageNo = 1){
     return httpInstance({
        url:`user/list?pageNo=${pageNo}`
     })
}

//新增用户
export function addUserAPI(data){
   return httpInstance({
      url:'user/save',
      method:'POST',
      data
   })
}

//更新用户
export function updateUserAPI(data){
   return httpInstance({
      url:'user/update',
      method:'PUT',
      data
   })
}

//删除用户
export function deleteUserAPI(id){
   return httpInstance({
      url:`user/delete/${id}`,
      method:'DELETE'
   })
}

//查询所有用户列表（用于下拉选择）
export function getAllUsersAPI(){
   return httpInstance({
      url:'user/list?pageNo=1',
      method:'GET'
   })
}

//根据ID查询用户详情
export function getUserByIdAPI(id){
   return httpInstance({
      url:`user/${id}`,
      method:'GET'
   })
}

//根据用户名查询用户
export function getUserByNameAPI(userName){
   return httpInstance({
      url:`user/userName/${userName}`,
      method:'GET'
   })
}

//根据用户角色查询用户列表
export function getUsersByRoleAPI(userRole){
   return httpInstance({
      url:`user/userRole/${userRole}`,
      method:'GET'
   })
}
