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
