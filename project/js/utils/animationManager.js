/**
 * 动画管理器
 * 负责页面切换的平滑过渡效果
 */
class AnimationManager {
  constructor() {
    this.animations = [];
    this.isAnimating = false;
    this.currentAnimation = null;
    
    // 动画预设
    this.presets = {
      fade: {
        type: 'fade',
        duration: 300,
        easing: 'ease-in-out'
      },
      slideLeft: {
        type: 'slide',
        direction: 'left',
        duration: 400,
        easing: 'ease-out'
      },
      slideRight: {
        type: 'slide',
        direction: 'right',
        duration: 400,
        easing: 'ease-out'
      },
      slideUp: {
        type: 'slide',
        direction: 'up',
        duration: 400,
        easing: 'ease-out'
      },
      slideDown: {
        type: 'slide',
        direction: 'down',
        duration: 400,
        easing: 'ease-out'
      },
      scale: {
        type: 'scale',
        duration: 300,
        easing: 'ease-in-out'
      }
    };
  }

  /**
   * 创建动画
   * @param {Object} config - 动画配置
   * @returns {Object} 动画对象
   */
  createAnimation(config) {
    const animation = {
      id: Date.now() + Math.random(),
      type: config.type || 'fade',
      duration: config.duration || 300,
      easing: config.easing || 'ease-in-out',
      startTime: null,
      progress: 0,
      fromPage: config.fromPage,
      toPage: config.toPage,
      direction: config.direction || 'left',
      onUpdate: config.onUpdate || (() => {}),
      onComplete: config.onComplete || (() => {}),
      onCancel: config.onCancel || (() => {})
    };

    return animation;
  }

  /**
   * 开始动画
   * @param {Object} animation - 动画对象
   */
  startAnimation(animation) {
    if (this.isAnimating) {
      this.cancelCurrentAnimation();
    }

    this.currentAnimation = animation;
    this.isAnimating = true;
    animation.startTime = Date.now();

    // 记录动画开始日志
    if (GameGlobal.logger) {
      GameGlobal.logger.info(`开始页面切换动画: ${animation.type}`, {
        from: animation.fromPage,
        to: animation.toPage,
        duration: animation.duration
      }, 'animation');
    }
  }

  /**
   * 更新动画
   * @param {number} deltaTime - 时间增量
   */
  update(deltaTime) {
    if (!this.isAnimating || !this.currentAnimation) return;

    const animation = this.currentAnimation;
    const elapsed = Date.now() - animation.startTime;
    const progress = Math.min(elapsed / animation.duration, 1);

    // 应用缓动函数
    const easedProgress = this.applyEasing(progress, animation.easing);
    animation.progress = easedProgress;

    // 执行动画更新
    this.executeAnimation(animation, easedProgress);

    // 检查动画是否完成
    if (progress >= 1) {
      this.completeAnimation(animation);
    }
  }

  /**
   * 应用缓动函数
   * @param {number} progress - 进度 (0-1)
   * @param {string} easing - 缓动类型
   * @returns {number} 缓动后的进度
   */
  applyEasing(progress, easing) {
    switch (easing) {
      case 'linear':
        return progress;
      case 'ease-in':
        return progress * progress;
      case 'ease-out':
        return 1 - (1 - progress) * (1 - progress);
      case 'ease-in-out':
        return progress < 0.5 
          ? 2 * progress * progress 
          : 1 - 2 * (1 - progress) * (1 - progress);
      default:
        return progress;
    }
  }

  /**
   * 执行动画
   * @param {Object} animation - 动画对象
   * @param {number} progress - 动画进度
   */
  executeAnimation(animation, progress) {
    switch (animation.type) {
      case 'fade':
        this.executeFadeAnimation(animation, progress);
        break;
      case 'slide':
        this.executeSlideAnimation(animation, progress);
        break;
      case 'scale':
        this.executeScaleAnimation(animation, progress);
        break;
    }

    // 调用更新回调
    if (animation.onUpdate) {
      animation.onUpdate(progress);
    }
  }

  /**
   * 执行淡入淡出动画
   * @param {Object} animation - 动画对象
   * @param {number} progress - 动画进度
   */
  executeFadeAnimation(animation, progress) {
    const fromOpacity = 1 - progress;
    const toOpacity = progress;

    // 设置页面透明度
    if (animation.fromPage && animation.fromPage.setOpacity) {
      animation.fromPage.setOpacity(fromOpacity);
    }
    if (animation.toPage && animation.toPage.setOpacity) {
      animation.toPage.setOpacity(toOpacity);
    }
  }

