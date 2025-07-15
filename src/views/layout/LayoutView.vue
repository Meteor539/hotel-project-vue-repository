<template>
    <div class="menu">
        <Menu :isCollapse="isCollapse"></Menu>
    </div>
    <div class="content" :class="{is_folded_menu:isCollapse}">
        <Content :isCollapse="isCollapse" @changeCollapse="changeCollapseStatus"></Content>
    </div>
</template>

<script setup>

   import Menu from '@/views/layout/menu/Menu.vue'
   import Content from '@/views/layout/content/Content.vue'
   import { ref } from 'vue';

   const isCollapse = ref(false);
   const changeCollapseStatus = () => {
      isCollapse.value = !isCollapse.value;
      console.log("layout collapse:"+isCollapse.value);
   }

</script>

<style lang="scss" scoped>

   .menu{
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      background-color: #112f50;
   }

   .content{
      padding-left: 200px;
   }

   .is_folded_menu{
       padding-left: 64px;
   }

</style>

<style lang="scss">
/* 全局样式，确保消息框正确显示 */
.el-message-box {
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  z-index: 10000 !important;
  margin: 0 !important;
}

.el-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 9999 !important;
}
</style>
