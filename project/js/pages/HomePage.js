import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';
import { showToast, showSuccessToast, showErrorToast } from '../utils/toast';

/**
 * 主页面
 */
export default class HomePage {
  modules = [];
  buttons = {};
  infoBar = {};
  characterImage = null; // 左下角角色图片

  constructor() {
    this.loadResources();
    this.initModules();
    this.initButtons();
    this.initInfoBar();
  }

  /**
   * 加载资源
   */
  loadResources() {
    // 加载左下角角色图片
    this.characterImage = wx.createImage();
    this.characterImage.src = 'images/bg05.png';
    
    // 添加图片加载错误处理
    this.characterImage.onerror = () => {
      console.warn('角色图片加载失败，将使用默认矩形');
      this.characterImage = null;
    };

    // 加载按钮图片
    this.buttonImages = {};
    
    // 设置按钮图片
    this.buttonImages.settings = wx.createImage();
    this.buttonImages.settings.src = 'images/icon02.jpeg';
    this.buttonImages.settings.onerror = () => {
      console.warn('设置按钮图片加载失败');
      this.buttonImages.settings = null;
    };
    
    // 消息按钮图片
    this.buttonImages.message = wx.createImage();
    this.buttonImages.message.src = 'images/icon04.png';
    this.buttonImages.message.onerror = () => {
      console.warn('消息按钮图片加载失败');
      this.buttonImages.message = null;
    };
    
    // 右侧导航按钮图片
    this.buttonImages.nextPage = wx.createImage();
    this.buttonImages.nextPage.src = 'images/icon05.png';
    this.buttonImages.nextPage.onerror = () => {
      console.warn('导航按钮图片加载失败');
      this.buttonImages.nextPage = null;
    };
    
    // 奖杯图片
    this.buttonImages.trophy = wx.createImage();
    this.buttonImages.trophy.src = 'images/icon03.jpeg';
    this.buttonImages.trophy.onerror = () => {
      console.warn('奖杯图片加载失败');
      this.buttonImages.trophy = null;
    };
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
      // 左上角用户信息（粉色圆角矩形）
      userInfo: {
        x: 20,
        y: 20,
        width: 200,
        height: 60,
        nickname: '可心'
      },
      // 右上角消息按钮（圆形+文字）
      message: {
        x: SCREEN_WIDTH - 200,
        y: 20,
        width: 80,
        height: 40,
        text: '消息',
        icon: '🔔',
        unreadCount: 1
      },
      // 右上角设置按钮（圆形+文字）
      settings: {
        x: SCREEN_WIDTH - 120,
        y: 20,
        width: 80,
        height: 40,
        text: '设置',
        icon: '⚙️'
      },
      // 右侧圆形导航按钮
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
   * 渲染主页面
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  render(ctx) {
    // 绘制绿色渐变背景
    const gradient = ctx.createLinearGradient(0, 0, 0, SCREEN_HEIGHT);
    gradient.addColorStop(0, '#90EE90');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

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

    bar.stats.forEach((stat, index) => {
      const x = bar.x + index * statWidth;
      
      // 绘制白色卡片背景（带圆角和阴影）
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x + 5, bar.y + 5, statWidth - 10, bar.height - 10);
      
      // 添加阴影效果
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      // 绘制图标（如果是奖杯且有图片，使用图片；否则使用文字图标）
      if (stat.label === '奖杯数' && this.buttonImages && this.buttonImages.trophy && 
          this.buttonImages.trophy.complete && this.buttonImages.trophy.naturalWidth !== 0) {
        try {
          // 绘制奖杯图片
          const iconSize = 24;
          const iconX = x + statWidth / 2 - iconSize / 2;
          const iconY = bar.y + 20 - iconSize / 2;
          ctx.drawImage(this.buttonImages.trophy, iconX, iconY, iconSize, iconSize);
        } catch (error) {
          console.warn('奖杯图片绘制失败，使用默认图标:', error);
          // 使用默认文字图标
          ctx.font = '20px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#333333';
          ctx.fillText(stat.icon, x + statWidth / 2, bar.y + 20);
        }
      } else {
        // 使用默认文字图标
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#333333';
        ctx.fillText(stat.icon, x + statWidth / 2, bar.y + 20);
      }

      // 绘制数值
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 18px Arial';
      ctx.fillText(stat.value.toString(), x + statWidth / 2, bar.y + 35);

      // 绘制标签
      ctx.fillStyle = '#666666';
      ctx.font = '12px Arial';
      ctx.fillText(stat.label, x + statWidth / 2, bar.y + 50);
      
      // 重置阴影
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    });
  }

