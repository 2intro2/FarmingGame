import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';
import BasePage from './BasePage';
import Toast from '../components/Toast';

/**
 * 主页
 */
export default class HomePage extends BasePage {
  backgroundImage = null;
  modules = [];
  statusBar = {};
  buttons = {};

  constructor() {
    super();
    this.initModules();
    this.initStatusBar();
    this.initButtons();
    this.loadResources();
  }

  /**
   * 初始化模块
   */
  initModules() {
    const moduleWidth = SCREEN_WIDTH * 0.4;
    const moduleHeight = SCREEN_HEIGHT * 0.3;
    const startX = SCREEN_WIDTH * 0.1;
    const startY = SCREEN_HEIGHT * 0.25;

    this.modules = [
      {
        key: 'toolAssemblyNav',
        name: '农具拼装',
        x: startX,
        y: startY,
        width: moduleWidth,
        height: moduleHeight,
        unlocked: true,
        image: null
      },
      {
        key: 'noodleLife',
        name: '面条的一生',
        x: startX + moduleWidth + 20,
        y: startY,
        width: moduleWidth,
        height: moduleHeight,
        unlocked: false,
        image: null
      },
      {
        key: 'emergencyChallenge',
        name: '突发状况挑战',
        x: startX,
        y: startY + moduleHeight + 20,
        width: moduleWidth,
        height: moduleHeight,
        unlocked: false,
        image: null
      },
      {
        key: 'cornGrowth',
        name: '玉米生长过程',
        x: startX + moduleWidth + 20,
        y: startY + moduleHeight + 20,
        width: moduleWidth,
        height: moduleHeight,
        unlocked: false,
        image: null
      }
    ];
  }

  /**
   * 初始化状态栏
   */
  initStatusBar() {
    this.statusBar = {
      x: SCREEN_WIDTH * 0.1,
      y: 20,
      width: SCREEN_WIDTH * 0.8,
      height: 60,
      stats: [
        { label: '进行中的任务', value: GameGlobal.databus.tasksInProgress, icon: '🚀' },
        { label: '已完成任务', value: GameGlobal.databus.tasksCompleted, icon: '✅' },
        { label: '已完成挑战', value: GameGlobal.databus.challengesCompleted, icon: '🎯' },
        { label: '奖杯数', value: GameGlobal.databus.trophyCount, icon: '🏆' }
      ]
    };
  }

  /**
   * 初始化按钮
   */
  initButtons() {
    this.buttons = {
      message: {
        x: SCREEN_WIDTH * 0.8,
        y: 20,
        width: 40,
        height: 40,
        text: '消息',
        unreadCount: 0
      },
      settings: {
        x: SCREEN_WIDTH * 0.9,
        y: 20,
        width: 40,
        height: 40,
        text: '设置'
      }
    };
  }

  /**
   * 加载资源
   */
  loadResources() {
    // 加载背景图片
    this.backgroundImage = wx.createImage();
    this.backgroundImage.onload = () => {
      this.backgroundLoaded = true;
    };
    this.backgroundImage.src = 'images/resource_001.png';
  }

