<template>
    <!-- 顶部区域 -->
    <div class="header">
        <el-row>
            <el-col :span="4">
                <el-icon v-if="!props.isCollapse" @click="foldMenu"><Fold /></el-icon>
                <el-icon v-else @click="foldMenu"><Expand /></el-icon>
            </el-col>
            <el-col :span="20">
                <div class="right">右侧</div>
            </el-col>
        </el-row>
    </div>
    <!-- 路由出口 -->
    <RouterView/>
</template>

<script setup>
   
   import {
    Expand,Fold
   } from '@element-plus/icons-vue'

   const props = defineProps(['isCollapse']);
   const emit = defineEmits(['changeCollapse']);

   const foldMenu = () => {
       console.log("fold menu!");
       emit('changeCollapse');
   }


</script>

<style lang="scss" scoped>
  
  .wrapper{
     padding: 10px;
  }
  
  .header{
     
     background-color: #1e78bf;
     height: 50px;
     line-height: 50px;
     color:#fff;

     .right{
        text-align: right;
        padding-right: 20px;
     }

     .el-icon{
        font-size: 22px;
        cursor: pointer;
     }

  }

</style>
