import LoginPage from './LoginPage';
import HomePage from './HomePage';
import ToolAssemblyPage from './ToolAssemblyPage';
import VideoLearningPage from './VideoLearningPage';

/**
 * 页面管理器
 * 负责管理不同页面的切换和渲染
 */
export default class PageManager {
  pages = {};
  currentPage = null;

  constructor() {
    // 初始化所有页面
    this.pages = {
      login: new LoginPage(),
      home: new HomePage(),
      toolAssembly: new ToolAssemblyPage(),
      videoLearning: new VideoLearningPage()
    };
    
    // 设置默认页面
    this.currentPage = this.pages.login;
  }

  /**
   * 切换到指定页面
   * @param {string} pageName - 页面名称
   */
  switchToPage(pageName) {
    if (this.pages[pageName]) {
      this.currentPage = this.pages[pageName];
      // 通知数据总线页面切换
      GameGlobal.databus.switchPage(pageName);
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