  /**
   * 渲染页面内容
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  renderContent(ctx) {
    // 绘制背景
    if (this.backgroundImage) {
      ctx.drawImage(this.backgroundImage, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    } else {
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    }

    // 渲染状态栏
    this.renderStatusBar(ctx);

    // 渲染游戏模块
    this.renderModules(ctx);

    // 渲染按钮
    this.renderButtons(ctx);

    // 渲染角色
    this.renderCharacter(ctx);
  }

  /**
   * 渲染状态栏
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  renderStatusBar(ctx) {
    const bar = this.statusBar;
    const statWidth = bar.width / bar.stats.length;

    bar.stats.forEach((stat, index) => {
      const x = bar.x + index * statWidth;
      
      // 绘制统计项背景
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(x, bar.y, statWidth - 10, bar.height);

      // 绘制图标
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(stat.icon, x + (statWidth - 10) / 2, bar.y + 20);

      // 绘制数值
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 18px Arial';
      ctx.fillText(stat.value.toString(), x + (statWidth - 10) / 2, bar.y + 35);

      // 绘制标签
      ctx.fillStyle = '#666666';
      ctx.font = '12px Arial';
      ctx.fillText(stat.label, x + (statWidth - 10) / 2, bar.y + 50);
    });
  }

  /**
   * 渲染游戏模块
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  renderModules(ctx) {
    this.modules.forEach(module => {
      // 绘制模块背景
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(module.x, module.y, module.width, module.height);

      // 绘制模块名称
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(module.name, module.x + module.width / 2, module.y + 10);

      // 如果模块未解锁，绘制锁图标
      if (!module.unlocked) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(module.x + 10, module.y + 10, 30, 30);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🔒', module.x + 25, module.y + 25);
      }
    });
  }

  /**
   * 渲染按钮
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  renderButtons(ctx) {
    Object.entries(this.buttons).forEach(([key, button]) => {
      
      // 绘制按钮背景
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(button.x, button.y, button.width, button.height);

      // 绘制按钮边框
      ctx.strokeStyle = '#CCCCCC';
      ctx.lineWidth = 1;
      ctx.strokeRect(button.x, button.y, button.width, button.height);

      // 绘制按钮文字
      ctx.fillStyle = '#333333';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(button.text, button.x + button.width / 2, button.y + button.height / 2);

      // 绘制未读消息数量（仅对消息按钮）
      if (key === 'message' && button.unreadCount > 0) {
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(button.x + button.width - 5, button.y + 5, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '10px Arial';
        ctx.fillText(button.unreadCount.toString(), button.x + button.width - 5, button.y + 5);
      }
    });
  }

  /**
   * 渲染角色和对话气泡
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  renderCharacter(ctx) {
    // 绘制角色（简化版本）
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(20, SCREEN_HEIGHT - 100, 60, 80);

    // 绘制对话气泡
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(90, SCREEN_HEIGHT - 120, 200, 60);

    // 绘制对话文字
    ctx.fillStyle = '#333333';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('Hello, 小朋友早上好!', 100, SCREEN_HEIGHT - 110);
    ctx.fillText('快来农耕小天地探索吧', 100, SCREEN_HEIGHT - 90);
  }

  /**
   * 处理触摸事件
   * @param {Object} event - 触摸事件对象
   */
  handleTouch(event) {
    // 检查是否有触摸点
    if (!event.touches || event.touches.length === 0) {
      if (GameGlobal.logger) {
        GameGlobal.logger.debug('触摸事件没有触摸点', { event }, 'homepage');
      }
      return;
    }

    const touch = event.touches[0];
    const x = touch.clientX;
    const y = touch.clientY;

    if (GameGlobal.logger) {
      GameGlobal.logger.debug(`触摸事件: (${x}, ${y})`, null, 'homepage');
    }

    // 检查游戏模块点击
    this.modules.forEach(module => {
      if (x >= module.x && x <= module.x + module.width &&
          y >= module.y && y <= module.y + module.height) {
        if (GameGlobal.logger) {
          GameGlobal.logger.info(`点击模块: ${module.name}`, {
            module: module.key,
            position: { x: module.x, y: module.y, width: module.width, height: module.height },
            touch: { x, y }
          }, 'homepage');
        }
        this.handleModuleClick(module);
      }
    });

    // 检查按钮点击
    Object.entries(this.buttons).forEach(([key, button]) => {
      if (x >= button.x && x <= button.x + button.width &&
          y >= button.y && y <= button.y + button.height) {
        if (GameGlobal.logger) {
          GameGlobal.logger.info(`点击按钮: ${key}`, null, 'homepage');
        }
        this.handleButtonClick(key);
      }
    });
  }

  /**
   * 处理模块点击
   * @param {Object} module - 模块对象
   */
  handleModuleClick(module) {
    if (GameGlobal.logger) {
      GameGlobal.logger.info(`模块点击: ${module.key} - ${module.name}`, null, 'homepage');
    }
    
    if (module.unlocked) {
      if (module.key === 'toolAssemblyNav') {
        if (GameGlobal.logger) {
          GameGlobal.logger.info('尝试切换到农具拼装导航页', null, 'homepage');
        }
        
        // 检查PageManager是否存在
        if (!GameGlobal.pageManager) {
          if (GameGlobal.logger) {
            GameGlobal.logger.error('PageManager不存在', null, 'homepage');
          }
          this.showToast('页面管理器未初始化');
          return;
        }
        
        // 检查目标页面是否存在
        if (!GameGlobal.pageManager.pages.toolAssemblyNav) {
          if (GameGlobal.logger) {
            GameGlobal.logger.error('toolAssemblyNav页面不存在', null, 'homepage');
          }
          this.showToast('目标页面未找到');
          return;
        }
        
        try {
          // 直接切换页面，不使用动画
          GameGlobal.pageManager.switchToPage('toolAssemblyNav', { animation: false });
          this.showToast('进入农具拼装');
          if (GameGlobal.logger) {
            GameGlobal.logger.info('页面切换成功', null, 'homepage');
          }
        } catch (error) {
          if (GameGlobal.logger) {
            GameGlobal.logger.error('页面切换失败', error, 'homepage');
          }
          this.showToast('页面切换失败');
        }
      }
    } else {
      this.showToast('活动未开启');
    }
  }

  /**
   * 处理按钮点击
   * @param {string} buttonKey - 按钮键名
   */
  handleButtonClick(buttonKey) {
    switch (buttonKey) {
      case 'message':
        this.showMessageDialog();
        break;
      case 'settings':
        this.showSettingsDialog();
        break;
    }
  }

  /**
   * 显示Toast提示
   * @param {string} message - 提示信息
   */
  showToast(message) {
    // 调用Toast组件显示提示
    Toast.show(message);
  }

  /**
   * 显示消息对话框
   */
  showMessageDialog() {
    console.log('显示消息对话框');
  }

  /**
   * 显示设置对话框
   */
  showSettingsDialog() {
    console.log('显示设置对话框');
  }

  /**
   * 更新页面
   */
  update() {
    // 更新未读消息数量
    this.buttons.message.unreadCount = GameGlobal.databus.unreadCount;
    
  }
}
