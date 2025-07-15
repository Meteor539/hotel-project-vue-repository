/**
 * 通用验证工具函数
 */

/**
 * 电话号码验证器
 * 支持多种电话号码格式：
 * - 手机号码：13x-19x开头的11位数字
 * - 固定电话：区号+号码，如 010-12345678 或 01012345678
 * - 400电话：400-xxx-xxxx 或 400xxxxxxx
 * - 800电话：800-xxx-xxxx 或 800xxxxxxx
 * - 其他格式：3-4位区号+7-8位号码
 * - 纯数字电话号码：7-12位数字
 */
export const phoneValidator = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入电话号码'))
    return
  }
  
  // 支持多种电话号码格式
  const phonePatterns = [
    /^1[3-9]\d{9}$/,                    // 手机号码：13x-19x开头的11位数字
    /^0\d{2,3}-?\d{7,8}$/,              // 固定电话：区号+号码，如 010-12345678 或 01012345678
    /^400-?\d{3}-?\d{4}$/,              // 400电话：400-xxx-xxxx 或 400xxxxxxx
    /^800-?\d{3}-?\d{4}$/,              // 800电话：800-xxx-xxxx 或 800xxxxxxx
    /^\d{3,4}-?\d{7,8}$/,               // 其他格式：3-4位区号+7-8位号码
    /^\d{7,12}$/                        // 纯数字电话号码：7-12位数字
  ]
  
  const isValid = phonePatterns.some(pattern => pattern.test(value))
  
  if (!isValid) {
    callback(new Error('请输入正确的电话号码格式'))
  } else {
    callback()
  }
}

/**
 * 手机号码验证器（严格模式，只验证手机号）
 */
export const mobileValidator = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入手机号码'))
    return
  }
  
  const mobilePattern = /^1[3-9]\d{9}$/
  
  if (!mobilePattern.test(value)) {
    callback(new Error('请输入正确的手机号码'))
  } else {
    callback()
  }
}

/**
 * 邮箱验证器
 */
export const emailValidator = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入邮箱地址'))
    return
  }
  
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  
  if (!emailPattern.test(value)) {
    callback(new Error('请输入正确的邮箱格式'))
  } else {
    callback()
  }
}

/**
 * 身份证号验证器
 */
export const idCardValidator = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入身份证号'))
    return
  }
  
  const idCardPattern = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
  
  if (!idCardPattern.test(value)) {
    callback(new Error('请输入正确的身份证号格式'))
  } else {
    callback()
  }
}

/**
 * 创建电话验证规则
 * @param {boolean} required - 是否必填
 * @param {string} message - 自定义错误消息
 * @returns {Array} 验证规则数组
 */
export const createPhoneRules = (required = true, message = '请输入电话号码') => {
  const rules = []
  
  if (required) {
    rules.push({ required: true, message, trigger: 'blur' })
  }
  
  rules.push({ validator: phoneValidator, trigger: 'blur' })
  
  return rules
}

/**
 * 创建手机号验证规则
 * @param {boolean} required - 是否必填
 * @param {string} message - 自定义错误消息
 * @returns {Array} 验证规则数组
 */
export const createMobileRules = (required = true, message = '请输入手机号码') => {
  const rules = []
  
  if (required) {
    rules.push({ required: true, message, trigger: 'blur' })
  }
  
  rules.push({ validator: mobileValidator, trigger: 'blur' })
  
  return rules
}
