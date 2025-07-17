import httpInstance from "@/utils/request";

//查询分页分店列表 - 根据API文档，只需要pageNo参数
export function getPagedBranchesListAPI(pageNo = 1){
     return httpInstance({
        url:`branch/list?pageNo=${pageNo}`
     })
}

//新增分店
export function addBranchAPI(data){
   return httpInstance({
      url:'branch/save',
      method:'POST',
      data
   })
}

//更新分店
export function updateBranchAPI(data){
   return httpInstance({
      url:'branch/update',
      method:'PUT',
      data
   })
}

//删除分店
export function deleteBranchAPI(id){
   return httpInstance({
      url:`branch/delete/${id}`,
      method:'DELETE'
   })
}

//查询所有分店列表（用于下拉选择） - 使用RBAC版本API
export function getAllBranchesAPI(){
   return httpInstance({
      url:'branch/rbac/accessible',
      method:'GET'
   })
}

//获取当前用户所属分店信息 - 新增RBAC接口
export function getMyBranchAPI(){
   return httpInstance({
      url:'branch/rbac/my-branch',
      method:'GET'
   })
}

//根据ID查询分店详情
export function getBranchByIdAPI(id){
   return httpInstance({
      url:`branch/${id}`,
      method:'GET'
   })
}

//根据分店名获取分店编号 - 新增API接口
export function getBranchIdByNameAPI(branchName){
   return httpInstance({
      url:`branch/branchId/branchName/${branchName}`,
      method:'GET'
   })
}