  /**
   * 渲染游戏模块
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  renderModules(ctx) {
    this.modules.forEach(module => {
      // 绘制白色卡片背景（带阴影）
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(module.x, module.y, module.width, module.height);
      
      // 添加阴影效果
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // 绘制模块名称
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(module.name, module.x + module.width / 2, module.y + 20);
      
      // 重置阴影
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
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
      } else if (key === 'nextPage') {
        // 渲染下一页按钮
        this.renderNextPageButton(ctx, button);
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
    // 绘制粉色圆角矩形背景
    ctx.fillStyle = '#FFB6C1';
    ctx.fillRect(userInfo.x, userInfo.y, userInfo.width, userInfo.height);
    
    // 绘制边框
    ctx.strokeStyle = '#87CEEB';
    ctx.lineWidth = 2;
    ctx.strokeRect(userInfo.x, userInfo.y, userInfo.width, userInfo.height);

    // 绘制小猪图标
    ctx.fillStyle = '#FF69B4';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🐷', userInfo.x + 30, userInfo.y + 30);

    // 绘制昵称
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(userInfo.nickname, userInfo.x + 70, userInfo.y + 30);
  }

  /**
   * 渲染下一页按钮
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {Object} button - 按钮对象
   */
  renderNextPageButton(ctx, button) {
    // 如果有导航按钮图片，使用图片；否则使用默认样式
    if (this.buttonImages && this.buttonImages.nextPage && 
        this.buttonImages.nextPage.complete && this.buttonImages.nextPage.naturalWidth !== 0) {
      try {
        // 绘制导航按钮图片
        ctx.drawImage(this.buttonImages.nextPage, button.x, button.y, button.width, button.height);
      } catch (error) {
        console.warn('导航按钮图片绘制失败，使用默认样式:', error);
        this.renderDefaultNextPageButton(ctx, button);
      }
    } else {
      // 使用默认样式
      this.renderDefaultNextPageButton(ctx, button);
    }
  }

  /**
   * 渲染默认下一页按钮样式（绿色圆形）
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {Object} button - 按钮对象
   */
  renderDefaultNextPageButton(ctx, button) {
    // 绘制绿色圆形按钮
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(button.x + button.width / 2, button.y + button.height / 2, button.width / 2, 0, 2 * Math.PI);
    ctx.fill();

    // 绘制白色箭头
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(button.icon, button.x + button.width / 2, button.y + button.height / 2);
  }

  /**
   * 渲染普通按钮
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {Object} button - 按钮对象
   */
  renderNormalButton(ctx, button) {
    // 根据按钮类型获取对应的图片
    const buttonKey = this.getButtonKey(button);
    const buttonImage = this.buttonImages && this.buttonImages[buttonKey];
    
    if (buttonImage && buttonImage.complete && buttonImage.naturalWidth !== 0) {
      try {
        // 绘制按钮图片
        ctx.drawImage(buttonImage, button.x, button.y, button.width, button.height);
        
        // 如果是消息按钮且有未读消息，绘制红点
        if (buttonKey === 'message' && button.unreadCount && button.unreadCount > 0) {
          ctx.fillStyle = '#FF0000';
          ctx.beginPath();
          ctx.arc(button.x + button.width - 5, button.y + 5, 8, 0, 2 * Math.PI);
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(button.unreadCount.toString(), button.x + button.width - 5, button.y + 5);
        }
      } catch (error) {
        console.warn(`${buttonKey}按钮图片绘制失败，使用默认样式:`, error);
        this.renderDefaultButton(ctx, button);
      }
    } else {
      // 图片未加载或加载失败，使用默认样式
      this.renderDefaultButton(ctx, button);
    }
  }

  /**
   * 获取按钮对应的键名
   * @param {Object} button - 按钮对象
   * @returns {string} 按钮键名
   */
  getButtonKey(button) {
    // 根据按钮属性判断类型
    if (button.text === '消息') return 'message';
    if (button.text === '设置') return 'settings';
    if (button.icon === '>') return 'nextPage';
    return 'unknown';
  }

