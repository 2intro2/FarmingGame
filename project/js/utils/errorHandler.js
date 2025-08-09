/**
 * 错误处理工具
 * 提供统一的错误处理机制
 */
import Toast from '../components/Toast';

class ErrorHandler {
  constructor() {
    this.errorCount = 0;
    this.maxErrors = 10; // 最大错误数量，防止无限错误
    this.errorLog = [];
  }

  /**
   * 处理错误
   */
  handleError(error, context = '') {
    this.errorCount++;
    
    // 记录错误信息
    const errorInfo = {
      timestamp: Date.now(),
      message: error.message || '未知错误',
      stack: error.stack,
      context: context,
      count: this.errorCount
    };
    
    this.errorLog.push(errorInfo);
    
    // 控制台输出错误
    console.error('错误详情:', errorInfo);
    
    // 如果错误过多，停止处理
    if (this.errorCount > this.maxErrors) {
      console.error('错误数量过多，停止错误处理');
      return;
    }
    
    // 显示用户友好的错误提示
    this.showUserFriendlyError(error, context);
    
    // 上报错误（可选）
    this.reportError(errorInfo);
  }

  /**
   * 显示用户友好的错误提示
   */
  showUserFriendlyError(error, context) {
    let message = '操作失败，请重试';
    
    // 根据错误类型显示不同提示
    if (error.name === 'NetworkError') {
      message = '网络连接失败，请检查网络';
    } else if (error.name === 'TimeoutError') {
      message = '请求超时，请重试';
    } else if (error.name === 'ValidationError') {
      message = '数据格式错误';
    } else if (context.includes('login')) {
      message = '登录失败，请重试';
    } else if (context.includes('game')) {
      message = '游戏加载失败，请重试';
    }
    
    // 显示Toast提示
    if (GameGlobal.toast) {
      GameGlobal.toast.show(message, 'error');
    }
  }

  /**
   * 上报错误信息
   */
  reportError(errorInfo) {
    try {
      // 这里可以集成错误上报服务
      // 例如：微信小程序错误上报、第三方错误监控等
      console.log('错误上报:', errorInfo);
    } catch (e) {
      console.error('错误上报失败:', e);
    }
  }

  /**
   * 包装异步函数，自动捕获错误
   */
  async wrapAsync(fn, context = '') {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handleError(error, context);
        throw error; // 重新抛出错误，让调用方知道发生了错误
      }
    };
  }

  /**
   * 包装同步函数，自动捕获错误
   */
  wrapSync(fn, context = '') {
    return (...args) => {
      try {
        return fn(...args);
      } catch (error) {
        this.handleError(error, context);
        throw error;
      }
    };
  }

  /**
   * 验证数据
   */
  validate(data, schema, context = '') {
    try {
      // 简单的数据验证
      if (schema.required && !data) {
        throw new Error('必填字段不能为空');
      }
      
      if (schema.type && typeof data !== schema.type) {
        throw new Error(`数据类型错误，期望 ${schema.type}，实际 ${typeof data}`);
      }
      
      if (schema.min && data < schema.min) {
        throw new Error(`数值太小，最小值为 ${schema.min}`);
      }
      
      if (schema.max && data > schema.max) {
        throw new Error(`数值太大，最大值为 ${schema.max}`);
      }
      
      return true;
    } catch (error) {
      this.handleError(error, context);
      return false;
    }
  }

  /**
   * 获取错误日志
   */
  getErrorLog() {
    return this.errorLog;
  }

  /**
   * 清除错误日志
   */
  clearErrorLog() {
    this.errorLog = [];
    this.errorCount = 0;
  }

  /**
   * 检查是否有错误
   */
  hasErrors() {
    return this.errorLog.length > 0;
  }

  /**
   * 获取错误统计
   */
  getErrorStats() {
    const stats = {
      total: this.errorLog.length,
      recent: this.errorLog.filter(log => 
        Date.now() - log.timestamp < 60000 // 最近1分钟
      ).length,
      byContext: {}
    };
    
    this.errorLog.forEach(log => {
      if (!stats.byContext[log.context]) {
        stats.byContext[log.context] = 0;
      }
      stats.byContext[log.context]++;
    });
    
    return stats;
  }
}

// 创建全局错误处理器实例
const errorHandler = new ErrorHandler();

// 全局错误处理
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorHandler.handleError(event.error, 'global');
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    errorHandler.handleError(new Error(event.reason), 'unhandled-promise');
  });
}

export default errorHandler; 