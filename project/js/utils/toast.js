/**
 * Toast工具函数
 * 统一处理Toast提示的显示
 */

/**
 * 显示Toast提示
 * @param {string} message - 提示信息
 * @param {Object} options - 选项
 */
export function showToast(message, options = {}) {
  try {
    // 优先使用自定义Toast组件
    const Toast = require('../components/Toast').default;
    Toast.show(message, options);
  } catch (error) {
    console.error('Toast组件加载失败:', error);
    
    // 降级到微信原生Toast
    if (GameGlobal.wechatAPI) {
      GameGlobal.wechatAPI.showToast(message, options);
    } else {
      // 最后的降级方案：使用console输出
      console.log('Toast:', message);
    }
  }
}

/**
 * 显示成功Toast
 * @param {string} message - 提示信息
 */
export function showSuccessToast(message) {
  showToast(message, { type: 'success' });
}

/**
 * 显示错误Toast
 * @param {string} message - 提示信息
 */
export function showErrorToast(message) {
  showToast(message, { type: 'error' });
}

/**
 * 显示警告Toast
 * @param {string} message - 提示信息
 */
export function showWarningToast(message) {
  showToast(message, { type: 'warning' });
}

/**
 * 显示信息Toast
 * @param {string} message - 提示信息
 */
export function showInfoToast(message) {
  showToast(message, { type: 'info' });
}
