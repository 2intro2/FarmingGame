import LoginPage from './LoginPage';
import HomePage from './HomePage';
import ToolAssemblyNavPage from './ToolAssemblyNavPage';
import ToolAssemblyPage from './ToolAssemblyPage';
import ThreeDAssemblyPage from './ThreeDAssemblyPage';
import animationManager from '../utils/animationManager';
import VideoLearningPage from './VideoLearningPage';

/**
 * 页面管理器
 * 负责管理不同页面的切换和渲染
 */
export default class PageManager {
  pages = {};
  currentPage = null;
  pageHistory = []; // 页面历史栈
  maxHistorySize = 10; // 最大历史栈大小
  isAnimating = false; // 是否正在动画中
  lastTouchPosition = null; // 记录最后一次触摸位置

  constructor() {
    // 初始化所有页面
    this.pages = {
      login: new LoginPage(),
      home: new HomePage(),
      toolAssemblyNav: new ToolAssemblyNavPage(),
      toolAssembly: new ToolAssemblyPage(),
      threeDAssembly: new ThreeDAssemblyPage(),
      videoLearning: new VideoLearningPage()
    };
    
    // 设置默认页面
    this.currentPage = this.pages.login;
  }

  /**
   * 切换到指定页面（带动画）
   * @param {string} pageName - 页面名称
   * @param {Object} options - 可选参数
   */
  switchToPage(pageName, options = {}) {
    if (GameGlobal.logger) {
      GameGlobal.logger.info(`PageManager.switchToPage被调用`, {
        pageName,
        options,
        pagesAvailable: Object.keys(this.pages),
        currentPage: this.currentPage ? this.currentPage.constructor.name : 'none'
      }, 'pageManager');
    }

    if (this.pages[pageName]) {
      const fromPage = this.currentPage;
      const toPage = this.pages[pageName];

      if (GameGlobal.logger) {
        GameGlobal.logger.info(`页面切换开始`, {
          from: fromPage ? fromPage.constructor.name : 'none',
          to: toPage.constructor.name
        }, 'pageManager');
      }

      // 保存当前页面到历史栈
      if (this.currentPage && options.addToHistory !== false) {
        this.pushToHistory(this.currentPage, pageName);
      }

      // 如果启用了动画且不是首次加载
      if (options.animation !== false && fromPage !== toPage) {
        this.animatePageTransition(fromPage, toPage, options.animationType || 'fade');
      } else {
        // 直接切换页面
        // 隐藏当前页面
        if (fromPage && fromPage.hide && typeof fromPage.hide === 'function') {
          fromPage.hide();
        }
        
        this.currentPage = toPage;
        GameGlobal.databus.switchPage(pageName);
        
        // 显示新页面
        if (toPage && toPage.show && typeof toPage.show === 'function') {
          toPage.show();
        }

        if (GameGlobal.logger) {
          GameGlobal.logger.info(`页面直接切换完成`, {
            newCurrentPage: this.currentPage.constructor.name
          }, 'pageManager');
        }
      }

      // 记录导航日志
      if (GameGlobal.logger) {
        GameGlobal.logger.info(`页面切换: ${pageName}`, {
          from: this.pageHistory.length > 0 ? this.pageHistory[this.pageHistory.length - 1].pageName : 'none',
          to: pageName,
          withAnimation: options.animation !== false
        }, 'navigation');
      }
    } else {
      if (GameGlobal.logger) {
        GameGlobal.logger.error(`页面不存在: ${pageName}`, {
          availablePages: Object.keys(this.pages)
        }, 'pageManager');
      }
    }
  }