  /**
   * 执行滑动动画
   * @param {Object} animation - 动画对象
   * @param {number} progress - 动画进度
   */
  executeSlideAnimation(animation, progress) {
    const canvas = GameGlobal.canvas;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;
    let fromX = 0, fromY = 0, toX = 0, toY = 0;

    // 根据方向计算位移
    switch (animation.direction) {
      case 'left':
        fromX = -width * (1 - progress);
        toX = width * progress;
        break;
      case 'right':
        fromX = width * (1 - progress);
        toX = -width * progress;
        break;
      case 'up':
        fromY = height * (1 - progress);
        toY = -height * progress;
        break;
      case 'down':
        fromY = -height * (1 - progress);
        toY = height * progress;
        break;
    }

    // 设置页面位置
    if (animation.fromPage && animation.fromPage.setPosition) {
      animation.fromPage.setPosition(fromX, fromY);
    }
    if (animation.toPage && animation.toPage.setPosition) {
      animation.toPage.setPosition(toX, toY);
    }
  }

  /**
   * 执行缩放动画
   * @param {Object} animation - 动画对象
   * @param {number} progress - 动画进度
   */
  executeScaleAnimation(animation, progress) {
    const fromScale = 1 - progress * 0.2;
    const toScale = 0.8 + progress * 0.2;

    // 设置页面缩放
    if (animation.fromPage && animation.fromPage.setScale) {
      animation.fromPage.setScale(fromScale);
    }
    if (animation.toPage && animation.toPage.setScale) {
      animation.toPage.setScale(toScale);
    }
  }

  /**
   * 完成动画
   * @param {Object} animation - 动画对象
   */
  completeAnimation(animation) {
    this.isAnimating = false;
    this.currentAnimation = null;

    // 重置页面状态
    if (animation.fromPage && animation.fromPage.resetTransform) {
      animation.fromPage.resetTransform();
    }
    if (animation.toPage && animation.toPage.resetTransform) {
      animation.toPage.resetTransform();
    }

    // 调用完成回调
    if (animation.onComplete) {
      animation.onComplete();
    }

    // 记录动画完成日志
    if (GameGlobal.logger) {
      GameGlobal.logger.info(`页面切换动画完成: ${animation.type}`, {
        from: animation.fromPage,
        to: animation.toPage,
        duration: animation.duration
      }, 'animation');
    }
  }

  /**
   * 取消当前动画
   */
  cancelCurrentAnimation() {
    if (this.currentAnimation) {
      const animation = this.currentAnimation;
      
      // 调用取消回调
      if (animation.onCancel) {
        animation.onCancel();
      }

      // 重置页面状态
      if (animation.fromPage && animation.fromPage.resetTransform) {
        animation.fromPage.resetTransform();
      }
      if (animation.toPage && animation.toPage.resetTransform) {
        animation.toPage.resetTransform();
      }

      this.isAnimating = false;
      this.currentAnimation = null;

      // 记录动画取消日志
      if (GameGlobal.logger) {
        GameGlobal.logger.warn(`页面切换动画被取消: ${animation.type}`, {
          from: animation.fromPage,
          to: animation.toPage
        }, 'animation');
      }
    }
  }

  /**
   * 使用预设创建动画
   * @param {string} presetName - 预设名称
   * @param {Object} config - 额外配置
   * @returns {Object} 动画对象
   */
  createPresetAnimation(presetName, config = {}) {
    const preset = this.presets[presetName];
    if (!preset) {
      console.warn(`动画预设不存在: ${presetName}`);
      return null;
    }

    return this.createAnimation({
      ...preset,
      ...config
    });
  }

  /**
   * 获取动画状态
   * @returns {Object} 动画状态信息
   */
  getAnimationStatus() {
    return {
      isAnimating: this.isAnimating,
      currentAnimation: this.currentAnimation ? {
        type: this.currentAnimation.type,
        progress: this.currentAnimation.progress,
        duration: this.currentAnimation.duration
      } : null,
      availablePresets: Object.keys(this.presets)
    };
  }
}

// 创建全局动画管理器实例
const animationManager = new AnimationManager();

export default animationManager; 