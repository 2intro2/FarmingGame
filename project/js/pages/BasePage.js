/**
 * 页面基类
 * 为所有页面提供动画支持的基础方法
 */
export default class BasePage {
  constructor() {
    // 动画相关属性
    this.opacity = 1;
    this.x = 0;
    this.y = 0;
    this.scale = 1;
    this.visible = true;
  }

  /**
   * 设置透明度
   * @param {number} opacity - 透明度 (0-1)
   */
  setOpacity(opacity) {
    this.opacity = Math.max(0, Math.min(1, opacity));
  }

  /**
   * 设置位置
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * 设置缩放
   * @param {number} scale - 缩放比例
   */
  setScale(scale) {
    this.scale = Math.max(0.1, Math.min(2, scale));
  }

  /**
   * 重置变换
   */
  resetTransform() {
    this.opacity = 1;
    this.x = 0;
    this.y = 0;
    this.scale = 1;
  }

  /**
   * 应用变换到Canvas上下文
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  applyTransform(ctx) {
    if (this.opacity !== 1) {
      ctx.globalAlpha = this.opacity;
    }
    
    if (this.x !== 0 || this.y !== 0) {
      ctx.save();
      ctx.translate(this.x, this.y);
    }
    
    if (this.scale !== 1) {
      ctx.save();
      ctx.scale(this.scale, this.scale);
    }
  }

  /**
   * 恢复Canvas上下文
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  restoreTransform(ctx) {
    if (this.scale !== 1) {
      ctx.restore();
    }
    
    if (this.x !== 0 || this.y !== 0) {
      ctx.restore();
    }
    
    if (this.opacity !== 1) {
      ctx.globalAlpha = 1;
    }
  }

  /**
   * 渲染页面（带动画支持）
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  render(ctx) {
    if (!this.visible) return;

    // 应用变换
    this.applyTransform(ctx);
    
    // 调用子类的具体渲染方法
    this.renderContent(ctx);
    
    // 恢复变换
    this.restoreTransform(ctx);
  }

  /**
   * 渲染页面内容（子类重写）
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  renderContent(ctx) {
    // 子类重写此方法实现具体渲染逻辑
  }

  /**
   * 处理触摸事件
   * @param {Object} event - 触摸事件对象
   */
  handleTouch(event) {
    // 子类重写此方法实现具体触摸处理逻辑
  }

  /**
   * 更新页面
   */
  update() {
    // 子类重写此方法实现具体更新逻辑
  }
} 