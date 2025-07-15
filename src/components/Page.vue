<script setup>
   
   import { ref } from 'vue'

   //分页组件的当前页号
   const currentPage = ref(1);
   const pageSize = ref(10);
   const small = ref(false);
   const background = ref(false);
   const disabled = ref(false);

   //当前访问的页面发生的改变的时候触发
   const handleCurrentChange = (val) => {
    console.log(`current page: ${val}`)
    emit('setCurrentPageNo',val);
   }

   const setCurrentPageNo = (pageNo)=>{
    currentPage.value = pageNo; // 同步当前页码
    console.log("Page.vue",pageNo,currentPage.value);
    emit('setCurrentPageNo',pageNo);
  }

   const props = defineProps({
      psize:{
         type:Number,
         default:10
      },
      total:{
         type:Number,
         default:100
      }
   });

   const emit = defineEmits(['setCurrentPageNo']);

</script>

<template>
     <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="props.psize"
        :small="small"
        :disabled="disabled"
        :background="background"
        layout="total, prev, pager, next, jumper"
        :total="props.total"
        @current-change="setCurrentPageNo"
    />
</template>

<style scoped>
/* 分页组件样式 */
</style>
