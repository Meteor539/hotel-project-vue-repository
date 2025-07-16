<script setup>
import { RouterView } from 'vue-router'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
</script>

<template>
  <el-config-provider :locale="zhCn">
    <RouterView />
  </el-config-provider>
</template>

<style>
/* 修复Element Plus消息框层级和定位问题 */
.el-message-box {
  z-index: 9999 !important;
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  margin: 0 !important;
}

.el-overlay {
  z-index: 9998 !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
}

/* 确保消息框在最顶层并居中 */
.el-message-box__wrapper {
  z-index: 10000 !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

/* 重置可能影响定位的样式 */
body .el-message-box {
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  margin: 0 !important;
}

/* 修复Element Plus消息提示层级问题，但保留默认样式 */
.el-message {
  z-index: 10001 !important;
  position: fixed !important;
  top: 20px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  min-width: 380px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  border-radius: 4px !important;
  /* 确保背景色不被覆盖 */
  background-color: var(--el-message-bg-color, #edf2fc) !important;
  border: 1px solid var(--el-message-border-color, #ebeef5) !important;
  padding: 15px 20px !important;
  color: var(--el-message-text-color, #606266) !important;
}

/* 成功消息样式 */
.el-message--success {
  background-color: #f0f9ff !important;
  border-color: #67c23a !important;
  color: #67c23a !important;
}

.el-message--success .el-message__icon {
  color: #67c23a !important;
}

.el-message--success .el-message__content {
  color: #67c23a !important;
}

/* 错误消息样式 */
.el-message--error {
  background-color: #fef0f0 !important;
  border-color: #f56c6c !important;
  color: #f56c6c !important;
}

.el-message--error .el-message__icon {
  color: #f56c6c !important;
}

.el-message--error .el-message__content {
  color: #f56c6c !important;
}

/* 警告消息样式 */
.el-message--warning {
  background-color: #fdf6ec !important;
  border-color: #e6a23c !important;
  color: #e6a23c !important;
}

.el-message--warning .el-message__icon {
  color: #e6a23c !important;
}

.el-message--warning .el-message__content {
  color: #e6a23c !important;
}

/* 确保消息提示在所有元素之上 */
body .el-message {
  z-index: 10001 !important;
  position: fixed !important;
}

/* 隐藏可能的调试信息或状态指示器 */
.debug-info,
.dev-tools,
.status-indicator {
  display: none !important;
}

/* 确保页面左下角没有意外的元素 */
body::before,
body::after,
#app::before,
#app::after {
  display: none !important;
}

/* 隐藏可能的控制台错误显示 */
.console-error,
.error-display,
.debug-display {
  display: none !important;
}
</style>
