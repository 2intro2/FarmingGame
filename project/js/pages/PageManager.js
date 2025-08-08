import LoginPage from './LoginPage';
import HomePage from './HomePage';
import ToolAssemblyPage from './ToolAssemblyPage';

/**
 * 页面管理器
 * 负责管理不同页面的切换和渲染
 */
export default class PageManager {
  pages = {};
  currentPage = null;
  pageHistory = []; // 页面历史栈
  maxHistorySize = 10; // 最大历史栈大小

  constructor() {
    // 初始化所有页面
    this.pages = {
      login: new LoginPage(),
      home: new HomePage(),
      toolAssembly: new ToolAssemblyPage()
    };
    
    // 设置默认页面
    this.currentPage = this.pages.login;
  }

  /**
   * 切换到指定页面（添加到历史栈）
   * @param {string} pageName - 页面名称
   * @param {Object} options - 可选参数
   */
  switchToPage(pageName, options = {}) {
    if (this.pages[pageName]) {
      // 保存当前页面到历史栈
      if (this.currentPage && options.addToHistory !== false) {
        this.pushToHistory(this.currentPage, pageName);
      }
      
      // 切换到新页面
      this.currentPage = this.pages[pageName];
      
      // 通知数据总线页面切换
      GameGlobal.databus.switchPage(pageName);
      
      // 记录导航日志
      if (GameGlobal.logger) {
        GameGlobal.logger.info(`页面切换: ${pageName}`, { 
          from: this.pageHistory.length > 0 ? this.pageHistory[this.pageHistory.length - 1].pageName : 'none',
          to: pageName 
        }, 'navigation');
      }
    }
  }

  /**
   * 添加页面到历史栈
   * @param {Object} page - 页面对象
   * @param {string} pageName - 页面名称
   */
  pushToHistory(page, pageName) {
    const historyEntry = {
      page: page,
      pageName: pageName,
      timestamp: Date.now()
    };
    
    this.pageHistory.push(historyEntry);
    
    // 限制历史栈大小
    if (this.pageHistory.length > this.maxHistorySize) {
      this.pageHistory.shift();
    }
  }

  /**
   * 返回上一页
   * @returns {boolean} 是否成功返回
   */
  goBack() {
    if (this.pageHistory.length > 0) {
      const lastEntry = this.pageHistory.pop();
      this.currentPage = lastEntry.page;
      
      // 通知数据总线页面切换
      GameGlobal.databus.switchPage(lastEntry.pageName);
      
      // 记录返回日志
      if (GameGlobal.logger) {
        GameGlobal.logger.info(`返回上一页: ${lastEntry.pageName}`, { 
          from: this.currentPage.constructor.name,
          to: lastEntry.pageName 
        }, 'navigation');
      }
      
      return true;
    }
    return false;
  }

  /**
   * 获取历史栈信息
   * @returns {Object} 历史栈信息
   */
  getHistoryInfo() {
    return {
      currentPage: this.currentPage ? this.currentPage.constructor.name : 'none',
      historySize: this.pageHistory.length,
      maxSize: this.maxHistorySize,
      canGoBack: this.pageHistory.length > 0
    };
  }

  /**
   * 清空历史栈
   */
  clearHistory() {
    this.pageHistory = [];
    if (GameGlobal.logger) {
      GameGlobal.logger.info('清空导航历史', null, 'navigation');
    }
  }

  /**
   * 渲染当前页面
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  render(ctx) {
    if (this.currentPage && this.currentPage.render) {
      this.currentPage.render(ctx);
    }
  }

  /**
   * 更新当前页面
   */
  update() {
    if (this.currentPage && this.currentPage.update) {
      this.currentPage.update();
    }
  }

  /**
   * 处理触摸事件
   * @param {Object} event - 触摸事件对象
   */
  handleTouch(event) {
    if (this.currentPage && this.currentPage.handleTouch) {
      this.currentPage.handleTouch(event);
    }
  }
}
