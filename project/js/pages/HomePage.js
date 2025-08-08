import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';
import { showToast, showSuccessToast, showErrorToast } from '../utils/toast';

/**
 * 主页面
 */
export default class HomePage {
  backgroundImage = null;
  modules = [];
  buttons = {};
  infoBar = {};

  constructor() {
    this.initModules();
    this.initButtons();
    this.initInfoBar();
    this.loadResources();
  }

  /**
   * 初始化游戏模块
   */
  initModules() {
    const moduleWidth = SCREEN_WIDTH * 0.4;
    const moduleHeight = SCREEN_HEIGHT * 0.25;
    const startX = SCREEN_WIDTH * 0.1;
    const startY = SCREEN_HEIGHT * 0.35; // 为信息栏留出空间

    this.modules = [
      {
        key: 'toolAssembly',
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
   * 初始化信息栏
   */
  initInfoBar() {
    this.infoBar = {
      x: 20,
      y: 100, // 在用户信息下方
      width: SCREEN_WIDTH - 40,
      height: 60,
      stats: [
        { label: '进行中的任务', value: GameGlobal.databus.tasksInProgress || 1, icon: '🚀' },
        { label: '已完成任务', value: GameGlobal.databus.tasksCompleted || 10, icon: '✅' },
        { label: '已完成挑战', value: GameGlobal.databus.challengesCompleted || 4, icon: '🎯' },
        { label: '奖杯数', value: GameGlobal.databus.trophyCount || 5, icon: '🏆' }
      ]
    };
  }

  /**
   * 初始化按钮
   */
  initButtons() {
    this.buttons = {
      // 左上角用户信息
      userInfo: {
        x: 20,
        y: 20,
        width: 200,
        height: 60,
        avatar: null,
        nickname: '用户'
      },
      // 奖杯按钮（在用户信息右边）
      trophy: {
        x: 240, // 用户信息右边一点点的距离
        y: 20,
        width: 100,
        height: 40,
        icon: '🏆',
        count: 10
      },
      // 右上角消息按钮（文字+图标）
      message: {
        x: SCREEN_WIDTH - 200,
        y: 20,
        width: 80,
        height: 40,
        text: '消息',
        icon: '💬',
        unreadCount: 0
      },
      // 右上角设置按钮（文字+图标）
      settings: {
        x: SCREEN_WIDTH - 120,
        y: 20,
        width: 80,
        height: 40,
        text: '设置',
        icon: '⚙️'
      },
      // 页面右边圆形按钮
      nextPage: {
        x: SCREEN_WIDTH - 80,
        y: SCREEN_HEIGHT / 2 - 30,
        width: 60,
        height: 60,
        icon: '>'
      }
    };
  }

  /**
   * 加载资源
   */
  loadResources() {
    // 加载背景图片
    this.backgroundImage = wx.createImage();
    this.backgroundImage.src = 'images/bg01.png';
    
    // 加载水印图片
    this.watermarkImage = wx.createImage();
    this.watermarkImage.src = 'images/003.png';
    
    // 加载左下角图标
    this.characterImage = wx.createImage();
    this.characterImage.src = 'images/bg05.png';
  }

  /**
   * 渲染主页面
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  render(ctx) {
    // 绘制背景
    if (this.backgroundImage && this.backgroundImage.complete) {
      ctx.drawImage(this.backgroundImage, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    } else {
      // 如果图片未加载完成，绘制默认背景
      ctx.fillStyle = '#90EE90';
      ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    }

    // 绘制信息栏
    this.renderInfoBar(ctx);

    // 绘制游戏模块
    this.renderModules(ctx);

    // 绘制按钮
    this.renderButtons(ctx);

    // 绘制角色和对话气泡
    this.renderCharacter(ctx);
  }



  /**
   * 渲染信息栏
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  renderInfoBar(ctx) {
    const bar = this.infoBar;
    const statWidth = bar.width / bar.stats.length;

    // 绘制信息栏背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(bar.x, bar.y, bar.width, bar.height);

    bar.stats.forEach((stat, index) => {
      const x = bar.x + index * statWidth;
      
      // 绘制图标
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#333333';
      ctx.fillText(stat.icon, x + statWidth / 2, bar.y + 20);

      // 绘制数值
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 18px Arial';
      ctx.fillText(stat.value.toString(), x + statWidth / 2, bar.y + 35);

      // 绘制标签
      ctx.fillStyle = '#666666';
      ctx.font = '12px Arial';
      ctx.fillText(stat.label, x + statWidth / 2, bar.y + 50);
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

      // 绘制水印（003.png）
      if (this.watermarkImage && this.watermarkImage.complete) {
        const watermarkSize = 40;
        ctx.drawImage(
          this.watermarkImage, 
          module.x + 10, 
          module.y + 10, 
          watermarkSize, 
          watermarkSize
        );
      }

      // 绘制模块名称
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(module.name, module.x + module.width / 2, module.y + 60);
    });
  }

  /**
   * 渲染按钮
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  renderButtons(ctx) {
    Object.entries(this.buttons).forEach(([key, button]) => {
      if (key === 'userInfo') {
        // 渲染用户信息
        this.renderUserInfo(ctx, button);
      } else if (key === 'trophy') {
        // 渲染奖杯按钮
        this.renderTrophyButton(ctx, button);
      } else {
        // 渲染普通按钮
        this.renderNormalButton(ctx, button);
      }
    });
  }

  /**
   * 渲染用户信息
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {Object} userInfo - 用户信息对象
   */
  renderUserInfo(ctx, userInfo) {
    // 绘制用户信息背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(userInfo.x, userInfo.y, userInfo.width, userInfo.height);

    // 绘制头像（默认圆形）
    ctx.fillStyle = '#87CEEB';
    ctx.beginPath();
    ctx.arc(userInfo.x + 30, userInfo.y + 30, 25, 0, 2 * Math.PI);
    ctx.fill();

    // 绘制头像边框
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 绘制头像内部装饰
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👤', userInfo.x + 30, userInfo.y + 30);

    // 绘制昵称
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(userInfo.nickname, userInfo.x + 70, userInfo.y + 30);
  }

  /**
   * 渲染奖杯按钮
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {Object} trophy - 奖杯按钮对象
   */
  renderTrophyButton(ctx, trophy) {
    // 绘制奖杯按钮背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(trophy.x, trophy.y, trophy.width, trophy.height);

    // 绘制奖杯图标
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(trophy.icon, trophy.x + 20, trophy.y + 20);

    // 绘制奖杯数量
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(trophy.count.toString(), trophy.x + 60, trophy.y + 20);
  }

  /**
   * 渲染普通按钮
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {Object} button - 按钮对象
   */
  renderNormalButton(ctx, button) {
    if (button.text) {
      // 绘制文字+图标按钮
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(button.x, button.y, button.width, button.height);

      ctx.fillStyle = '#333333';
      ctx.font = '14px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(button.text, button.x + 10, button.y + button.height / 2);

      // 绘制图标
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(button.icon, button.x + button.width - 20, button.y + button.height / 2);

      // 如果有未读消息，绘制红点
      if (button.unreadCount && button.unreadCount > 0) {
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(button.x + button.width - 25, button.y + 5, 8, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '10px Arial';
        ctx.fillText(button.unreadCount.toString(), button.x + button.width - 25, button.y + 5);
      }
    } else {
      // 绘制圆形按钮（如nextPage）
      ctx.fillStyle = '#4CAF50';
      ctx.beginPath();
      ctx.arc(button.x + button.width / 2, button.y + button.height / 2, button.width / 2, 0, 2 * Math.PI);
      ctx.fill();

      // 绘制图标
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(button.icon, button.x + button.width / 2, button.y + button.height / 2);
    }
  }

  /**
   * 渲染角色和对话气泡
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  renderCharacter(ctx) {
    // 绘制角色图标（icon.png）
    if (this.characterImage && this.characterImage.complete) {
      ctx.drawImage(this.characterImage, 20, SCREEN_HEIGHT - 100, 60, 80);
    } else {
      // 如果图片未加载完成，绘制默认图标
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(20, SCREEN_HEIGHT - 100, 60, 80);
    }

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
    const touch = event.touches[0];
    const x = touch.clientX;
    const y = touch.clientY;

    console.log('触摸位置:', x, y);

    // 检查游戏模块点击
    this.modules.forEach(module => {
      const isInModule = x >= module.x && x <= module.x + module.width &&
                        y >= module.y && y <= module.y + module.height;
      
      if (isInModule) {
        console.log('点击模块:', module.name, '位置:', module.x, module.y, module.width, module.height);
        this.handleModuleClick(module);
      }
    });

    // 检查按钮点击
    Object.entries(this.buttons).forEach(([key, button]) => {
      const isInButton = x >= button.x && x <= button.x + button.width &&
                        y >= button.y && y <= button.y + button.height;
      
      if (isInButton) {
        console.log('点击按钮:', key);
        this.handleButtonClick(key);
      }
    });
  }

  /**
   * 处理模块点击
   * @param {Object} module - 模块对象
   */
  handleModuleClick(module) {
    console.log('点击模块:', module.key, '解锁状态:', module.unlocked);
    
    if (module.unlocked) {
      if (module.key === 'toolAssembly') {
        GameGlobal.pageManager.switchToPage('toolAssembly');
        this.showToast('进入农具拼装');
      }
    } else {
      console.log('显示活动未开启提示');
      this.showToast('活动未开启');
    }
  }

  /**
   * 处理按钮点击
   * @param {string} buttonKey - 按钮键名
   */
  handleButtonClick(buttonKey) {
    switch (buttonKey) {
      case 'userInfo':
        this.showUserInfoDialog();
        break;
      case 'trophy':
        this.showTrophyDialog();
        break;
      case 'message':
        this.showMessageDialog();
        break;
      case 'settings':
        this.showSettingsDialog();
        break;
      case 'nextPage':
        this.showNextPageDialog();
        break;
    }
  }

  /**
   * 显示Toast提示
   * @param {string} message - 提示信息
   */
  showToast(message) {
    console.log('尝试显示Toast:', message);
    
    // 使用导入的showToast函数
    const { showToast: showToastUtil } = require('../utils/toast');
    showToastUtil(message);
    
    // 同时使用微信原生Toast作为备用
    if (GameGlobal.wechatAPI) {
      GameGlobal.wechatAPI.showToast(message);
    }
  }

  /**
   * 显示消息对话框
   */
  showMessageDialog() {
    console.log('显示消息对话框');
  }

  /**
   * 显示用户信息对话框
   */
  showUserInfoDialog() {
    console.log('显示用户信息对话框');
    this.showToast('用户信息功能开发中...');
  }

  /**
   * 显示奖杯对话框
   */
  showTrophyDialog() {
    console.log('显示奖杯对话框');
    this.showToast(`当前奖杯数：${this.buttons.trophy.count}`);
  }

  /**
   * 显示设置对话框
   */
  showSettingsDialog() {
    console.log('显示设置对话框');
  }

  /**
   * 显示下一页对话框
   */
  showNextPageDialog() {
    console.log('显示下一页对话框');
    this.showToast('敬请期待');
  }

  /**
   * 更新页面
   */
  update() {
    // 更新未读消息数量
    this.buttons.message.unreadCount = GameGlobal.databus.unreadCount;
    
    // 更新用户信息
    if (GameGlobal.databus.userInfo) {
      this.buttons.userInfo.nickname = GameGlobal.databus.userInfo.nickName || '用户';
    }
  }
}
