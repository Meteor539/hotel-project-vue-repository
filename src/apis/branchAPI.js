import httpInstance from "@/utils/request";

//查询分页分店列表
export function getPagedBranchesListAPI(pageNo = 1, pageSize = 10){
     return httpInstance({
        url:`branch/list?pageNo=${pageNo}&pageSize=${pageSize}`
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

//查询所有分店列表（用于下拉选择）
export function getAllBranchesAPI(){
   return httpInstance({
      url:'branch/list?pageNo=1&pageSize=100',
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
