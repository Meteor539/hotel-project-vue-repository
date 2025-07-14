import httpInstance from "@/utils/http";

//查询所有的分店列表
export function getAllBranchAPI(){
     return httpInstance({
        url:'branch/all'
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
