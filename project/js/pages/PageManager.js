import LoginPage from './LoginPage';
import HomePage from './HomePage';
import ToolAssemblyPage from './ToolAssemblyPage';
import VideoLearningPage from './VideoLearningPage';
import ThreeDAssemblyPage from './ThreeDAssemblyPage';

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
      threeDAssembly: new ThreeDAssemblyPage()
    };
    
    // 设置默认页面
    this.currentPage = this.pages.login;
  }

  /**
   * 切换到指定页面
   * @param {string} pageName - 页面名称
   */
  switchToPage(pageName) {
    // 如果页面不存在，则创建页面
    if (!this.pages[pageName]) {
      this.createPage(pageName);
    }

    if (this.pages[pageName]) {
      // 隐藏当前页面
      if (this.currentPage && this.currentPage.hide) {
        this.currentPage.hide();
      }

      // 切换到新页面
      this.currentPage = this.pages[pageName];

      // 显示新页面
      if (this.currentPage && this.currentPage.show) {
        this.currentPage.show();
      }

      // 通知数据总线页面切换
      GameGlobal.databus.switchPage(pageName);
    }
  }

  /**
   * 创建页面
   * @param {string} pageName - 页面名称
   */
  createPage(pageName) {
    switch (pageName) {
      case 'home':
        this.pages[pageName] = new HomePage();
        break;
      case 'toolAssembly':
        this.pages[pageName] = new ToolAssemblyPage();
        break;
      case 'videoLearning':
        this.pages[pageName] = new VideoLearningPage();
        break;
      case 'login':
        if (!this.pages[pageName]) {
          this.pages[pageName] = new LoginPage();
        }
        break;
      default:
        console.warn('未知页面:', pageName);
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

  handleTouchMove(event) {
    if (this.currentPage && this.currentPage.handleTouchMove) {
      this.currentPage.handleTouchMove(event);
    }
  }

  handleTouchEnd(event) {
    if (this.currentPage && this.currentPage.handleTouchEnd) {
      this.currentPage.handleTouchEnd(event);
    }
  }
}