  /**
   * 执行页面切换动画
   * @param {Object} fromPage - 源页面
   * @param {Object} toPage - 目标页面
   * @param {string} animationType - 动画类型
   */
  animatePageTransition(fromPage, toPage, animationType = 'fade') {
    this.isAnimating = true;

    // 隐藏当前页面
    if (fromPage && fromPage.hide && typeof fromPage.hide === 'function') {
      fromPage.hide();
    }

    // 创建动画
    const animation = GameGlobal.animationManager.createPresetAnimation(animationType, {
      fromPage: fromPage,
      toPage: toPage,
      onComplete: () => {
        this.isAnimating = false;
        this.currentPage = toPage;
        GameGlobal.databus.switchPage(toPage.constructor.name.toLowerCase().replace('page', ''));
        
        // 显示新页面
        if (toPage && toPage.show && typeof toPage.show === 'function') {
          toPage.show();
        }
      },
      onCancel: () => {
        this.isAnimating = false;
        this.currentPage = toPage;
        GameGlobal.databus.switchPage(toPage.constructor.name.toLowerCase().replace('page', ''));
        
        // 显示新页面
        if (toPage && toPage.show && typeof toPage.show === 'function') {
          toPage.show();
        }
      }
    });

    // 开始动画
    GameGlobal.animationManager.startAnimation(animation);
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
   * 返回上一页（带动画）
   * @returns {boolean} 是否成功返回
   */
  goBack() {
    if (this.pageHistory.length > 0) {
      const lastEntry = this.pageHistory.pop();
      const fromPage = this.currentPage;
      const toPage = lastEntry.page;

      // 执行返回动画（与跳转动画保持一致）
      this.animatePageTransition(fromPage, toPage, 'fade');

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
      canGoBack: this.pageHistory.length > 0,
      isAnimating: this.isAnimating
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
    if (this.isAnimating) {
      // 渲染动画中的页面
      GameGlobal.animationManager.update();

      // 渲染当前页面和目标页面
      if (this.currentPage && this.currentPage.render) {
        this.currentPage.render(ctx);
      }
    } else if (this.currentPage && this.currentPage.render) {
      this.currentPage.render(ctx);
    }

    // 渲染Toast提示
    try {
      const Toast = require('../components/Toast').default;
      Toast.render(ctx);
    } catch (error) {
      if (GameGlobal.logger) {
        GameGlobal.logger.warn('Toast渲染失败', { error: error.message }, 'pageManager');
      }
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
    // 动画期间禁用触摸事件
    if (this.isAnimating) return;

    if (GameGlobal.logger) {
      GameGlobal.logger.debug('PageManager处理触摸事件', {
        currentPage: this.currentPage ? this.currentPage.constructor.name : 'none',
        isAnimating: this.isAnimating
      }, 'pageManager');
    }

    if (this.currentPage && this.currentPage.handleTouch) {
      this.currentPage.handleTouch(event);
    }
  }

  /**
   * 处理触摸开始事件
   * @param {Object} event - 触摸事件对象
   */
  handleTouchStart(event) {
    // 动画期间禁用触摸事件
    if (this.isAnimating) return;

    // 记录触摸位置
    if (event.touches && event.touches.length > 0) {
      const touch = event.touches[0];
      this.lastTouchPosition = { x: touch.clientX, y: touch.clientY };
    }

    if (this.currentPage && this.currentPage.handleTouchStart) {
      this.currentPage.handleTouchStart(event);
    }
  }

  /**
   * 处理触摸移动事件
   * @param {Object} event - 触摸事件对象
   */
  handleTouchMove(event) {
    // 动画期间禁用触摸事件
    if (this.isAnimating) return;

    // 更新触摸位置
    if (event.touches && event.touches.length > 0) {
      const touch = event.touches[0];
      this.lastTouchPosition = { x: touch.clientX, y: touch.clientY };
    }

    if (this.currentPage && this.currentPage.handleTouchMove) {
      this.currentPage.handleTouchMove(event);
    }
  }

  /**
   * 处理触摸结束事件
   * @param {Object} event - 触摸事件对象
   */
  handleTouchEnd(event) {
    // 动画期间禁用触摸事件
    if (this.isAnimating) return;

    if (this.currentPage && this.currentPage.handleTouchEnd) {
      this.currentPage.handleTouchEnd(event);
    }

    // 在触摸结束时也调用handleTouch方法，使用记录的触摸位置
    if (this.currentPage && this.currentPage.handleTouch && this.lastTouchPosition) {
      // 创建一个模拟的触摸事件，包含触摸位置
      const simulatedEvent = {
        ...event,
        touches: [{
          clientX: this.lastTouchPosition.x,
          clientY: this.lastTouchPosition.y
        }]
      };
      this.currentPage.handleTouch(simulatedEvent);
    }
  }
}