  /**
   * 渲染默认按钮样式（当图片加载失败时）
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {Object} button - 按钮对象
   */
  renderDefaultButton(ctx, button) {
    if (button.text) {
      // 绘制白色圆形按钮
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(button.x + button.width / 2, button.y + button.height / 2, button.width / 2, 0, 2 * Math.PI);
      ctx.fill();
      
      // 绘制边框
      ctx.strokeStyle = '#CCCCCC';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 绘制图标
      ctx.fillStyle = '#333333';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(button.icon, button.x + button.width / 2, button.y + button.height / 2);

      // 绘制文字
      ctx.fillStyle = '#333333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(button.text, button.x + button.width / 2, button.y + button.height + 5);

      // 如果有未读消息，绘制红点
      if (button.unreadCount && button.unreadCount > 0) {
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(button.x + button.width / 2 + 10, button.y + button.height / 2 - 10, 8, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '10px Arial';
        ctx.fillText(button.unreadCount.toString(), button.x + button.width / 2 + 10, button.y + button.height / 2 - 10);
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
    // 绘制左下角角色图片
    if (this.characterImage && this.characterImage.complete && this.characterImage.naturalWidth !== 0) {
      try {
        // 图片位置和大小设置
        const imgX = 6; // 图片X坐标（距离左边20像素）
        const imgY = SCREEN_HEIGHT - 60; // 图片Y坐标（距离底部120像素）
        const imgWidth = 400; // 图片宽度
        const imgHeight = 400; // 图片高度
        
        ctx.drawImage(this.characterImage, imgX, imgY, imgWidth, imgHeight);
      } catch (error) {
        console.warn('角色图片绘制失败，使用默认矩形:', error);
        this.renderDefaultCharacter(ctx);
      }
    } else {
      // 图片未加载或加载失败，使用默认矩形
      this.renderDefaultCharacter(ctx);
    }

    // 绘制对话气泡
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(110, SCREEN_HEIGHT - 140, 250, 60);

    // 绘制对话文字
    ctx.fillStyle = '#333333';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('Hello, 小朋友早上好!', 120, SCREEN_HEIGHT - 130);
    ctx.fillText('快来农耕小天地探索吧', 120, SCREEN_HEIGHT - 110);
  }

  /**
   * 渲染默认角色（当图片加载失败时）
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  renderDefaultCharacter(ctx) {
    // 绘制角色（蓝色矩形）
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(20, SCREEN_HEIGHT - 120, 60, 80);
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
    this.showToast('消息功能开发中...');
  }

  /**
   * 显示用户信息对话框
   */
  showUserInfoDialog() {
    console.log('显示用户信息对话框');
    this.showToast('用户信息功能开发中...');
  }

  /**
   * 显示设置对话框
   */
  showSettingsDialog() {
    console.log('显示设置对话框');
    
    // 使用微信原生模态框显示退出登录确认
    GameGlobal.wechatAPI.showModal({
      title: '设置',
      content: '是否退出登录？',
      showCancel: true,
      cancelText: '取消',
      confirmText: '确认'
    }).then((confirmed) => {
      if (confirmed) {
        console.log('用户确认退出登录');
        this.logout();
      } else {
        console.log('用户取消退出登录');
      }
    }).catch((error) => {
      console.error('显示设置对话框失败:', error);
      this.showToast('操作失败，请重试');
    });
  }

  /**
   * 显示下一页对话框
   */
  showNextPageDialog() {
    console.log('显示下一页对话框');
    this.showToast('敬请期待');
  }

  /**
   * 退出登录
   */
  logout() {
    try {
      console.log('开始退出登录流程...');
      
      // 显示退出中提示
      this.showToast('正在退出登录...');
      
      // 清除数据总线中的用户信息
      GameGlobal.databus.clearUserInfo();
      
      // 清除本地存储的登录信息
      wx.removeStorageSync('loginInfo');
      
      // 跳转到登录页面
      GameGlobal.pageManager.switchToPage('login');
      
      // 显示退出成功提示
      setTimeout(() => {
        this.showToast('已退出登录');
      }, 500);
      
      console.log('退出登录成功');
    } catch (error) {
      console.error('退出登录失败:', error);
      this.showToast('退出登录失败，请重试');
    }
  }

  /**
   * 更新页面
   */
  update() {
    // 更新未读消息数量
    this.buttons.message.unreadCount = GameGlobal.databus.unreadCount || 1;
    
    // 更新用户信息
    if (GameGlobal.databus.userInfo) {
      this.buttons.userInfo.nickname = GameGlobal.databus.userInfo.nickName || '可心';
    }
  }
}
