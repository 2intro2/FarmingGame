import './render'; // 初始化Canvas
import DataBus from './databus'; // 导入数据类，用于管理游戏状态和数据
import PageManager from './pages/PageManager'; // 导入页面管理器
import WechatAPI from './utils/wechat'; // 导入微信API工具
import errorHandler from './utils/errorHandler'; // 导入错误处理工具
import logger from './utils/logger'; // 导入日志系统
import navigationDebug from './utils/navigationDebug'; // 导入导航调试工具

const ctx = canvas.getContext('2d'); // 获取canvas的2D绘图上下文

GameGlobal.databus = new DataBus(); // 全局数据管理，用于管理游戏状态和数据
GameGlobal.pageManager = new PageManager(); // 全局页面管理器
GameGlobal.wechatAPI = new WechatAPI(); // 全局微信API管理实例
GameGlobal.errorHandler = errorHandler; // 全局错误处理器
GameGlobal.logger = logger; // 全局日志系统
GameGlobal.navigationDebug = navigationDebug; // 全局导航调试工具

/**
 * 游戏主函数
 */
export default class Main {
  aniId = 0; // 用于存储动画帧的ID
  isRunning = false; // 游戏运行状态

  constructor() {
    // 初始化游戏
    this.init();
  }

  /**
   * 初始化游戏
   */
  init() {
    try {
      logger.info('游戏开始初始化', null, 'main');
      
      // 检查登录状态
      this.checkLoginStatus();
      
      // 开始游戏循环
      this.start();
      
      logger.info('游戏初始化完成', null, 'main');
    } catch (error) {
      logger.error('游戏初始化失败', error, 'main');
      errorHandler.handleError(error, 'game-init');
    }
  }

  /**
   * 检查登录状态
   */
  checkLoginStatus() {
    try {
      logger.info('检查登录状态', null, 'main');
      
      // 检查本地存储的登录状态
      const loginInfo = wx.getStorageSync('loginInfo');
      if (loginInfo && loginInfo.isLoggedIn) {
        // 已登录，直接进入主页
        logger.info('用户已登录，进入主页', null, 'main');
        GameGlobal.pageManager.switchToPage('home');
      } else {
        // 未登录，进入登录页
        logger.info('用户未登录，进入登录页', null, 'main');
        GameGlobal.pageManager.switchToPage('login');
      }
    } catch (error) {
      logger.error('检查登录状态失败', error, 'main');
      errorHandler.handleError(error, 'login-check');
      // 出错时默认进入登录页
      GameGlobal.pageManager.switchToPage('login');
    }
  }

  /**
   * 开始游戏循环
   */
  start() {
    if (this.isRunning) {
      return;
    }
    
    this.isRunning = true;
    cancelAnimationFrame(this.aniId); // 清除上一局的动画
    this.aniId = requestAnimationFrame(this.loop.bind(this)); // 开始新的动画循环
  }

  /**
   * 停止游戏循环
   */
  stop() {
    this.isRunning = false;
    if (this.aniId) {
      cancelAnimationFrame(this.aniId);
      this.aniId = 0;
    }
  }

  /**
   * canvas重绘函数
   * 每一帧重新绘制所有的需要展示的元素
   */
  render() {
    try {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // 清空画布

      // 渲染当前页面
      if (GameGlobal.pageManager && GameGlobal.pageManager.currentPage) {
        GameGlobal.pageManager.render(ctx);
      } else {
        // 如果页面管理器未初始化，显示错误页面
        this.renderErrorPage(ctx);
      }
    } catch (error) {
      logger.error('渲染失败', error, 'main');
      errorHandler.handleError(error, 'render');
      console.error('渲染失败:', error);
      this.renderErrorPage(ctx);
    }
  }

  /**
   * 渲染错误页面
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  renderErrorPage(ctx) {
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('游戏加载失败，请重新启动', canvas.width / 2, canvas.height / 2);
  }

  // 游戏逻辑更新主函数
  update() {
    try {
      GameGlobal.databus.frame++; // 增加帧数

      // 更新当前页面
      if (GameGlobal.pageManager && GameGlobal.pageManager.currentPage) {
        GameGlobal.pageManager.update();
      }
    } catch (error) {
      console.error('更新失败:', error);
      this.handleError(error);
    }
  }

  // 实现游戏帧循环
  loop() {
    if (!this.isRunning) {
      return;
    }

    try {
      this.update(); // 更新游戏逻辑
      this.render(); // 渲染游戏画面

      // 请求下一帧动画
      this.aniId = requestAnimationFrame(this.loop.bind(this));
    } catch (error) {
      console.error('游戏循环错误:', error);
      this.handleError(error);
    }
  }

  /**
   * 处理错误
   * @param {Error} error - 错误对象
   */
  handleError(error) {
    console.error('游戏错误:', error);
    
    // 显示错误提示
    if (GameGlobal.wechatAPI) {
      GameGlobal.wechatAPI.showToast('游戏出现错误，请重试', { type: 'error' });
    }
    
    // 尝试重新启动游戏
    setTimeout(() => {
      this.restart();
    }, 3000);
  }

  /**
   * 重启游戏
   */
  restart() {
    try {
      this.stop();
      this.init();
    } catch (error) {
      console.error('重启游戏失败:', error);
    }
  }
}
