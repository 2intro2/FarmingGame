/**
 * 动画调试工具
 * 用于查看和测试动画效果
 */
class AnimationDebug {
  constructor() {
    this.enabled = false;
  }

  /**
   * 启用调试模式
   */
  enable() {
    this.enabled = true;
    console.log('动画调试模式已启用');
  }

  /**
   * 禁用调试模式
   */
  disable() {
    this.enabled = false;
    console.log('动画调试模式已禁用');
  }

  /**
   * 打印动画状态
   */
  printAnimationStatus() {
    if (!this.enabled) return;

    console.log('=== 动画状态调试 ===');
    
    if (GameGlobal.animationManager) {
      const status = GameGlobal.animationManager.getAnimationStatus();
      console.log('动画管理器状态:', status);
    }
    
    if (GameGlobal.pageManager) {
      const historyInfo = GameGlobal.pageManager.getHistoryInfo();
      console.log('页面管理器状态:', historyInfo);
    }
    
    console.log('==================');
  }

  /**
   * 测试动画效果
   */
  testAnimations() {
    if (!this.enabled || !GameGlobal.pageManager) return;

    console.log('=== 动画效果测试 ===');
    
    const animationTypes = ['fade', 'slideLeft', 'slideRight', 'slideUp', 'slideDown', 'scale'];
    let currentIndex = 0;

    const testNextAnimation = () => {
      if (currentIndex >= animationTypes.length) {
        console.log('动画测试完成');
        return;
      }

      const animationType = animationTypes[currentIndex];
      console.log(`测试动画: ${animationType}`);
      
      // 切换到农具拼装页面
      GameGlobal.pageManager.switchToPage('toolAssembly', {
        animationType: animationType
      });
      
      // 3秒后返回主页
      setTimeout(() => {
        GameGlobal.pageManager.goBack();
        
        // 2秒后测试下一个动画
        setTimeout(() => {
          currentIndex++;
          testNextAnimation();
        }, 2000);
      }, 3000);
    };

    testNextAnimation();
  }

  /**
   * 测试特定动画
   * @param {string} animationType - 动画类型
   */
  testSpecificAnimation(animationType) {
    if (!this.enabled || !GameGlobal.pageManager) return;

    console.log(`测试特定动画: ${animationType}`);
    
    GameGlobal.pageManager.switchToPage('toolAssembly', {
      animationType: animationType
    });
    
    setTimeout(() => {
      GameGlobal.pageManager.goBack();
    }, 3000);
  }

  /**
   * 显示可用动画列表
   */
  showAvailableAnimations() {
    if (!this.enabled || !GameGlobal.animationManager) return;

    console.log('=== 可用动画列表 ===');
    const presets = GameGlobal.animationManager.presets;
    
    Object.keys(presets).forEach(name => {
      const preset = presets[name];
      console.log(`${name}: ${preset.type} (${preset.duration}ms, ${preset.easing})`);
    });
    
    console.log('==================');
  }

  /**
   * 性能测试
   */
  performanceTest() {
    if (!this.enabled || !GameGlobal.pageManager) return;

    console.log('=== 动画性能测试 ===');
    
    const startTime = Date.now();
    let animationCount = 0;
    
    const testPerformance = () => {
      if (animationCount >= 10) {
        const totalTime = Date.now() - startTime;
        console.log(`性能测试完成: ${animationCount} 次动画, 总耗时 ${totalTime}ms`);
        return;
      }
      
      animationCount++;
      GameGlobal.pageManager.switchToPage('toolAssembly', {
        animationType: 'fade'
      });
      
      setTimeout(() => {
        GameGlobal.pageManager.goBack();
        setTimeout(testPerformance, 500);
      }, 1000);
    };
    
    testPerformance();
  }
}

// 创建全局动画调试实例
const animationDebug = new AnimationDebug();

// 在开发环境下启用调试
if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
  animationDebug.enable();
}

export default animationDebug; 