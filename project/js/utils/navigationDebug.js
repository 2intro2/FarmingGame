/**
 * 导航调试工具
 * 用于查看和调试导航历史状态
 */
class NavigationDebug {
  constructor() {
    this.enabled = false;
  }

  /**
   * 启用调试模式
   */
  enable() {
    this.enabled = true;
    console.log('导航调试模式已启用');
  }

  /**
   * 禁用调试模式
   */
  disable() {
    this.enabled = false;
    console.log('导航调试模式已禁用');
  }

  /**
   * 打印当前导航状态
   */
  printNavigationStatus() {
    if (!this.enabled) return;

    console.log('=== 导航状态调试 ===');
    
    if (GameGlobal.pageManager) {
      const historyInfo = GameGlobal.pageManager.getHistoryInfo();
      console.log('PageManager状态:', historyInfo);
    }
    
    if (GameGlobal.databus) {
      const navInfo = GameGlobal.databus.getNavigationInfo();
      console.log('DataBus状态:', navInfo);
    }
    
    console.log('==================');
  }

  /**
   * 打印导航历史栈
   */
  printHistoryStack() {
    if (!this.enabled) return;

    console.log('=== 导航历史栈 ===');
    
    if (GameGlobal.pageManager && GameGlobal.pageManager.pageHistory) {
      GameGlobal.pageManager.pageHistory.forEach((entry, index) => {
        console.log(`${index + 1}. ${entry.pageName} (${new Date(entry.timestamp).toLocaleTimeString()})`);
      });
    }
    
    console.log('==================');
  }

  /**
   * 清空导航历史
   */
  clearHistory() {
    if (GameGlobal.pageManager) {
      GameGlobal.pageManager.clearHistory();
      console.log('导航历史已清空');
    }
  }

  /**
   * 测试导航功能
   */
  testNavigation() {
    if (!this.enabled) return;

    console.log('=== 导航功能测试 ===');
    
    // 测试页面切换
    if (GameGlobal.pageManager) {
      console.log('测试页面切换到 home');
      GameGlobal.pageManager.switchToPage('home');
      
      setTimeout(() => {
        console.log('测试页面切换到 toolAssembly');
        GameGlobal.pageManager.switchToPage('toolAssembly');
        
        setTimeout(() => {
          console.log('测试返回上一页');
          GameGlobal.pageManager.goBack();
          
          setTimeout(() => {
            console.log('测试再次返回');
            GameGlobal.pageManager.goBack();
            this.printNavigationStatus();
          }, 1000);
        }, 1000);
      }, 1000);
    }
  }
}

// 创建全局导航调试实例
const navigationDebug = new NavigationDebug();

// 在开发环境下启用调试
if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
  navigationDebug.enable();
}

export default navigationDebug; 