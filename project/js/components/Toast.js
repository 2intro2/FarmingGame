import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';

/**
 * Toast提示组件
 */
export default class Toast {
  static messages = [];
  static duration = 2000; // 默认显示时间

  /**
   * 显示Toast提示
   * @param {string} message - 提示信息
   * @param {Object} options - 选项
   */
  static show(message, options = {}) {
    const toast = {
      id: Date.now(),
      message: message,
      type: options.type || 'info', // info, success, error, warning
      duration: options.duration || this.duration,
      startTime: Date.now(),
      x: SCREEN_WIDTH / 2,
      y: SCREEN_HEIGHT * 0.8,
      width: 0,
      height: 0
    };

    this.messages.push(toast);

    // 自动移除
    setTimeout(() => {
      this.remove(toast.id);
    }, toast.duration);
  }

  /**
   * 移除Toast
   * @param {number} id - Toast ID
   */
  static remove(id) {
    const index = this.messages.findIndex(toast => toast.id === id);
    if (index !== -1) {
      this.messages.splice(index, 1);
    }
  }

  /**
   * 渲染所有Toast
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  static render(ctx) {
    this.messages.forEach(toast => {
      this.renderToast(ctx, toast);
    });
  }

  /**
   * 渲染单个Toast
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {Object} toast - Toast对象
   */
  static renderToast(ctx, toast) {
    // 计算显示时间
    const elapsed = Date.now() - toast.startTime;
    const progress = Math.min(elapsed / toast.duration, 1);
    
    // 计算透明度
    let alpha = 1;
    if (progress > 0.8) {
      alpha = 1 - (progress - 0.8) / 0.2;
    }

    // 设置字体和测量文字
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const textMetrics = ctx.measureText(toast.message);
    const textWidth = textMetrics.width;
    const textHeight = 20;
    
    // 计算Toast尺寸
    const padding = 20;
    const width = textWidth + padding * 2;
    const height = textHeight + padding * 2;

    // 设置颜色
    let bgColor, textColor;
    switch (toast.type) {
      case 'success':
        bgColor = `rgba(76, 175, 80, ${alpha})`;
        textColor = `rgba(255, 255, 255, ${alpha})`;
        break;
      case 'error':
        bgColor = `rgba(244, 67, 54, ${alpha})`;
        textColor = `rgba(255, 255, 255, ${alpha})`;
        break;
      case 'warning':
        bgColor = `rgba(255, 152, 0, ${alpha})`;
        textColor = `rgba(255, 255, 255, ${alpha})`;
        break;
      default:
        bgColor = `rgba(0, 0, 0, ${alpha * 0.8})`;
        textColor = `rgba(255, 255, 255, ${alpha})`;
    }

    // 绘制背景
    ctx.fillStyle = bgColor;
    try {
      if (ctx.roundRect && typeof ctx.roundRect === 'function') {
        ctx.roundRect(toast.x - width / 2, toast.y - height / 2, width, height, 8);
        ctx.fill();
      } else {
        // 降级方案
        ctx.fillRect(toast.x - width / 2, toast.y - height / 2, width, height);
      }
    } catch (error) {
      // 如果圆角矩形失败，使用普通矩形
      ctx.fillRect(toast.x - width / 2, toast.y - height / 2, width, height);
    }

    // 绘制文字
    ctx.fillStyle = textColor;
    ctx.fillText(toast.message, toast.x, toast.y);
  }

  /**
   * 显示成功提示
   * @param {string} message - 提示信息
   * @param {Object} options - 选项
   */
  static success(message, options = {}) {
    this.show(message, { ...options, type: 'success' });
  }

  /**
   * 显示错误提示
   * @param {string} message - 提示信息
   * @param {Object} options - 选项
   */
  static error(message, options = {}) {
    this.show(message, { ...options, type: 'error' });
  }

  /**
   * 显示警告提示
   * @param {string} message - 提示信息
   * @param {Object} options - 选项
   */
  static warning(message, options = {}) {
    this.show(message, { ...options, type: 'warning' });
  }

  /**
   * 显示信息提示
   * @param {string} message - 提示信息
   * @param {Object} options - 选项
   */
  static info(message, options = {}) {
    this.show(message, { ...options, type: 'info' });
  }

  /**
   * 清除所有Toast
   */
  static clear() {
    this.messages = [];
  }
}
